import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = process.env.REACT_APP_API_URL;

export const loginUser = async (email, password) => {
    const { data } = await axios.post(
        `https://url-shortner-eight-lime.vercel.app/api/auth/login`,
        { email, password },
        { withCredentials: true }
    );
    return data;
};

export const registerUser = async (name, email, password) => {
    const { data } = await axios.post(
        `https://url-shortner-eight-lime.vercel.app/api/auth/register`,
        { name, email, password },
        { withCredentials: true }
    );
    return data;
};

export const logoutUser = async () => {
    const { data } = await axios.post(
        `https://url-shortner-eight-lime.vercel.app/api/auth/logout`,
        {},
        { withCredentials: true }
    );
    return data;
};

export const getCurrentUser = async () => {
    try {
        const { data } = await axios.get(
            `https://url-shortner-eight-lime.vercel.app/api/auth/me`,
            { withCredentials: true }
        );
        return data;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
};
