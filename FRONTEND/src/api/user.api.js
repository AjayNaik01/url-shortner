import axios from "axios";

// Get the API base URL from environment variables
const API_BASE_URL =  'https://url-shortner-eight-lime.vercel.app';

// Set default axios config
axios.defaults.withCredentials = true;

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Add an interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (email, password) => {
    try {
        const { data } = await api.post(
            "/api/auth/login",
            { email, password }
        );
        // Store the token in localStorage
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const registerUser = async (name, email, password) => {
    try {
        const { data } = await api.post(
            "/api/auth/register",
            { name, email, password }
        );
        // Store the token in localStorage
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const { data } = await api.post("/api/auth/logout");
        // Remove the token from localStorage
        localStorage.removeItem('token');
        return data;
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const { data } = await api.get("/api/auth/me");
        return data;
    } catch (error) {
        console.error("Error fetching current user:", error);
        // If unauthorized, clear the token
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
        }
        throw error;
    }
};
