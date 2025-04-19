import axios from "axios";
import store from "../store";
import router from "../router";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Updated to match new API
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || store.state.auth.token;
    if (token) {
      // Updated to use Bearer token format
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    // The new API returns data with success status
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      store.dispatch("auth/logout");
      router.push("/login");
    }

    return Promise.reject(error);
  }
);

export default api;
