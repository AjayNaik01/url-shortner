import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = process.env.REACT_APP_API_URL;

// it's used when user is not logged in
export const createShortUrl = async (url) => {
    return await axios.post(`https://url-shortner-eight-lime.vercel.app/api/create`, { url });
};

// store user details along with url
export const createShortUrlWithUserId = async (url) => {
    return await axios.post(`${API_URL}/api/shorten`, { url });
};

// same ^
export const customShortUrl = async (full_url, short_url) => {
    return await axios.post(
        `${API_URL}/api/custom`,
        { full_url, short_url },
        { withCredentials: true }
    );
};

export const getAllUrl = async () => {
    return await axios.get(
        `${API_URL}/api/urls`,
        { withCredentials: true }
    );
};
