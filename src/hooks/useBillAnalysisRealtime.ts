import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BillAnalysis } from './useBillData';

export type AnalysisState = 'NONE' | 'CURRENT' | 'STALE' | 'RUNNING' | 'ERROR';

export interface AnalysisStateManager {
  state: AnalysisState;
  analysis: BillAnalysis | null;
  isButtonDisabled: boolean;
  buttonText: string;
  statusBadge: { text: string; variant: 'default' | 'destructive' | 'secondary' } | null;
  startAnalysis: () => Promise<void>;
  error: string | null;
}

export const useBillAnalysisRealtime = (
  billId: string, 
  lastActionDate: string | null
): AnalysisStateManager => {
  const [state, setState] = useState<AnalysisState>('NONE');
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  
  const pollTimeoutRef = useRef<NodeJS.Timeout>();
  const errorTimeoutRef = useRef<NodeJS.Timeout>();
  const realtimeChannelRef = useRef<any>();

  // Determine if analysis is stale
  const isAnalysisStale = (analysis: BillAnalysis, lastActionDate: string | null): boolean => {
    if (!lastActionDate || !analysis.created_at) return false;
    
    const analysisDate = new Date(analysis.created_at).toISOString().split('T')[0];
    const actionDate = new Date(lastActionDate).toISOString().split('T')[0];
    
    return analysisDate < actionDate;
  };

  // Determine current state based on analysis and last action date
  const determineState = (analysis: BillAnalysis | null, lastActionDate: string | null): AnalysisState => {
    if (!analysis) return 'NONE';
    if (isAnalysisStale(analysis, lastActionDate)) return 'STALE';
    return 'CURRENT';
  };

  // Fetch latest analysis
  const fetchLatestAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('simple_bill_analysis')
        .select('*')
        .eq('bill_id', billId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const newAnalysis = data || null;
      setAnalysis(newAnalysis);

      if (state === 'RUNNING' && newAnalysis) {
        // Clear polling and error timeouts
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      }

      const newState = determineState(newAnalysis, lastActionDate);
      setState(newState);

    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    if (!billId) return;

    // Initial fetch
    fetchLatestAnalysis();

    // Setup realtime channel
    const channel = supabase
      .channel(`analysis:${billId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'simple_bill_analysis',
          filter: `bill_id=eq.${billId}`
        },
        (payload) => {
          const newAnalysis = payload.new as BillAnalysis;
          
          // Only update if this is newer than current analysis
          if (!analysis || new Date(newAnalysis.created_at) > new Date(analysis.created_at)) {
            setAnalysis(newAnalysis);
            
            // Clear timeouts when new analysis arrives
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            
            const newState = determineState(newAnalysis, lastActionDate);
            setState(newState);
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [billId]);

  // Update state when lastActionDate changes
  useEffect(() => {
    if (analysis) {
      const newState = determineState(analysis, lastActionDate);
      setState(newState);
    }
  }, [lastActionDate, analysis]);

  // Start analysis function
  const startAnalysis = async () => {
    if (isStarting || state === 'RUNNING' || state === 'CURRENT') return;

    try {
      setIsStarting(true);
      setError(null);
      setState('RUNNING');

      const response = await fetch('/functions/v1/start_bill_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ bill_id: billId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to start analysis');
      }

      if (result.status === 'current') {
        // Analysis already current
        setState('CURRENT');
      } else if (result.status === 'queued') {
        // Analysis queued, start polling fallback
        setState('RUNNING');
        
        // Start fallback polling after 75 seconds
        pollTimeoutRef.current = setTimeout(() => {
          const pollInterval = setInterval(async () => {
            await fetchLatestAnalysis();
          }, 10000); // Poll every 10 seconds

          // Stop polling after 120 seconds total
          errorTimeoutRef.current = setTimeout(() => {
            clearInterval(pollInterval);
            if (state === 'RUNNING') {
              setState('ERROR');
              setError('Analysis timed out. Please try again.');
            }
          }, 45000); // 120s - 75s = 45s more
        }, 75000);
      }

    } catch (err) {
      console.error('Error starting analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      setState(analysis ? (isAnalysisStale(analysis, lastActionDate) ? 'STALE' : 'CURRENT') : 'NONE');
    } finally {
      setIsStarting(false);
    }
  };

  // Compute derived values
  const isButtonDisabled = state === 'CURRENT' || state === 'RUNNING' || isStarting;
  
  const buttonText = (() => {
    if (isStarting || state === 'RUNNING') return 'Analyzing...';
    if (state === 'NONE') return 'Begin Analysis';
    if (state === 'STALE' || state === 'ERROR') return 'Re-run Analysis';
    return 'Analysis Current';
  })();

  const statusBadge = (() => {
    switch (state) {
      case 'CURRENT':
        return { text: 'Analysis Current', variant: 'default' as const };
      case 'STALE':
        return { text: 'Out of Date', variant: 'destructive' as const };
      case 'RUNNING':
        return { text: 'Running...', variant: 'secondary' as const };
      case 'ERROR':
        return { text: 'Error', variant: 'destructive' as const };
      default:
        return null;
    }
  })();

  return {
    state,
    analysis,
    isButtonDisabled,
    buttonText,
    statusBadge,
    startAnalysis,
    error
  };
};