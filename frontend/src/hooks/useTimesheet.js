import { useState, useCallback, useEffect } from 'react';
import { timesheetsApi } from '../services/api';
import { toast } from 'sonner';

export const useTimesheet = (startDate, endDate) => {
    const [entries, setEntries] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEntries = useCallback(async () => {
        if (!startDate || !endDate) return;
        try {
            setIsLoading(true);
            const response = await timesheetsApi.getMyEntries({ startDate, endDate });
            setEntries(response.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch entries');
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    const fetchPeriods = useCallback(async () => {
        try {
            const response = await timesheetsApi.getMyPeriods();
            setPeriods(response.data.data);
        } catch (err) {
            console.error('Failed to fetch periods', err);
        }
    }, []);

    useEffect(() => {
        fetchEntries();
        fetchPeriods();
    }, [fetchEntries, fetchPeriods]);

    const logTime = async (data) => {
        try {
            const response = await timesheetsApi.logTime(data);
            fetchEntries();
            toast.success('Time logged successfully');
            return response.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log time');
            throw err;
        }
    };

    const updateEntry = async (id, data) => {
        try {
            const response = await timesheetsApi.updateEntry(id, data);
            fetchEntries();
            toast.success('Entry updated');
            return response.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update entry');
            throw err;
        }
    };

    const deleteEntry = async (id) => {
        try {
            await timesheetsApi.deleteEntry(id);
            fetchEntries();
            toast.success('Entry deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete entry');
            throw err;
        }
    };

    const submitTimesheet = async (data) => {
        try {
            const response = await timesheetsApi.submitTimesheet(data);
            fetchPeriods();
            toast.success('Timesheet submitted for approval');
            return response.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit timesheet');
            throw err;
        }
    };

    return {
        entries,
        periods,
        isLoading,
        error,
        refresh: fetchEntries,
        logTime,
        updateEntry,
        deleteEntry,
        submitTimesheet
    };
};
