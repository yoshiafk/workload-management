import { useState, useEffect, useCallback } from 'react';
import { leavesApi } from '../services/api';
import { toast } from 'sonner';

export const usePendingLeaves = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPending = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await leavesApi.getPendingRequests();
            setRequests(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching pending leaves:', err);
            setError(err.response?.data?.message || 'Failed to load pending requests');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const approve = async (id, note) => {
        try {
            await leavesApi.approveRequest(id, note);
            toast.success('Leave request approved');
            fetchPending();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
            return false;
        }
    };

    const reject = async (id, reason) => {
        try {
            await leavesApi.rejectRequest(id, reason);
            toast.success('Leave request rejected');
            fetchPending();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
            return false;
        }
    };

    return { requests, isLoading, error, refresh: fetchPending, approve, reject };
};

export const useLeaveBalancesAdmin = (params = {}) => {
    const [balances, setBalances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBalances = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await leavesApi.getAllBalances(params);
            setBalances(response.data.data || []);
        } catch (err) {
            toast.error('Failed to load balances');
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    return { balances, isLoading, refresh: fetchBalances };
};
