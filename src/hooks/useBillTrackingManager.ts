
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCampaigns } from './useCampaigns';
import type { Campaign } from '@/types/database';

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
      const user = { id: '00000000-0000-0000-0000-000000000001' };

      const { data, error } = await supabase
        .from('tracked_bills')
        .select('id')
        .eq('user_id', user.id)
        .eq('bill_id', billId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsTracked(!!data);
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
      const user = { id: '00000000-0000-0000-0000-000000000001' };

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
      const user = { id: '00000000-0000-0000-0000-000000000001' };

      const { error } = await supabase
        .from('tracked_bills')
        .delete()
        .eq('user_id', user.id)
        .eq('bill_id', billId);

      if (error) throw error;

      setIsTracked(false);
      toast.success('Bill removed from tracking list');
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
