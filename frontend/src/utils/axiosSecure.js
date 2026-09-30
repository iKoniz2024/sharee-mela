import axios from "axios";
import { getApiUrl } from "./getApiUrl";

const axiosSecure = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosSecure.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized), we haven't retried yet, and we are not already trying to refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        // Send a request to refresh the token
        await axios.post(
          `${getApiUrl()}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        // Retry the original request
        return axiosSecure(originalRequest);
      } catch (refreshError) {
        // Only redirect to login if user is accessing a protected route
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          const isProtectedRoute = path.startsWith("/dashboard") || path.startsWith("/profile") || path.startsWith("/my-orders") || path.startsWith("/change-password");
          if (isProtectedRoute) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosSecure;
