import { useState, useEffect, useCallback } from 'react';
import { leavesApi } from '../services/api';
import { toast } from 'sonner';

export const useLeaveBalance = () => {
    const [balances, setBalances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBalances = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await leavesApi.getBalance();
            setBalances(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching leave balances:', err);
            setError(err.response?.data?.message || 'Failed to load leave balances');
            toast.error('Could not load leave balances');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    return { balances, isLoading, error, refreshBalances: fetchBalances };
};

export const useMyLeaveRequests = (filters = {}) => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await leavesApi.getMyRequests(filters);
            setRequests(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching leave requests:', err);
            setError(err.response?.data?.message || 'Failed to load leave requests');
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const cancelRequest = async (id) => {
        try {
            await leavesApi.cancelRequest(id);
            toast.success('Leave request cancelled');
            fetchRequests();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel request');
            return false;
        }
    };

    return { requests, isLoading, error, refreshRequests: fetchRequests, cancelRequest };
};
