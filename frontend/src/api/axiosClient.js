/**
 * Axios HTTP Client
 * ==================
 * Injects JWT Bearer token on every request.
 * Injects Accept-Language header for backend localization.
 * Silently refreshes expired tokens and retries failed requests.
 */
import axios from "axios";
import i18n from "../i18n/i18n";
import { BASE_URL, ENDPOINTS } from "../constants/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Attach JWT & Language
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] = i18n.language || "en";
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Token Refresh & Auth Handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Fix Bug 2: Exclude auth routes from automatic refresh/redirect
    const isAuthRoute =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/token") ||
      originalRequest.url?.includes("/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh token available");

        // Fix Bug 1: Construct absolute URL or construct using BASE_URL
        const refreshUrl = ENDPOINTS.AUTH.REFRESH.startsWith("http")
          ? ENDPOINTS.AUTH.REFRESH
          : `${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`;

        const { data } = await axios.post(refreshUrl, { refresh });

        localStorage.setItem("access_token", data.access);
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh); // Handle rotated refresh tokens if configured in Django
        }

        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        // Redirect only if not already on the login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
