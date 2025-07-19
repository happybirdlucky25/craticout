import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBillTracking = (billId: string) => {
  const [isTracked, setIsTracked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if bill is currently tracked
  const checkTrackingStatus = async () => {
    try {
      setCheckingStatus(true);
      
      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   setIsTracked(false);
      //   return;
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { data, error } = await supabase
        .from('tracked_bills')
        .select('id')
        .eq('user_id', user.id)
        .eq('bill_id', billId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking tracking status:', error);
      }
      
      setIsTracked(!!data);
    } catch (err) {
      console.error('Error checking tracking status:', err);
      setIsTracked(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Track a bill
  const trackBill = async (notes?: string, campaignId?: string) => {
    try {
      setLoading(true);

      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   toast.error('Please log in to track bills');
      //   return false;
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { error } = await supabase
        .from('tracked_bills')
        .insert([
          {
            user_id: user.id,
            bill_id: billId,
            notes: notes,
            campaign_id: campaignId
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast.error('Bill is already tracked');
        } else {
          throw error;
        }
        return false;
      }

      setIsTracked(true);
      toast.success('Bill added to tracking list');
      return true;

    } catch (err) {
      console.error('Error tracking bill:', err);
      toast.error('Failed to track bill');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Untrack a bill
  const untrackBill = async () => {
    try {
      setLoading(true);

      // Temporarily disable auth for development
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   toast.error('Please log in to manage tracked bills');
      //   return false;
      // }
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

      const { error } = await supabase
        .from('tracked_bills')
        .delete()
        .eq('user_id', user.id)
        .eq('bill_id', billId);

      if (error) throw error;

      setIsTracked(false);
      toast.success('Bill removed from tracking list');
      return true;

    } catch (err) {
      console.error('Error untracking bill:', err);
      toast.error('Failed to untrack bill');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle tracking status
  const toggleTracking = async () => {
    if (isTracked) {
      return await untrackBill();
    } else {
      return await trackBill();
    }
  };

  useEffect(() => {
    if (billId) {
      checkTrackingStatus();
    }
  }, [billId]);

  return {
    isTracked,
    loading,
    checkingStatus,
    trackBill,
    untrackBill,
    toggleTracking,
    refetch: checkTrackingStatus
  };
};