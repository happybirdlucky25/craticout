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

// Mock data configuration
const USE_MOCK_DATA = true; // Set to false to use real Supabase
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

// Mock bills database for bill details lookup
const getMockBillsDatabase = () => {
  return {
    'HB2316': {
      bill_id: 'HB2316',
      bill_number: 'H.R. 2316',
      title: 'Wetlands Conservation and Access Improvement Act of 2025',
      status: 'Introduced',
      status_desc: 'Introduced',
      description: 'To amend the Pittman-Robertson Wildlife Restoration Act to provide that interest on obligations held in the Federal aid to wildlife restoration fund shall become available for apportionment at the beginning of fiscal year 2033.',
      committee: 'House Committee on Natural Resources',
      last_action: 'Placed on the Union Calendar, Calendar No. 156.',
      last_action_date: '2025-07-09'
    },
    'SB2256': {
      bill_id: 'SB2256',
      bill_number: 'S. 2256',
      title: 'Environmental Protection Enhancement Act',
      status: 'In Committee',
      status_desc: 'In Committee',
      description: 'A comprehensive bill to strengthen environmental protections and establish new standards for clean air and water.',
      committee: 'Senate Environment and Public Works Committee',
      last_action: 'Referred to the Committee on Environment and Public Works',
      last_action_date: '2025-07-08'
    },
    'HB1729': {
      bill_id: 'HB1729',
      bill_number: 'H.R. 1729',
      title: 'Healthcare Access and Affordability Act',
      status: 'Passed House',
      status_desc: 'Passed House',
      description: 'To improve healthcare access and reduce prescription drug costs for American families.',
      committee: 'House Energy and Commerce Committee',
      last_action: 'Passed House by voice vote',
      last_action_date: '2025-07-07'
    }
  };
};

