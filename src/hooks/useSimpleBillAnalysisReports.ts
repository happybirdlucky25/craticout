// 📋 Reports Hook using existing simple_bill_analysis table
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatBillNumber } from '@/utils/billNumberFormatter';

// Adapter interface to match ReportInbox structure
export interface SimpleBillAnalysisReport {
  id: string;
  bill_id: string;
  bill_number?: string;
  report_type: string;
  user_id?: string;
  date_created: string;
  expiration_date: string;
  content: string;
  title: string;
  campaign_name?: string;
  bills_included: number;
  files_used: number;
  created_at: string;
  updated_at: string;
  bill?: {
    bill_id: string;
    bill_number: string;
    title: string;
    status?: string;
    committee?: string;
  };
}

export interface SimpleBillAnalysisResponse {
  reports: SimpleBillAnalysisReport[];
  total_count: number;
  page: number;
  per_page: number;
}

// Hook for fetching reports from simple_bill_analysis table
export const useSimpleBillAnalysisReports = (page = 1, perPage = 20) => {
  const [data, setData] = useState<SimpleBillAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    fetchReports();
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      // Fetch analysis reports with optional bill data
      const { data: reports, error, count } = await supabase
        .from('simple_bill_analysis')
        .select(`
          *,
          bill:bills!simple_bill_analysis_bill_id_fkey (
            bill_id,
            bill_number,
            title,
            status,
            committee
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        // If foreign key fails, try without the relationship
        const { data: reportsSimple, error: simpleError, count: simpleCount } = await supabase
          .from('simple_bill_analysis')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (simpleError) throw simpleError;

        // Get bill data separately
        const billIds = reportsSimple?.map(r => r.bill_id).filter(Boolean) || [];
        let billsData: any[] = [];
        
        if (billIds.length > 0) {
          const { data: bills } = await supabase
            .from('bills')
            .select('bill_id, bill_number, title, status, committee')
            .in('bill_id', billIds);
          billsData = bills || [];
        }

        // Transform the data
        const transformedReports = reportsSimple?.map(report => {
          const bill = billsData.find(b => b.bill_id === report.bill_id);
          
          return {
            id: report.id,
            bill_id: report.bill_id,
            bill_number: report.bill_number || bill?.bill_number,
            report_type: report.analysis_type || 'Analysis',
            date_created: report.created_at,
            expiration_date: new Date(new Date(report.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            content: report.content || 'Analysis content not available.',
            title: `Bill Analysis: ${formatBillNumber(report.bill_number || bill?.bill_number || report.bill_id)}`,
            campaign_name: undefined,
            bills_included: 1,
            files_used: 0,
            created_at: report.created_at,
            updated_at: report.updated_at || report.created_at,
            bill: bill ? {
              ...bill,
              bill_number: formatBillNumber(bill.bill_number)
            } : undefined
          };
        }) || [];

        setData({
          reports: transformedReports,
          total_count: simpleCount || 0,
          page,
          per_page: perPage
        });

      } else {
        // Transform the data to match ReportInbox interface
        const transformedReports = reports?.map(report => ({
          id: report.id,
          bill_id: report.bill_id,
          bill_number: report.bill_number || report.bill?.bill_number,
          report_type: report.analysis_type || 'Analysis',
          date_created: report.created_at,
          expiration_date: new Date(new Date(report.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          content: report.content || 'Analysis content not available.',
          title: `Bill Analysis: ${formatBillNumber(report.bill_number || report.bill?.bill_number || report.bill_id)}`,
          campaign_name: undefined,
          bills_included: 1,
          files_used: 0,
          created_at: report.created_at,
          updated_at: report.updated_at || report.created_at,
          bill: report.bill ? {
            ...report.bill,
            bill_number: formatBillNumber(report.bill.bill_number)
          } : undefined
        })) || [];

        setData({
          reports: transformedReports,
          total_count: count || 0,
          page,
          per_page: perPage
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, perPage]);

  return { data, loading, error, refetch };
};

// Hook for deleting a report from simple_bill_analysis
export const useDeleteSimpleBillAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteReport = async (reportId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('simple_bill_analysis')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteReport, loading, error };
};

// Hook for getting report statistics from simple_bill_analysis
export const useSimpleBillAnalysisStats = () => {
  const [data, setData] = useState<{
    total_reports: number;
    reports_by_type: Record<string, number>;
    expiring_soon: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get total reports count
        const { count: totalReports, error: countError } = await supabase
          .from('simple_bill_analysis')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Get reports by type
        const { data: reportsByType, error: typeError } = await supabase
          .from('simple_bill_analysis')
          .select('analysis_type');

        if (typeError) throw typeError;

        // Count reports by type
        const typeCounts: Record<string, number> = {};
        reportsByType?.forEach(report => {
          const type = report.analysis_type || 'Analysis';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        // Calculate "expiring soon" based on 30-day expiration from created_at
        const { data: allReports, error: expiringError } = await supabase
          .from('simple_bill_analysis')
          .select('created_at');

        if (expiringError) throw expiringError;

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const expiringSoon = allReports?.filter(report => {
          const expirationDate = new Date(new Date(report.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);
          return expirationDate <= sevenDaysFromNow;
        }).length || 0;

        setData({
          total_reports: totalReports || 0,
          reports_by_type: typeCounts,
          expiring_soon: expiringSoon
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch report statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
};