import axios from "axios";
import store from "../store";
import router from "../router";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:3000", // Update with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || store.state.auth.token;
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    // Format successful responses if needed
    if (response.data && response.data.status === "error") {
      return Promise.reject({
        response: {
          data: {
            message: response.data.data || "An error occurred",
          },
        },
      });
    }
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
