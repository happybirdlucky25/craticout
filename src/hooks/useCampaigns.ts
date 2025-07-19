
// 🎯 Hook for fetching user campaigns
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Campaign } from '@/types/database';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        // Temporarily disable auth for development
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) {
        //   throw new Error('User not authenticated');
        // }
        const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development placeholder UUID

        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCampaigns(data || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return { campaigns, loading, error };
};

// Hook for campaign operations (create, update, delete)
export const useCampaignOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = async (campaignData: {
    name: string;
    description?: string;
  }): Promise<Campaign | null> => {
    try {
      setLoading(true);
      setError(null);

      // Use development user ID
      const user = { id: '00000000-0000-0000-0000-000000000001' };

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert([
          {
            user_id: user.id,
            name: campaignData.name,
            description: campaignData.description,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return campaign;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (
    campaignId: string,
    updates: Partial<Campaign>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId);

      if (error) throw error;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeBillFromCampaign = async (
    campaignBillId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('campaign_bills')
        .delete()
        .eq('id', campaignBillId);

      if (error) throw error;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove bill from campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCampaign,
    updateCampaign,
    removeBillFromCampaign,
    loading,
    error
  };
};

// Hook for getting a single campaign by ID
export const useCampaign = (campaignId: string) => {
  const [data, setData] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use development user ID
      const user = { id: '00000000-0000-0000-0000-000000000001' };

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setData(campaign);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  return { data, loading, error, refetch: fetchCampaign };
};
