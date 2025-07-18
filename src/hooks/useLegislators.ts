// 👥 Legislators Data Fetching Hook
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Person, 
  PersonWithVotes, 
  PersonWithSponsorship,
  PersonFilters,
  PersonListResponse,
  VotingPattern 
} from '@/types/database';

// Hook for fetching multiple legislators with filtering
export const useLegislators = (filters: PersonFilters = {}, page = 1, perPage = 20) => {
  const [data, setData] = useState<PersonListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLegislators = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('people')
          .select(`
            people_id,
            name,
            first_name,
            last_name,
            party,
            role,
            district,
            committee_id
          `, { count: 'exact' });

        // Apply filters
        if (filters.party?.length) {
          query = query.in('party', filters.party);
        }

        if (filters.role?.length) {
          query = query.in('role', filters.role);
        }

        if (filters.committee?.length) {
          query = query.in('committee_id', filters.committee);
        }

        if (filters.search_term) {
          query = query.or(`name.ilike.%${filters.search_term}%,first_name.ilike.%${filters.search_term}%,last_name.ilike.%${filters.search_term}%`);
        }

        // Pagination
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        const { data: people, error, count } = await query
          .order('name', { ascending: true })
          .range(from, to);

        if (error) throw error;

        setData({
          people: people || [],
          total_count: count || 0,
          page,
          per_page: perPage,
          filters_applied: filters
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch legislators');
      } finally {
        setLoading(false);
      }
    };

    fetchLegislators();
  }, [filters, page, perPage]);

  return { data, loading, error, refetch: () => setLoading(true) };
};

// Hook for fetching a single legislator with full profile
export const useLegislator = (peopleId: string | null) => {
  const [data, setData] = useState<PersonWithSponsorship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!peopleId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchLegislator = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: person, error } = await supabase
          .from('people')
          .select(`
            *,
            sponsored_bills:sponsor (
              position,
              bill:bill_id (
                bill_id,
                bill_number,
                title,
                status,
                status_desc,
                last_action_date
              )
            )
          `)
          .eq('people_id', peopleId)
          .single();

        if (error) throw error;
        setData(person);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch legislator');
      } finally {
        setLoading(false);
      }
    };

    fetchLegislator();
  }, [peopleId]);

  return { data, loading, error };
};

// Hook for fetching legislator voting history
export const useLegislatorVotes = (peopleId: string | null, limit = 50) => {
  const [data, setData] = useState<PersonWithVotes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!peopleId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchVotes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: person, error } = await supabase
          .from('people')
          .select(`
            *,
            votes (
              vote_id,
              vote,
              vote_desc,
              rollcall:roll_call_id (
                roll_call_id,
                date,
                description,
                chamber,
                bill:bill_id (
                  bill_id,
                  bill_number,
                  title,
                  status
                )
              )
            )
          `)
          .eq('people_id', peopleId)
          .order('rollcall.date', { foreignTable: 'votes.rollcall', ascending: false })
          .limit(limit, { foreignTable: 'votes' })
          .single();

        if (error) throw error;
        setData(person);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch voting history');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [peopleId, limit]);

  return { data, loading, error };
};

// Hook for fetching voting patterns/statistics
export const useVotingPattern = (peopleId: string | null) => {
  const [data, setData] = useState<VotingPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!peopleId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchVotingPattern = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get the person info
        const { data: person, error: personError } = await supabase
          .from('people')
          .select('name, party')
          .eq('people_id', peopleId)
          .single();

        if (personError) throw personError;

        // Then get voting statistics
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('vote')
          .eq('people_id', peopleId);

        if (votesError) throw votesError;

        // Calculate statistics
        const totalVotes = votes?.length || 0;
        const yeaVotes = votes?.filter(v => v.vote === 'Y' || v.vote === 'Yea').length || 0;
        const nayVotes = votes?.filter(v => v.vote === 'N' || v.vote === 'Nay').length || 0;
        const notVoting = votes?.filter(v => v.vote === 'NV' || v.vote === 'Not Voting').length || 0;
        const absentVotes = votes?.filter(v => v.vote === 'A' || v.vote === 'Absent').length || 0;

        const pattern: VotingPattern = {
          people_id: peopleId,
          person_name: person?.name || 'Unknown',
          party: person?.party || 'Unknown',
          total_votes: totalVotes,
          yea_votes: yeaVotes,
          nay_votes: nayVotes,
          not_voting: notVoting,
          absent_votes: absentVotes,
          voting_percentage: totalVotes > 0 ? ((yeaVotes + nayVotes) / totalVotes) * 100 : 0
        };

        setData(pattern);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch voting pattern');
      } finally {
        setLoading(false);
      }
    };

    fetchVotingPattern();
  }, [peopleId]);

  return { data, loading, error };
};

