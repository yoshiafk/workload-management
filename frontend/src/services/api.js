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
    delete: (id) => api.delete(`/allocations/${id}`)
};

export const configApi = {
    getPhases: () => api.get('/phases'),
    getTasks: () => api.get('/tasks'),
    createPhase: (data) => api.post('/phases', data),
    updatePhase: (id, data) => api.put(`/phases/${id}`, data),
    deletePhase: (id) => api.delete(`/phases/${id}`),
    createTask: (data) => api.post('/tasks', data),
    updateTask: (id, data) => api.put(`/tasks/${id}`, data),
    deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const financeApi = {
    getCostCenters: () => api.get('/finance/cost-centers'),
    getCOA: () => api.get('/finance/coa'),
    createCostCenter: (data) => api.post('/finance/cost-centers', data),
    updateCostCenter: (id, data) => api.put(`/finance/cost-centers/${id}`, data),
    deleteCostCenter: (id) => api.delete(`/finance/cost-centers/${id}`),
    createCOA: (data) => api.post('/finance/coa', data),
    updateCOA: (id, data) => api.put(`/finance/coa/${id}`, data),
    deleteCOA: (id) => api.delete(`/finance/coa/${id}`),
};

export default api;
