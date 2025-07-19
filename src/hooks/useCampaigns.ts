
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
