import { useState, useCallback, useEffect } from 'react';
import { timesheetsApi } from '../services/api';
import { toast } from 'sonner';

export const useAdminTimesheet = () => {
    const [pendingTimesheets, setPendingTimesheets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPending = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await timesheetsApi.getPendingTimesheets();
            setPendingTimesheets(response.data.data);
        } catch (err) {
            toast.error('Failed to load pending timesheets');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const reviewTimesheet = async (id, status, reason = '') => {
        try {
            await timesheetsApi.reviewTimesheet(id, { status, reason });
            toast.success(`Timesheet ${status.toLowerCase()} successfully`);
            fetchPending();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    return {
        pendingTimesheets,
        isLoading,
        refresh: fetchPending,
        reviewTimesheet
    };
};
