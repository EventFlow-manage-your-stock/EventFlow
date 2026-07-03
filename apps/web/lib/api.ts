import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3002/api', // Upewnij się, że port jest właściwy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ten kod uruchamia się przed każdym wysłaniem zapytania do backendu
api.interceptors.request.use((config) => {
  // Sprawdzamy, czy jesteśmy po stronie przeglądarki (Next.js SSR safety)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});