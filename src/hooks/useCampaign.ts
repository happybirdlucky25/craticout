import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Campaign {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  bill_count?: number;
  legislator_count?: number;
}

export interface CampaignBill {
  id: string;
  campaign_id: string;
  bill_id: string;
  added_at?: string;
  notes?: string;
  priority?: string;
  // Joined from bills table
  title?: string;
  bill_number?: string;
  status?: string;
  last_action_date?: string;
  description?: string;
}

export interface CampaignLegislator {
  id: string;
  campaign_id: string;
  people_id: string;
  role?: string;
  added_at?: string;
  notes?: string;
  // Joined from people table
  name?: string;
  party?: string;
  district?: string;
  office?: string;
}

export interface CampaignDocument {
  id: string;
  campaign_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_at?: string;
  uploaded_by?: string;
}

export interface CampaignNote {
  id: string;
  campaign_id: string;
  content?: string;
  updated_at?: string;
  updated_by?: string;
}

export const useCampaign = (campaignId: string) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_bills(count),
          campaign_legislators(count)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;
      
      if (data) {
        const transformedCampaign: Campaign = {
          ...data,
          bill_count: data.campaign_bills?.[0]?.count || 0,
          legislator_count: data.campaign_legislators?.[0]?.count || 0
        };
        setCampaign(transformedCampaign);
      }
    } catch (err: any) {
      console.error('Error fetching campaign:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const updateCampaign = async (updates: Partial<Campaign>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setCampaign(prev => prev ? { ...prev, ...data } : data);
      }
      
      return data;
    } catch (err: any) {
      console.error('Error updating campaign:', err);
      throw err;
    }
  };

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign,
    updateCampaign
  };
};

export const useCampaignBills = (campaignId: string) => {
  const [bills, setBills] = useState<CampaignBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: billsError } = await supabase
        .from('campaign_bills')
        .select(`
          *,
          bills (
            title,
            bill_number,
            status,
            last_action_date,
            description
          )
        `)
        .eq('campaign_id', campaignId)
        .order('added_at', { ascending: false });

      if (billsError) throw billsError;

      const transformedBills = (data || []).map(item => ({
        ...item,
        title: item.bills?.title,
        bill_number: item.bills?.bill_number,
        status: item.bills?.status,
        last_action_date: item.bills?.last_action_date,
        description: item.bills?.description
      }));

      setBills(transformedBills);
    } catch (err: any) {
      console.error('Error fetching campaign bills:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchBills();
    }
  }, [campaignId]);

  const addBill = async (billId: string, notes?: string, priority = 'medium') => {
    try {
      const { data, error } = await supabase
        .from('campaign_bills')
        .insert({
          campaign_id: campaignId,
          bill_id: billId,
          notes,
          priority
        })
        .select()
        .single();

      if (error) throw error;
      
      fetchBills(); // Refresh the list
      return data;
    } catch (err: any) {
      console.error('Error adding bill to campaign:', err);
      throw err;
    }
  };

  const removeBill = async (campaignBillId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_bills')
        .delete()
        .eq('id', campaignBillId);

      if (error) throw error;
      
      fetchBills(); // Refresh the list
    } catch (err: any) {
      console.error('Error removing bill from campaign:', err);
      throw err;
    }
  };

  return {
    bills,
    loading,
    error,
    refetch: fetchBills,
    addBill,
    removeBill
  };
};

export const useCampaignLegislators = (campaignId: string) => {
  const [legislators, setLegislators] = useState<CampaignLegislator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLegislators = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: legislatorsError } = await supabase
        .from('campaign_legislators')
        .select(`
          *,
          people (
            name,
            party,
            district,
            role
          )
        `)
        .eq('campaign_id', campaignId)
        .order('added_at', { ascending: false });

      if (legislatorsError) throw legislatorsError;

      const transformedLegislators = (data || []).map(item => ({
        ...item,
        name: item.people?.name,
        party: item.people?.party,
        district: item.people?.district,
        office: item.people?.role
      }));

      setLegislators(transformedLegislators);
    } catch (err: any) {
      console.error('Error fetching campaign legislators:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchLegislators();
    }
  }, [campaignId]);

  const addLegislator = async (peopleId: string, role = 'stakeholder', notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('campaign_legislators')
        .insert({
          campaign_id: campaignId,
          people_id: peopleId,
          role,
          notes
        })
        .select()
        .single();

      if (error) throw error;
      
      fetchLegislators(); // Refresh the list
      return data;
    } catch (err: any) {
      console.error('Error adding legislator to campaign:', err);
      throw err;
    }
  };

  const removeLegislator = async (campaignLegislatorId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_legislators')
        .delete()
        .eq('id', campaignLegislatorId);

      if (error) throw error;
      
      fetchLegislators(); // Refresh the list
    } catch (err: any) {
      console.error('Error removing legislator from campaign:', err);
      throw err;
    }
  };

  return {
    legislators,
    loading,
    error,
    refetch: fetchLegislators,
    addLegislator,
    removeLegislator
  };
};

export const useCampaignDocuments = (campaignId: string) => {
  const [documents, setDocuments] = useState<CampaignDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: documentsError } = await supabase
        .from('campaign_documents')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('uploaded_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching campaign documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchDocuments();
    }
  }, [campaignId]);

  const uploadDocument = async (file: File) => {
    try {
      // Note: This is a simplified version - in production you'd upload to Supabase Storage first
      const { data, error } = await supabase
        .from('campaign_documents')
        .insert({
          campaign_id: campaignId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: `/campaigns/${campaignId}/${file.name}`, // Mock path
          uploaded_by: 'dev-user'
        })
        .select()
        .single();

      if (error) throw error;
      
      fetchDocuments(); // Refresh the list
      return data;
    } catch (err: any) {
      console.error('Error uploading document:', err);
      throw err;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      fetchDocuments(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting document:', err);
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    uploadDocument,
    deleteDocument
  };
};

export const useCampaignNotes = (campaignId: string) => {
  const [notes, setNotes] = useState<CampaignNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: notesError } = await supabase
        .from('campaign_notes')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (notesError) throw notesError;
      setNotes(data);
    } catch (err: any) {
      console.error('Error fetching campaign notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchNotes();
    }
  }, [campaignId]);

  const updateNotes = async (content: string) => {
    try {
      let result;
      
      if (notes?.id) {
        // Update existing notes
        const { data, error } = await supabase
          .from('campaign_notes')
          .update({
            content,
            updated_at: new Date().toISOString(),
            updated_by: 'dev-user'
          })
          .eq('id', notes.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new notes
        const { data, error } = await supabase
          .from('campaign_notes')
          .insert({
            campaign_id: campaignId,
            content,
            updated_by: 'dev-user'
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }
      
      setNotes(result);
      return result;
    } catch (err: any) {
      console.error('Error updating campaign notes:', err);
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    refetch: fetchNotes,
    updateNotes
  };
};