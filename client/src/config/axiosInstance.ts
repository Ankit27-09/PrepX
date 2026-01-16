import { logout, setAccessToken } from '@/store/auth/authSlice';
import { store } from '@/store/store';
import axios from 'axios';
import { backendUrl } from './backendUrl';

const api = axios.create({
  baseURL: `${backendUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: false - cookies not sent on regular requests
  // Access token sent via Authorization header instead
});

// Attach access token to each request if available
api.interceptors.request.use((config) => {
  const accessToken = store.getState().auth.accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Intercept 401 responses to refresh the access token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Add null check for error.response (network errors don't have response)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${backendUrl}/api/v1/auth/refresh`, {}, { withCredentials: true });
        store.dispatch(setAccessToken(data.accessToken));
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Token refresh failed - user needs to login again
        store.dispatch(logout());

        // Redirect to login page
        window.location.href = '/Login';
        return Promise.reject(err);
      }
    }

    // For other 401 errors (not retried), redirect to login
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/Login';
    }

    return Promise.reject(error);
  }
);

export default api;
