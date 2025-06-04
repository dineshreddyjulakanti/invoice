import axios from 'axios';

/* --------- reveal what CRA believes the API URL is --------- */
const API_ROOT =
  process.env.REACT_APP_API_URL?.trim() || 'http://localhost:5000';
console.log('[Invoices API] baseURL =', API_ROOT + '/api/invoices');
/* ----------------------------------------------------------- */

const api = axios.create({ baseURL: API_ROOT + '/api/invoices' });

export const getInvoices   = ()            => api.get('/');
export const getInvoice    = id            => api.get(`/${id}`);
export const createInvoice = data          => api.post('/', data);
export const updateInvoice = (id, data)    => api.put(`/${id}`, data);
export const deleteInvoice = id            => api.delete(`/${id}`);
