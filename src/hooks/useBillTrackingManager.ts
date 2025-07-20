
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCampaigns } from './useCampaigns';
import type { Campaign } from '@/types/database';

// Mock data store for development (same as useBillTracking)
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';
const USE_MOCK_DATA = true; // Set to false to use real Supabase

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

const saveMockTrackedBills = (bills: any[]) => {
  localStorage.setItem('mock_tracked_bills', JSON.stringify(bills));
};

export const useBillTrackingManager = (billId: string) => {
  const [isTracked, setIsTracked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string | undefined>(undefined);

  const { campaigns, loading: campaignsLoading, error: campaignsError } = useCampaigns();

  const checkTrackingStatus = useCallback(async () => {
    try {
      setCheckingStatus(true);
      
      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockBills = getMockTrackedBills();
        const trackedBill = mockBills.find(bill => 
          bill.user_id === MOCK_USER_ID && bill.bill_id === billId
        );
        setIsTracked(!!trackedBill);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));
        return;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const user = { id: MOCK_USER_ID };
      const { data, error } = await supabase
        .from('tracked_bills')
        .select('id')
        .eq('user_id', user.id)
        .eq('bill_id', billId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsTracked(!!data);
      */
    } catch (err) {
      console.error('Error checking tracking status:', err);
      setIsTracked(false);
    } finally {
      setCheckingStatus(false);
    }
  }, [billId]);

  const trackBill = useCallback(async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockBills = getMockTrackedBills();
        
        // Check if already tracked
        const existingBill = mockBills.find(bill => 
          bill.user_id === MOCK_USER_ID && bill.bill_id === billId
        );
        
        if (existingBill) {
          toast.error('Bill is already tracked');
          return;
        }

        // Create new tracked bill (schema-compliant)
        const newTrackedBill = {
          id: crypto.randomUUID(),
          user_id: MOCK_USER_ID,
          bill_id: billId,
          campaign_id: selectedCampaign === 'none' ? null : selectedCampaign || null,
          notes: notes || null,
          tracked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const updatedBills = [...mockBills, newTrackedBill];
        saveMockTrackedBills(updatedBills);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setIsTracked(true);
        toast.success('Bill added to tracking list');
        setIsModalOpen(false);
        
        // Reset form
        setNotes('');
        setSelectedCampaign(undefined);
        return;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const user = { id: MOCK_USER_ID };
      const { error } = await supabase
        .from('tracked_bills')
        .insert([
          {
            user_id: user.id,
            bill_id: billId,
            notes: notes,
            campaign_id: selectedCampaign
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast.error('Bill is already tracked');
        } else {
          throw error;
        }
      } else {
        setIsTracked(true);
        toast.success('Bill added to tracking list');
        setIsModalOpen(false);
      }
      */
    } catch (err) {
      console.error('Error tracking bill:', err);
      toast.error('Failed to track bill');
    } finally {
      setLoading(false);
    }
  }, [billId, notes, selectedCampaign]);

  const untrackBill = useCallback(async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Mock implementation
        const mockBills = getMockTrackedBills();
        const updatedBills = mockBills.filter(bill => 
          !(bill.user_id === MOCK_USER_ID && bill.bill_id === billId)
        );
        
        saveMockTrackedBills(updatedBills);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setIsTracked(false);
        toast.success('Bill removed from tracking list');
        return;
      }

      // Real Supabase implementation (commented out for development)
      /*
      const user = { id: MOCK_USER_ID };
      const { error } = await supabase
        .from('tracked_bills')
        .delete()
        .eq('user_id', user.id)
        .eq('bill_id', billId);

      if (error) throw error;

      setIsTracked(false);
      toast.success('Bill removed from tracking list');
      */
    } catch (err) {
      console.error('Error untracking bill:', err);
      toast.error('Failed to untrack bill');
    } finally {
      setLoading(false);
    }
  }, [billId]);

  const openModal = () => {
    if (!isTracked) {
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (billId) {
      checkTrackingStatus();
    }
  }, [billId, checkTrackingStatus]);

  return {
    isTracked,
    loading,
    checkingStatus,
    isModalOpen,
    setIsModalOpen,
    notes,
    setNotes,
    selectedCampaign,
    setSelectedCampaign,
    campaigns,
    campaignsLoading,
    campaignsError,
    trackBill,
    untrackBill,
    openModal
  };
};