// Hook for fetching party options (for filters)
export const useParties = () => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: parties, error } = await supabase
          .from('people')
          .select('party')
          .not('party', 'is', null);

        if (error) throw error;

        // Get unique parties
        const uniqueParties = [...new Set(parties?.map(p => p.party).filter(Boolean))] as string[];
        setData(uniqueParties.sort());

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch parties');
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  return { data, loading, error };
};

// Hook for fetching role options (for filters)
export const useRoles = () => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: roles, error } = await supabase
          .from('people')
          .select('role')
          .not('role', 'is', null);

        if (error) throw error;

        // Get unique roles
        const uniqueRoles = [...new Set(roles?.map(r => r.role).filter(Boolean))] as string[];
        setData(uniqueRoles.sort());

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { data, loading, error };
};

// Hook for searching legislators
export const useLegislatorSearch = (searchTerm: string, debounceMs = 300) => {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setData([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchLegislators = async () => {
        try {
          setLoading(true);
          setError(null);

          const { data: people, error } = await supabase
            .from('people')
            .select(`
              people_id,
              name,
              first_name,
              last_name,
              party,
              role,
              district
            `)
            .or(`name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
            .limit(20);

          if (error) throw error;
          setData(people || []);

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
          setLoading(false);
        }
      };

      searchLegislators();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debounceMs]);

  return { data, loading, error };
};

// Hook for fetching top legislators by activity
export const useTopLegislators = (metric: 'bills_sponsored' | 'votes_cast' = 'bills_sponsored', limit = 10) => {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopLegislators = async () => {
      try {
        setLoading(true);
        setError(null);

        let query;
        
        if (metric === 'bills_sponsored') {
          // Get legislators with most sponsored bills
          const { data: sponsors, error } = await supabase
            .from('sponsor')
            .select(`
              people_id,
              person:people_id (
                people_id,
                name,
                party,
                role,
                district
              )
            `)
            .eq('position', 'Sponsor'); // Primary sponsors only

          if (error) throw error;

          // Count bills per person
          const sponsorCounts = sponsors?.reduce((acc, s) => {
            const personId = s.people_id;
            if (personId && s.person) {
              acc[personId] = (acc[personId] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>) || {};

          // Get top legislators
          const topSponsors = Object.entries(sponsorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([peopleId]) => sponsors?.find(s => s.people_id === peopleId)?.person)
            .filter(Boolean) as Person[];

          setData(topSponsors);
        } else {
          // Get legislators with most votes cast
          const { data: voteActivity, error } = await supabase
            .from('votes')
            .select(`
              people_id,
              person:people_id (
                people_id,
                name,
                party,
                role,
                district
              )
            `);

          if (error) throw error;

          // Count votes per person
          const voteCounts = voteActivity?.reduce((acc, v) => {
            const personId = v.people_id;
            if (personId && v.person) {
              acc[personId] = (acc[personId] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>) || {};

          // Get top legislators
          const topVoters = Object.entries(voteCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([peopleId]) => voteActivity?.find(v => v.people_id === peopleId)?.person)
            .filter(Boolean) as Person[];

          setData(topVoters);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch top legislators');
      } finally {
        setLoading(false);
      }
    };

    fetchTopLegislators();
  }, [metric, limit]);

  return { data, loading, error };
};