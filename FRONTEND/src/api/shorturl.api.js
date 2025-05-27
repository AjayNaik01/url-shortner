import axios from "axios";

// Create a consistent API instance with auth handling
const api = axios.create({
    baseURL: 'https://url-shortner-eight-lime.vercel.app',
    withCredentials: true
});

// Add token to all requests
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

// it's used when user is not logged in
export const createShortUrl = async (url) => {
    return await axios.post(`https://url-shortner-eight-lime.vercel.app/api/create`, { url });
};

// store user details along with url
export const createShortUrlWithUserId = async (url) => {
    return await axios.post(`https://url-shortner-eight-lime.vercel.app/api/shorten`, { url });
};

// same ^
export const customShortUrl = async (full_url, short_url) => {
    return await api.post("/api/custom", { full_url, short_url });
};

export const getAllUrl = async () => {
    return await api.get("/api/urls");
};

