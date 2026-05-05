import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
};

export const configApi = {
  saveConfig: (config: any) => api.post('/config', config),
};

export const dynamicApi = {
  getAll: (entityName: string) => api.get(`/generated/${entityName.toLowerCase()}`),
  create: (entityName: string, data: any) => api.post(`/generated/${entityName.toLowerCase()}`, data),
};

export const featureApi = {
  importCsv: (data: any) => api.post('/features/csv-import', data),
  exportGithub: (data: any) => api.post('/features/github-export', data),
};

export default api;
