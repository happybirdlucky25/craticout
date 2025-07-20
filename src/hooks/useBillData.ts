import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BillData {
  bill_id: string;
  session_id?: number;
  bill_number: string;
  title: string;
  description?: string;
  committee?: string;
  committee_id?: string;
  status?: string;
  status_desc?: string;
  status_date?: string;
  last_action_date?: string;
  last_action?: string;
  full_bill_text?: string;
  url?: string;
  state_link?: string;
  change_hash?: string;
}

export interface HistoryEntry {
  history_id: string;
  bill_id: string;
  date: string;
  chamber?: string;
  sequence: number;
  action: string;
}

export interface Amendment {
  document_id: string;
  bill_id: string;
  document_type?: string;
  document_desc?: string;
  state_link?: string;
  document_size?: number;
  document_mime?: string;
}

export interface Rollcall {
  roll_call_id: string;
  bill_id: string;
  date: string;
  chamber?: string;
  description?: string;
  yea?: number;
  nay?: number;
  nv?: number;
  absent?: number;
  total?: number;
}

export interface Vote {
  vote_id: string;
  roll_call_id: string;
  people_id: string;
  vote?: string;
  vote_desc?: string;
  name?: string;
  party?: string;
  district?: string;
}

export interface Sponsor {
  sponsor_id: string;
  bill_id: string;
  people_id: string;
  position?: string;
  name?: string;
  party?: string;
  district?: string;
  role?: string;
}

export interface BillAnalysis {
  id: string;
  bill_id: string;
  bill_number: string;
  created_at: string;
  analysis_type?: string;
  tags?: string[];
  content?: string;
}

export const useBillData = (billId: string) => {
  const [bill, setBill] = useState<BillData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [rollcalls, setRollcalls] = useState<Rollcall[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) return;

    const fetchBillData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          billResponse,
          historyResponse,
          amendmentsResponse,
          rollcallsResponse,
          sponsorsResponse
        ] = await Promise.all([
          // Bill core data
          supabase
            .from('bills')
            .select('*')
            .eq('bill_id', billId)
            .single(),

          // History data
          supabase
            .from('history')
            .select('*')
            .eq('bill_id', billId)
            .order('sequence', { ascending: true }),

          // Amendments
          supabase
            .from('documents_leg')
            .select('*')
            .eq('bill_id', billId)
            .or('document_type.ilike.%amend%,document_desc.ilike.%amend%')
            .order('document_id'),

          // Rollcalls
          supabase
            .from('rollcall')
            .select('*')
            .eq('bill_id', billId)
            .order('date', { ascending: false }),

          // Sponsors (will manually join with people data later)
          supabase
            .from('sponsor')
            .select('*')
            .eq('bill_id', billId)
            .order('position', { ascending: true })
        ]);

        if (billResponse.error) throw billResponse.error;
        if (historyResponse.error) throw historyResponse.error;
        if (amendmentsResponse.error) throw amendmentsResponse.error;
        if (rollcallsResponse.error) throw rollcallsResponse.error;
        if (sponsorsResponse.error) throw sponsorsResponse.error;

        setBill(billResponse.data);
        setHistory(historyResponse.data || []);
        setAmendments(amendmentsResponse.data || []);
        setRollcalls(rollcallsResponse.data || []);
        
        // Get people data for sponsors
        const sponsorData = sponsorsResponse.data || [];
        const peopleIds = sponsorData.map(s => s.people_id).filter(Boolean);
        
        let peopleData: any[] = [];
        if (peopleIds.length > 0) {
          const { data: peopleResponse } = await supabase
            .from('people')
            .select('*')
            .in('people_id', peopleIds);
          peopleData = peopleResponse || [];
        }
        
        // Transform sponsors data with people info
        const transformedSponsors = sponsorData.map(sponsor => {
          const person = peopleData.find(p => p.people_id === sponsor.people_id);
          return {
            ...sponsor,
            name: person?.name,
            party: person?.party,
            district: person?.district,
            role: person?.role
          };
        }).sort((a, b) => {
          // Sort by position number
          const aPos = parseInt(a.position || '999');
          const bPos = parseInt(b.position || '999');
          
          if (aPos !== bPos) return aPos - bPos;
          
          return (a.name || '').localeCompare(b.name || '');
        });

        setSponsors(transformedSponsors);

      } catch (err) {
        console.error('Error fetching bill data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bill data');
      } finally {
        setLoading(false);
      }
    };

    fetchBillData();
  }, [billId]);

  return {
    bill,
    history,
    amendments,
    rollcalls,
    sponsors,
    loading,
    error
  };
};

export const useVoteBreakdown = (rollCallId: string) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVotes = async () => {
    if (!rollCallId || loading) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('roll_call_id', rollCallId);

      if (error) throw error;

      // Get people data for votes
      const voteData = data || [];
      const peopleIds = voteData.map(v => v.people_id).filter(Boolean);
      
      let peopleData: any[] = [];
      if (peopleIds.length > 0) {
        const { data: peopleResponse } = await supabase
          .from('people')
          .select('*')
          .in('people_id', peopleIds);
        peopleData = peopleResponse || [];
      }

      const transformedVotes = voteData.map(vote => {
        const person = peopleData.find(p => p.people_id === vote.people_id);
        return {
          ...vote,
          name: person?.name,
          party: person?.party,
          district: person?.district
        };
      }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      setVotes(transformedVotes);

    } catch (err) {
      console.error('Error fetching votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch votes');
    } finally {
      setLoading(false);
    }
  };

  return {
    votes,
    loading,
    error,
    fetchVotes
  };
};

export const useBillAnalysis = (billId: string) => {
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestAnalysis = async () => {
    if (!billId) return;

    try {
      setLoading(true);
      setError(null);

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

      setAnalysis(data || null);

    } catch (err) {
      console.error('Error fetching bill analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAnalysis();
  }, [billId]);

  return {
    analysis,
    loading,
    error,
    refetch: fetchLatestAnalysis
  };
};