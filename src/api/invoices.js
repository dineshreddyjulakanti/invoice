import axios from 'axios';

/* --------- reveal what CRA believes the API URL is --------- */
const API_ROOT =
  process.env.REACT_APP_API_BASE_URL?.trim() || 'http://127.0.0.1:5000';
console.log('[Invoices API] baseURL =', API_ROOT + '/api/invoices');
/* ----------------------------------------------------------- */

const api = axios.create({ 
  baseURL: API_ROOT + '/api/invoices',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', 
      error.response?.status, 
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const getInvoices   = ()            => api.get('/');
export const getInvoice    = id            => api.get(`/${id}`);
export const createInvoice = data          => api.post('/', data);
export const updateInvoice = (id, data)    => api.put(`/${id}`, data);
export const deleteInvoice = id            => api.delete(`/${id}`);
