
// 🎯 Hook for fetching user campaigns
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Campaign } from '@/types/database';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Real Supabase implementation
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development user ID
      console.log('Fetching campaigns for user:', user.id);
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          bill_count:campaign_bills(count),
          legislator_count:campaign_legislators(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      console.log('Raw campaigns data:', data);
      
      // Transform the data to fix count values
      const transformedData = (data || []).map(campaign => {
        const transformed = {
          ...campaign,
          bill_count: campaign.bill_count?.[0]?.count || 0,
          legislator_count: campaign.legislator_count?.[0]?.count || 0
        };
        console.log('Transformed campaign:', campaign.name, 'bill_count:', transformed.bill_count, 'legislator_count:', transformed.legislator_count);
        return transformed;
      });
      
      console.log('Final campaigns data:', transformedData);
      setCampaigns(transformedData);

    } catch (err) {
      console.error('Campaign fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return { campaigns, loading, error, refetch: fetchCampaigns };
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

      // Real Supabase implementation
      const user = { id: '00000000-0000-0000-0000-000000000001' }; // Development user ID
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

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addBillToCampaign = async (campaignId: string, billId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('campaign_bills')
        .insert([
          {
            campaign_id: campaignId,
            bill_id: billId,
            added_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bill to campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadCampaignDocument = async (campaignId: string, file: File): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Upload file to Supabase storage
      const fileName = `${campaignId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('campaign_documents')
        .insert([
          {
            campaign_id: campaignId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
            uploaded_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeCampaignDocument = async (documentId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get document info first
      const { data: document, error: fetchError } = await supabase
        .from('campaign_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('campaign-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Remove from database
      const { error: dbError } = await supabase
        .from('campaign_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove document');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCampaign,
    updateCampaign,
    removeBillFromCampaign,
    deleteCampaign,
    addBillToCampaign,
    uploadCampaignDocument,
    removeCampaignDocument,
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
        .select(`
          *,
          bills:campaign_bills!campaign_bills_campaign_id_fkey (
            id,
            bill_id,
            added_at,
            notes,
            bill:bills!campaign_bills_bill_id_fkey (
              bill_id,
              bill_number,
              title,
              description,
              status,
              last_action,
              last_action_date
            )
          ),
          legislators:campaign_legislators!campaign_legislators_campaign_id_fkey (
            id,
            people_id,
            role,
            added_at,
            notes,
            person:people!campaign_legislators_people_id_fkey (
              people_id,
              name,
              first_name,
              last_name,
              party,
              role,
              district
            )
          )
        `)
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (campaign) {
        // Use the bills and legislators arrays length for accurate counts
        campaign.bill_count = campaign.bills?.length || 0;
        campaign.legislator_count = campaign.legislators?.length || 0;
      }
      
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
