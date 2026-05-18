// ============================================================
// GigFlow Frontend — Axios API Client
// Configured with Vite env base URL and automatic Bearer
// token injection via request interceptor.
// ============================================================

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// ---- Constants ----

const API_BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const TOKEN_KEY: string = "gigflow_token";

// ---- Create Axios Instance ----

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request Interceptor: Attach Bearer Token ----

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token: string | null = localStorage.getItem(TOKEN_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  }
);

// ---- Response Interceptor: Handle 401 Globally ----

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError): Promise<never> => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired — clear auth state
      localStorage.removeItem(TOKEN_KEY);

      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ---- Export ----

export { TOKEN_KEY };
export default api;
