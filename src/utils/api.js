import axios from 'axios';
import { lockHeader } from './moduleLock';

/* Axios: simu zote za Backend zinapita hapa. Token ya JWT inaambatishwa kiotomatiki. */
export const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api' });

export const getToken = () => localStorage.getItem('sn_token') || sessionStorage.getItem('sn_token');
export const setToken = (token, remember) => {
  clearAuth();
  (remember ? localStorage : sessionStorage).setItem('sn_token', token);
};
export const clearAuth = () => {
  localStorage.removeItem('sn_token');
  sessionStorage.removeItem('sn_token');
};

api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  const h = lockHeader();                       // tokens za module zilizofunguliwa (kwenye memory tu)
  if (h) cfg.headers['X-Module-Tokens'] = h;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Token imekwisha muda: mtoe mtumiaji, isipokuwa wakati wa kuingia mwenyewe
    if (err.response?.status === 401 && !String(err.config?.url).includes('/auth/login')) {
      clearAuth();
      window.dispatchEvent(new Event('sn-logout'));
    }
    return Promise.reject(err);
  }
);