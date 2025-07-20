// 🏛️ Bills Data Fetching Hook
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analyzeSearchTerm, generateBillNumberSearchTerms } from '@/utils/billNumberFormatter';
import type { 
  Bill, 
  BillWithSponsors, 
  BillWithHistory, 
  BillFilters,
  BillListResponse 
} from '@/types/database';

// Hook for fetching multiple bills with filtering
export const useBills = (filters: BillFilters = {}, page = 1, perPage = 20) => {
  const [data, setData] = useState<BillListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('bills')
          .select(`
            bill_id,
            bill_number,
            title,
            status,
            status_desc,
            status_date,
            description,
            committee,
            last_action,
            last_action_date,
            session_id
          `, { count: 'exact' });

        // Apply filters
        if (filters.status?.length) {
          query = query.in('status', filters.status);
        }

        if (filters.committee?.length) {
          query = query.in('committee', filters.committee);
        }

        if (filters.search_term) {
          const searchAnalysis = analyzeSearchTerm(filters.search_term);
          
          if (searchAnalysis.searchType === 'exact_bill') {
            // Exact bill number match - highest priority, exact match only
            query = query.eq('bill_number', searchAnalysis.exactMatchTerm);
          } else if (searchAnalysis.searchType === 'bill_number') {
            // Bill number search - search bill_number column with variants
            const billNumberTerms = searchAnalysis.searchTerms.map(term => `bill_number.ilike.%${term}%`).join(',');
            query = query.or(billNumberTerms);
          } else if (searchAnalysis.searchType === 'mixed') {
            // Mixed search - search all columns with original term plus bill number variants
            const allTerms = searchAnalysis.searchTerms;
            const searchConditions = allTerms.map(term => 
              `title.ilike.%${term}%,description.ilike.%${term}%,bill_number.ilike.%${term}%`
            ).join(',');
            query = query.or(searchConditions);
          } else {
            // Full-text search - use PostgreSQL text search for better relevance
            // Note: This would ideally use to_tsvector/plainto_tsquery in a real implementation
            // For now, we'll use ILIKE with multiple columns and add some ranking
            const searchTerm = filters.search_term;
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,bill_number.ilike.%${searchTerm}%`);
            
            // Add ordering by relevance (title matches first, then description)
            query = query.order('title', { ascending: true }); // This is a simplified ranking
          }
        }

        if (filters.session_id) {
          query = query.eq('session_id', filters.session_id);
        }

        if (filters.date_range) {
          query = query
            .gte('last_action_date', filters.date_range.start)
            .lte('last_action_date', filters.date_range.end);
        }

        // Pagination
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        const { data: bills, error, count } = await query
          .order('last_action_date', { ascending: false })
          .range(from, to);

        if (error) throw error;

        setData({
          bills: bills || [],
          total_count: count || 0,
          page,
          per_page: perPage,
          filters_applied: filters
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [filters, page, perPage]);

  return { data, loading, error, refetch: () => setLoading(true) };
};

// Hook for fetching a single bill with full details
export const useBill = (billId: string | null) => {
  const [data, setData] = useState<BillWithSponsors | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchBill = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: bill, error } = await supabase
          .from('bills')
          .select(`
            *,
            sponsors:sponsor (
              position,
              person:people_id (
                name,
                party,
                role,
                district
              )
            )
          `)
          .eq('bill_id', billId)
          .single();

        if (error) throw error;
        setData(bill);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bill');
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId]);

  return { data, loading, error };
};

// Hook for fetching bill history/timeline
export const useBillHistory = (billId: string | null) => {
  const [data, setData] = useState<BillWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchBillHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: bill, error } = await supabase
          .from('bills')
          .select(`
            *,
            history (
              history_id,
              date,
              chamber,
              sequence,
              action
            )
          `)
          .eq('bill_id', billId)
          .single();

        if (error) throw error;
        setData(bill);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bill history');
      } finally {
        setLoading(false);
      }
    };

    fetchBillHistory();
  }, [billId]);

  return { data, loading, error };
};

// Hook for fetching recent bills (dashboard)
export const useRecentBills = (limit = 10) => {
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentBills = async () => {
      try {
        setLoading(true);
        setError(null);

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
            committee
          `)
          .order('last_action_date', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setData(bills || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent bills');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBills();
  }, [limit]);

  return { data, loading, error };
};

// Hook for fetching bill status options (for filters)
export const useBillStatuses = () => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: statuses, error } = await supabase
          .from('bills')
          .select('status')
          .not('status', 'is', null);

        if (error) throw error;

        // Get unique statuses
        const uniqueStatuses = [...new Set(statuses?.map(s => s.status).filter(Boolean))] as string[];
        setData(uniqueStatuses.sort());

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bill statuses');
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  return { data, loading, error };
};

// Hook for fetching committee options (for filters)
export const useBillCommittees = () => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: committees, error } = await supabase
          .from('bills')
          .select('committee')
          .not('committee', 'is', null);

        if (error) throw error;

        // Get unique committees
        const uniqueCommittees = [...new Set(committees?.map(c => c.committee).filter(Boolean))] as string[];
        setData(uniqueCommittees.sort());

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch committees');
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
  }, []);

  return { data, loading, error };
};

// Hook for searching bills
export const useBillSearch = (searchTerm: string, debounceMs = 300) => {
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setData([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchBills = async () => {
        try {
          setLoading(true);
          setError(null);

          const searchAnalysis = analyzeSearchTerm(searchTerm);
          let query = supabase
            .from('bills')
            .select(`
              bill_id,
              bill_number,
              title,
              status,
              description,
              committee
            `);

          if (searchAnalysis.searchType === 'exact_bill') {
            // Exact bill number match - return exact match first
            query = query.eq('bill_number', searchAnalysis.exactMatchTerm);
          } else if (searchAnalysis.searchType === 'bill_number') {
            // Bill number search
            const billNumberTerms = searchAnalysis.searchTerms.map(term => `bill_number.ilike.%${term}%`).join(',');
            query = query.or(billNumberTerms);
          } else if (searchAnalysis.searchType === 'mixed') {
            // Mixed search
            const allTerms = searchAnalysis.searchTerms;
            const searchConditions = allTerms.map(term => 
              `title.ilike.%${term}%,description.ilike.%${term}%,bill_number.ilike.%${term}%`
            ).join(',');
            query = query.or(searchConditions);
          } else {
            // Full-text search with relevance ordering
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,bill_number.ilike.%${searchTerm}%`);
            query = query.order('title', { ascending: true });
          }

          const { data: bills, error } = await query.limit(20);

          if (error) throw error;
          setData(bills || []);

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
          setLoading(false);
        }
      };

      searchBills();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debounceMs]);

  return { data, loading, error };
};