import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Required for cookies (JWT)
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to handle unauthorized errors (redirect to login)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthenticated - could trigger logout or prompt
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me')
};

export const membersApi = {
    getAll: (params) => api.get('/members', { params }),
    getOne: (id) => api.get(`/members/${id}`),
    create: (data) => api.post('/members', data),
    update: (id, data) => api.put(`/members/${id}`, data),
    delete: (id) => api.delete(`/members/${id}`)
};

export const allocationsApi = {
    getAll: (params) => api.get('/allocations', { params }),
    getMyTasks: () => api.get('/allocations/my/tasks'),
    create: (data) => api.post('/allocations', data),
    update: (id, data) => api.put(`/allocations/${id}`, data),
    updateStatus: (id, data) => api.put(`/allocations/${id}/status`, data),
    delete: (id) => api.delete(`/allocations/${id}`),
    getAdminStats: () => api.get('/allocations/admin/stats')
};

export const configApi = {
    getPhases: (params) => api.get('/phases', { params }),
    getTasks: (params) => api.get('/tasks', { params }),
    createPhase: (data) => api.post('/phases', data),
    updatePhase: (id, data) => api.put(`/phases/${id}`, data),
    deletePhase: (id) => api.delete(`/phases/${id}`),
    createTask: (data) => api.post('/tasks', data),
    updateTask: (id, data) => api.put(`/tasks/${id}`, data),
    deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const financeApi = {
    getCostCenters: (params) => api.get('/finance/cost-centers', { params }),
    getCOA: (params) => api.get('/finance/coa', { params }),
    createCostCenter: (data) => api.post('/finance/cost-centers', data),
    updateCostCenter: (id, data) => api.put(`/finance/cost-centers/${id}`, data),
    deleteCostCenter: (id) => api.delete(`/finance/cost-centers/${id}`),
    createCOA: (data) => api.post('/finance/coa', data),
    updateCOA: (id, data) => api.put(`/finance/coa/${id}`, data),
    deleteCOA: (id) => api.delete(`/finance/coa/${id}`),
};

export const lookupsApi = {
    getStatuses: (params) => api.get('/lookups/statuses', { params }),
    getComplexities: (params) => api.get('/lookups/complexity', { params }),
    updateComplexity: (level, data) => api.put(`/lookups/complexity/${level}`, data),
    getTags: (params) => api.get('/lookups/tags', { params }),
    getHolidays: (params) => api.get('/lookups/holidays', { params }),
    syncHolidays: (year) => api.post(`/lookups/holidays/sync${year ? `?year=${year}` : ''}`),
    createHoliday: (data) => api.post('/lookups/holidays', data),
    updateHoliday: (id, data) => api.put(`/lookups/holidays/${id}`, data),
    deleteHoliday: (id) => api.delete(`/lookups/holidays/${id}`),
};

export const rolesApi = {
    getAll: (params) => api.get('/roles', { params }),
    getOne: (code) => api.get(`/roles/${code}`),
    updateTier: (id, data) => api.put(`/roles/tiers/${id}`, data),
};

export const leavesApi = {
    // Member endpoints
    getBalance: () => api.get('/leaves/balance'),
    getMyRequests: (params) => api.get('/leaves/me', { params }),
    submitRequest: (data) => api.post('/leaves', data),
    cancelRequest: (id) => api.put(`/leaves/${id}/cancel`),

    // Admin endpoints
    getPendingRequests: () => api.get('/admin/leaves/pending'),
    approveRequest: (id, note) => api.put(`/admin/leaves/${id}/approve`, { note }),
    rejectRequest: (id, reason) => api.put(`/admin/leaves/${id}/reject`, { reason }),
    getAllBalances: (params) => api.get('/admin/leaves/balances', { params }),
    updateBalance: (id, data) => api.put(`/admin/leaves/balances/${id}`, data),
    getLeaveTypes: () => api.get('/admin/leaves/types'),
    createLeaveType: (data) => api.post('/admin/leaves/types', data),
    updateLeaveType: (id, data) => api.put('/admin/leaves/types/' + id, data),
    deleteLeaveType: (id) => api.delete('/admin/leaves/types/' + id)
};

export const timesheetsApi = {
    // Member endpoints
    getMyEntries: (params) => api.get('/timesheets/me/entries', { params }),
    logTime: (data) => api.post('/timesheets/entries', data),
    updateEntry: (id, data) => api.put(`/timesheets/entries/${id}`, data),
    deleteEntry: (id) => api.delete(`/timesheets/entries/${id}`),
    getMyPeriods: () => api.get('/timesheets/me/periods'),
    submitTimesheet: (data) => api.post('/timesheets/submit', data),

    // Admin endpoints
    getPendingTimesheets: () => api.get('/timesheets/admin/pending'),
    getDetails: (id) => api.get(`/timesheets/admin/${id}`),
    reviewTimesheet: (id, data) => api.put(`/timesheets/admin/${id}/review`, data)
};

export const costsApi = {
    getAll: (params) => api.get('/costs', { params }),
    getOne: (id) => api.get(`/costs/${id}`),
    create: (data) => api.post('/costs', data),
    update: (id, data) => api.put(`/costs/${id}`, data),
    delete: (id) => api.delete(`/costs/${id}`)
};

export const settingsApi = {
    getAll: () => api.get('/settings'),
    getOne: (key) => api.get(`/settings/${key}`),
    update: (key, value) => api.put(`/settings/${key}`, value)
};

export default api;

