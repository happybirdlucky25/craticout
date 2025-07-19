// 📊 Dashboard Data Fetching Hook
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  DashboardStats, 
  RecentActivity,
  Bill,
  Person 
} from '@/types/database';

// Hook for fetching dashboard statistics
export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch multiple stats in parallel
        const [
          billsResult,
          activeBillsResult,
          passedBillsResult,
          failedBillsResult,
          legislatorsResult,
          recentVotesResult
        ] = await Promise.all([
          // Total bills
          supabase
            .from('bills')
            .select('bill_id', { count: 'exact', head: true }),
          
          // Active bills (not final status)
          supabase
            .from('bills')
            .select('bill_id', { count: 'exact', head: true })
            .not('status', 'in', '("Passed", "Failed", "Vetoed", "Withdrawn")')),
          
          // Passed bills
          supabase
            .from('bills')
            .select('bill_id', { count: 'exact', head: true })
            .eq('status', 'Passed'),
          
          // Failed bills
          supabase
            .from('bills')
            .select('bill_id', { count: 'exact', head: true })
            .in('status', ['Failed', 'Vetoed', 'Withdrawn']),
          
          // Total legislators
          supabase
            .from('people')
            .select('people_id', { count: 'exact', head: true }),
          
          // Recent votes (last 30 days)
          supabase
            .from('rollcall')
            .select('roll_call_id', { count: 'exact', head: true })
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        ]);

        const stats: DashboardStats = {
          total_bills: billsResult.count || 0,
          active_bills: activeBillsResult.count || 0,
          bills_passed: passedBillsResult.count || 0,
          bills_failed: failedBillsResult.count || 0,
          total_legislators: legislatorsResult.count || 0,
          recent_votes: recentVotesResult.count || 0,
          user_tracked_bills: 0 // TODO: Implement user tracking
        };

        setData(stats);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error, refetch: () => setLoading(true) };
};

// Hook for fetching recent activity timeline
export const useRecentActivity = (limit = 20) => {
  const [data, setData] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent bill actions
        const { data: billActions, error: billError } = await supabase
          .from('history')
          .select(`
            date,
            action,
            bill:bill_id (
              bill_id,
              bill_number,
              title
            )
          `)
          .not('date', 'is', null)
          .order('date', { ascending: false })
          .limit(limit);

        if (billError) throw billError;

        // Transform to RecentActivity format
        const activities: RecentActivity[] = (billActions || []).map(action => ({
          type: 'bill_action' as const,
          bill_id: action.bill?.bill_id,
          bill_title: action.bill?.title,
          action_description: action.action || 'Unknown action',
          date: action.date || ''
        }));

        setData(activities);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [limit]);

  return { data, loading, error };
};

// Hook for fetching trending bills (most active recently)
export const useTrendingBills = (limit = 10) => {
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingBills = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get bills with recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

        const { data: bills, error } = await supabase
          .from('bills')
          .select(`
            bill_id,
            bill_number,
            title,
            status,
            status_desc,
            last_action,
            last_action_date,
            committee,
            description
          `)
          .gte('last_action_date', sevenDaysAgo)
          .order('last_action_date', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setData(bills || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending bills');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingBills();
  }, [limit]);

  return { data, loading, error };
};

// Hook for fetching active legislators (recently active in voting/sponsorship)
export const useActiveLegislators = (limit = 10) => {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveLegislators = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get legislators with recent votes (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

        const { data: recentVotes, error } = await supabase
          .from('votes')
          .select(`
            people_id,
            person:people_id (
              people_id,
              name,
              party,
              role,
              district
            ),
            rollcall:roll_call_id (
              date
            )
          `)
          .gte('rollcall.date', thirtyDaysAgo);

        if (error) throw error;

        // Count votes per person and get unique legislators
        const voteActivity = recentVotes?.reduce((acc, vote) => {
          const personId = vote.people_id;
          if (personId && vote.person) {
            if (!acc[personId]) {
              acc[personId] = {
                person: vote.person,
                voteCount: 0
              };
            }
            acc[personId].voteCount++;
          }
          return acc;
        }, {} as Record<string, { person: Person; voteCount: number }>) || {};

        // Get top active legislators
        const activeLegislators = Object.values(voteActivity)
          .sort((a, b) => b.voteCount - a.voteCount)
          .slice(0, limit)
          .map(item => item.person);

        setData(activeLegislators);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch active legislators');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLegislators();
  }, [limit]);

  return { data, loading, error };
};

// Hook for fetching committee activity summary
export const useCommitteeActivity = () => {
  const [data, setData] = useState<Array<{ committee: string; bill_count: number; recent_activity: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommitteeActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: bills, error } = await supabase
          .from('bills')
          .select(`
            committee,
            last_action,
            last_action_date
          `)
          .not('committee', 'is', null)
          .order('last_action_date', { ascending: false });

        if (error) throw error;

        // Group by committee and count bills
        const committeeStats = bills?.reduce((acc, bill) => {
          const committee = bill.committee!;
          if (!acc[committee]) {
            acc[committee] = {
              committee,
              bill_count: 0,
              recent_activity: bill.last_action || 'No recent activity'
            };
          }
          acc[committee].bill_count++;
          return acc;
        }, {} as Record<string, { committee: string; bill_count: number; recent_activity: string }>) || {};

        // Convert to array and sort by bill count
        const sortedCommittees = Object.values(committeeStats)
          .sort((a, b) => b.bill_count - a.bill_count)
          .slice(0, 10); // Top 10 committees

        setData(sortedCommittees);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch committee activity');
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeActivity();
  }, []);

  return { data, loading, error };
};

// Hook for fetching party breakdown statistics
export const usePartyBreakdown = () => {
  const [data, setData] = useState<Array<{ party: string; count: number; percentage: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartyBreakdown = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: legislators, error } = await supabase
          .from('people')
          .select('party')
          .not('party', 'is', null);

        if (error) throw error;

        // Count by party
        const partyCounts = legislators?.reduce((acc, person) => {
          const party = person.party!;
          acc[party] = (acc[party] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const totalLegislators = Object.values(partyCounts).reduce((sum, count) => sum + count, 0);

        // Convert to array with percentages
        const partyBreakdown = Object.entries(partyCounts)
          .map(([party, count]) => ({
            party,
            count,
            percentage: totalLegislators > 0 ? (count / totalLegislators) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count);

        setData(partyBreakdown);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch party breakdown');
      } finally {
        setLoading(false);
      }
    };

    fetchPartyBreakdown();
  }, []);

  return { data, loading, error };
};