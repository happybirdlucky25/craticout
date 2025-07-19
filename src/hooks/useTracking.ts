// 🎯 Tracking Data Hooks for Bills and Legislators
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatBillNumber } from '@/utils/billNumberFormatter';
import type { 
  TrackedBill, 
  TrackedBillWithBill, 
  TrackedLegislator, 
  TrackedLegislatorWithPerson 
} from '@/types/database';

// Hook for managing tracked bills
export const useTrackedBills = () => {
  const [data, setData] = useState<TrackedBillWithBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackedBills = async () => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   throw new Error('User not authenticated');
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { data: trackedBills, error } = await supabase
        .from('tracked_bills')
        .select(`
          *,
          bill:bills!tracked_bills_bill_id_fkey (
            bill_id,
            bill_number,
            title,
            status,
            status_desc,
            description,
            committee,
            last_action,
            last_action_date
          )
        `)
        .eq('user_id', user.id)
        .order('tracked_at', { ascending: false });

      if (error) throw error;

      // Format bill numbers for display
      const formattedData = trackedBills?.map(item => ({
        ...item,
        bill: item.bill ? {
          ...item.bill,
          bill_number: formatBillNumber(item.bill.bill_number)
        } : undefined
      })) || [];

      setData(formattedData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracked bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackedBills();
  }, []);

  return { data, loading, error, refetch: fetchTrackedBills };
};

// Hook for managing tracked legislators
export const useTrackedLegislators = () => {
  const [data, setData] = useState<TrackedLegislatorWithPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackedLegislators = async () => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   throw new Error('User not authenticated');
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { data: trackedLegislators, error } = await supabase
        .from('tracked_legislators')
        .select(`
          *,
          person:people!tracked_legislators_people_id_fkey (
            people_id,
            name,
            first_name,
            last_name,
            party,
            role,
            district
          )
        `)
        .eq('user_id', user.id)
        .order('tracked_at', { ascending: false });

      if (error) throw error;
      setData(trackedLegislators || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracked legislators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackedLegislators();
  }, []);

  return { data, loading, error, refetch: fetchTrackedLegislators };
};

// Hook for tracking/untracking bills
export const useBillTracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackBill = async (billId: string, campaignId?: string, notes?: string): Promise<TrackedBill | null> => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   throw new Error('User not authenticated');
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { data: trackedBill, error } = await supabase
        .from('tracked_bills')
        .insert([
          {
            user_id: user.id,
            bill_id: billId,
            campaign_id: campaignId,
            notes: notes
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return trackedBill;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track bill');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const untrackBill = async (billId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   throw new Error('User not authenticated');
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { error } = await supabase
        .from('tracked_bills')
        .delete()
        .eq('user_id', user.id)
        .eq('bill_id', billId);

      if (error) throw error;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to untrack bill');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isTracking = async (billId: string): Promise<boolean> => {
    try {
      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return false;
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { data, error } = await supabase
        .from('tracked_bills')
        .select('id')
        .eq('user_id', user.id)
        .eq('bill_id', billId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return !!data;

    } catch (err) {
      console.error('Error checking tracking status:', err);
      return false;
    }
  };

  return { trackBill, untrackBill, isTracking, loading, error };
};

// Hook for tracking/untracking legislators
export const useLegislatorTracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackLegislator = async (peopleId: string, notes?: string): Promise<TrackedLegislator | null> => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   throw new Error('User not authenticated');
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { data: trackedLegislator, error } = await supabase
        .from('tracked_legislators')
        .insert([
          {
            user_id: user.id,
            people_id: peopleId,
            notes: notes,
            notification_types: ['bills', 'votes']
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return trackedLegislator;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track legislator');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const untrackLegislator = async (peopleId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   throw new Error('User not authenticated');
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { error } = await supabase
        .from('tracked_legislators')
        .delete()
        .eq('user_id', user.id)
        .eq('people_id', peopleId);

      if (error) throw error;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to untrack legislator');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isTracking = async (peopleId: string): Promise<boolean> => {
    try {
      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return false;
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { data, error } = await supabase
        .from('tracked_legislators')
        .select('id')
        .eq('user_id', user.id)
        .eq('people_id', peopleId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;

    } catch (err) {
      console.error('Error checking legislator tracking status:', err);
      return false;
    }
  };

  return { trackLegislator, untrackLegislator, isTracking, loading, error };
};

// Hook for getting tracking statistics
export const useTrackingStats = () => {
  const [data, setData] = useState<{
    tracked_bills_count: number;
    tracked_legislators_count: number;
    recent_activity_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Temporarily disable auth for development
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) {
        //   throw new Error('User not authenticated');
        // }
        const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

        // Get counts in parallel
        const [billsCount, legislatorsCount] = await Promise.all([
          supabase
            .from('tracked_bills')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('tracked_legislators')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

        if (billsCount.error) throw billsCount.error;
        if (legislatorsCount.error) throw legislatorsCount.error;

        setData({
          tracked_bills_count: billsCount.count || 0,
          tracked_legislators_count: legislatorsCount.count || 0,
          recent_activity_count: 0 // Can be expanded later
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tracking statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
};