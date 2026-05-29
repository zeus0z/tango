import axios from 'axios';
import { supabase } from './supabase';

// VITE_API_URL is not declared in vite-env.d.ts (future env var for the AI backend).
// Read via safe cast to avoid editing that file (owned by another issue).
const baseURL =
  (import.meta.env as Record<string, string | undefined>).VITE_API_URL ?? '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the Supabase JWT to every outgoing request.
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Global 401 handler — redirect to the landing page (login).
api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (
      axios.isAxiosError(err) &&
      err.response?.status === 401
    ) {
      window.location.href = '/';
    }
    return Promise.reject(err);
  },
);