// Get mock tracked bills from localStorage
const getMockTrackedBills = (): any[] => {
  const stored = localStorage.getItem('mock_tracked_bills');
  return stored ? JSON.parse(stored) : [
    {
      id: '11111111-1111-1111-1111-111111111111',
      user_id: MOCK_USER_ID,
      bill_id: 'HB2316',
      campaign_id: '1',
      notes: 'Important environmental legislation to monitor',
      tracked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222', 
      user_id: MOCK_USER_ID,
      bill_id: 'SB2256',
      campaign_id: null,
      notes: 'Tracking individually',
      tracked_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

// Get mock tracked legislators from localStorage
const getMockTrackedLegislators = (): any[] => {
  const stored = localStorage.getItem('mock_tracked_legislators');
  return stored ? JSON.parse(stored) : [
    {
      id: '33333333-3333-3333-3333-333333333333',
      user_id: MOCK_USER_ID,
      people_id: '1', // Alexandria Ocasio-Cortez
      notes: 'Following progressive policy positions',
      notification_types: ['bills', 'votes'],
      tracked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      user_id: MOCK_USER_ID,
      people_id: '2', // Ted Cruz
      notes: 'Monitoring conservative voting record',
      notification_types: ['bills', 'votes'],
      tracked_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updated_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];
};

const saveMockTrackedBills = (bills: any[]) => {
  localStorage.setItem('mock_tracked_bills', JSON.stringify(bills));
};

const saveMockTrackedLegislators = (legislators: any[]) => {
  localStorage.setItem('mock_tracked_legislators', JSON.stringify(legislators));
};

// Mock legislator database for details lookup
const getMockLegislatorsDatabase = () => {
  return {
    '1': {
      people_id: '1',
      name: 'Alexandria Ocasio-Cortez',
      first_name: 'Alexandria',
      last_name: 'Ocasio-Cortez',
      party: 'Democratic',
      role: 'Representative',
      district: 'HD-NY-14',
      state: 'NY',
      chamber: 'House'
    },
    '2': {
      people_id: '2',
      name: 'Ted Cruz',
      first_name: 'Ted',
      last_name: 'Cruz',
      party: 'Republican',
      role: 'Senator',
      district: null,
      state: 'TX',
      chamber: 'Senate'
    },
    '3': {
      people_id: '3',
      name: 'Nancy Pelosi',
      first_name: 'Nancy',
      last_name: 'Pelosi',
      party: 'Democratic',
      role: 'Representative',
      district: 'HD-CA-11',
      state: 'CA',
      chamber: 'House'
    },
    '4': {
      people_id: '4',
      name: 'Mitch McConnell',
      first_name: 'Mitch',
      last_name: 'McConnell',
      party: 'Republican',
      role: 'Senator',
      district: null,
      state: 'KY',
      chamber: 'Senate'
    }
  };
};

// Hook for managing tracked bills
export const useTrackedBills = () => {
  const [data, setData] = useState<TrackedBillWithBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackedBills = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockTrackedBills = getMockTrackedBills();
        const mockBillsDb = getMockBillsDatabase();
        
        // Combine tracked bills with bill details
        const trackedBillsWithDetails = mockTrackedBills
          .filter(tracked => tracked.user_id === MOCK_USER_ID)
          .map(tracked => ({
            ...tracked,
            bill: mockBillsDb[tracked.bill_id] || {
              bill_id: tracked.bill_id,
              bill_number: tracked.bill_id,
              title: `Bill ${tracked.bill_id}`,
              status: 'Unknown',
              status_desc: 'Unknown',
              description: 'No description available',
              committee: 'Unknown Committee',
              last_action: 'No recent action',
              last_action_date: new Date().toISOString()
            }
          }))
          .sort((a, b) => new Date(b.tracked_at).getTime() - new Date(a.tracked_at).getTime());

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData(trackedBillsWithDetails);
        return;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const user = { id: MOCK_USER_ID };
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
      setData(trackedBills || []);
      */

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

      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockTrackedLegislators = getMockTrackedLegislators();
        const mockLegislatorsDb = getMockLegislatorsDatabase();
        
        // Combine tracked legislators with legislator details
        const trackedLegislatorsWithDetails = mockTrackedLegislators
          .filter(tracked => tracked.user_id === MOCK_USER_ID)
          .map(tracked => ({
            ...tracked,
            person: mockLegislatorsDb[tracked.people_id] || {
              people_id: tracked.people_id,
              name: `Legislator ${tracked.people_id}`,
              first_name: 'Unknown',
              last_name: 'Unknown',
              party: 'Unknown',
              role: 'Unknown',
              district: null,
              state: 'Unknown',
              chamber: 'Unknown'
            }
          }))
          .sort((a, b) => new Date(b.tracked_at).getTime() - new Date(a.tracked_at).getTime());

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData(trackedLegislatorsWithDetails);
        return;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const user = { id: MOCK_USER_ID };
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
      */

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

      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockBills = getMockTrackedBills();
        
        // Check if already tracked
        const existingBill = mockBills.find(bill => 
          bill.user_id === MOCK_USER_ID && bill.bill_id === billId
        );
        
        if (existingBill) {
          throw new Error('Bill is already being tracked');
        }
        
        const newTrackedBill = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: MOCK_USER_ID,
          bill_id: billId,
          campaign_id: campaignId || null,
          notes: notes || null,
          tracked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedBills = [...mockBills, newTrackedBill];
        saveMockTrackedBills(updatedBills);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return newTrackedBill;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

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
      */

      // Development fallback
      return null;

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

      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockBills = getMockTrackedBills();
        const updatedBills = mockBills.filter(bill => 
          !(bill.user_id === MOCK_USER_ID && bill.bill_id === billId)
        );
        
        saveMockTrackedBills(updatedBills);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return true;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('tracked_bills')
        .delete()
        .eq('user_id', user.id)
        .eq('bill_id', billId);

      if (error) throw error;
      return true;
      */

      // Development fallback
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
      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockBills = getMockTrackedBills();
        const trackedBill = mockBills.find(bill => 
          bill.user_id === MOCK_USER_ID && bill.bill_id === billId
        );
        return !!trackedBill;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('tracked_bills')
        .select('id')
        .eq('user_id', user.id)
        .eq('bill_id', billId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return !!data;
      */

      // Development fallback
      return false;

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

      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockLegislators = getMockTrackedLegislators();
        
        // Check if already tracked
        const existingLegislator = mockLegislators.find(legislator => 
          legislator.user_id === MOCK_USER_ID && legislator.people_id === peopleId
        );
        
        if (existingLegislator) {
          setError('Legislator is already tracked');
          return null;
        }

        // Create new tracked legislator (schema-compliant)
        const newTrackedLegislator = {
          id: crypto.randomUUID(),
          user_id: MOCK_USER_ID,
          people_id: peopleId,
          notes: notes || null,
          notification_types: ['bills', 'votes'],
          tracked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const updatedLegislators = [...mockLegislators, newTrackedLegislator];
        saveMockTrackedLegislators(updatedLegislators);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return newTrackedLegislator;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const user = { id: MOCK_USER_ID };
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
      */

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

      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockLegislators = getMockTrackedLegislators();
        const updatedLegislators = mockLegislators.filter(legislator => 
          !(legislator.user_id === MOCK_USER_ID && legislator.people_id === peopleId)
        );
        
        saveMockTrackedLegislators(updatedLegislators);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return true;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const user = { id: MOCK_USER_ID };
      const { error } = await supabase
        .from('tracked_legislators')
        .delete()
        .eq('user_id', user.id)
        .eq('people_id', peopleId);

      if (error) throw error;
      return true;
      */

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to untrack legislator');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isTracking = async (peopleId: string): Promise<boolean> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockLegislators = getMockTrackedLegislators();
        const trackedLegislator = mockLegislators.find(legislator => 
          legislator.user_id === MOCK_USER_ID && legislator.people_id === peopleId
        );
        return !!trackedLegislator;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const user = { id: MOCK_USER_ID };
      const { data, error } = await supabase
        .from('tracked_legislators')
        .select('id')
        .eq('user_id', user.id)
        .eq('people_id', peopleId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
      */

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

        if (USE_MOCK_DATA) {
          // Mock implementation - count from localStorage
          const mockTrackedBills = getMockTrackedBills();
          const mockTrackedLegislators = getMockTrackedLegislators();
          const userTrackedBills = mockTrackedBills.filter(bill => bill.user_id === MOCK_USER_ID);
          const userTrackedLegislators = mockTrackedLegislators.filter(legislator => legislator.user_id === MOCK_USER_ID);
          
          setData({
            tracked_bills_count: userTrackedBills.length,
            tracked_legislators_count: userTrackedLegislators.length,
            recent_activity_count: 0
          });
          
          await new Promise(resolve => setTimeout(resolve, 300));
          return;
        }

        // Real Supabase implementation (commented out for development)
        /*
        const user = { id: MOCK_USER_ID };
        const [billsCount, legislatorsCount] = await Promise.all([
          supabase.from('tracked_bills').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('tracked_legislators').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);

        if (billsCount.error) throw billsCount.error;
        if (legislatorsCount.error) throw legislatorsCount.error;

        setData({
          tracked_bills_count: billsCount.count || 0,
          tracked_legislators_count: legislatorsCount.count || 0,
          recent_activity_count: 0
        });
        */

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