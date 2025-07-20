// 📋 Report Inbox Data Fetching Hook
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatBillNumber } from '@/utils/billNumberFormatter';
import type { 
  ReportInbox, 
  ReportInboxWithBill, 
  ReportInboxResponse,
  CreateReportRequest
} from '@/types/database';

// Hook for fetching user's report inbox
export const useReportInbox = (page = 1, perPage = 20) => {
  const [data, setData] = useState<ReportInboxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Calculate pagination
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        // Fetch reports with optional bill data
        const { data: reports, error, count } = await supabase
          .from('report_inbox')
          .select(`
            *,
            bill:bills!report_inbox_bill_id_fkey (
              bill_id,
              bill_number,
              title,
              status,
              committee
            )
          `, { count: 'exact' })
          .eq('user_id', user.id)
          .order('date_created', { ascending: false })
          .range(from, to);

        if (error) throw error;

        // Transform the data to ensure bill numbers are properly formatted
        const transformedReports = reports?.map(report => ({
          ...report,
          bill_number: report.bill_number ? formatBillNumber(report.bill_number) : undefined,
          bill: report.bill ? {
            ...report.bill,
            bill_number: formatBillNumber(report.bill.bill_number)
          } : undefined
        })) || [];

        setData({
          reports: transformedReports as ReportInboxWithBill[],
          total_count: count || 0,
          page,
          per_page: perPage
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page, perPage]);

  return { data, loading, error, refetch: () => setLoading(true) };
};

// Hook for creating a new report
export const useCreateReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReport = async (reportData: CreateReportRequest): Promise<ReportInbox | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: report, error } = await supabase
        .from('report_inbox')
        .insert([
          {
            ...reportData,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return report;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createReport, loading, error };
};

// Hook for deleting a report
export const useDeleteReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteReport = async (reportId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('report_inbox')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id); // Ensure user can only delete their own reports

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

// Hook for getting report statistics
export const useReportStats = () => {
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Get total reports count
        const { count: totalReports, error: countError } = await supabase
          .from('report_inbox')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) throw countError;

        // Get reports by type
        const { data: reportsByType, error: typeError } = await supabase
          .from('report_inbox')
          .select('report_type')
          .eq('user_id', user.id);

        if (typeError) throw typeError;

        // Count reports by type
        const typeCounts: Record<string, number> = {};
        reportsByType?.forEach(report => {
          typeCounts[report.report_type] = (typeCounts[report.report_type] || 0) + 1;
        });

        // Get reports expiring in next 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const { count: expiringSoon, error: expiringError } = await supabase
          .from('report_inbox')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lte('expiration_date', sevenDaysFromNow.toISOString());

        if (expiringError) throw expiringError;

        setData({
          total_reports: totalReports || 0,
          reports_by_type: typeCounts,
          expiring_soon: expiringSoon || 0
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