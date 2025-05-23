import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = process.env.REACT_APP_API_URL;

export const loginUser = async (email, password) => {
    const { data } = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
    );
    return data;
};

export const registerUser = async (name, email, password) => {
    const { data } = await axios.post(
        `${API_URL}/api/auth/register`,
        { name, email, password },
        { withCredentials: true }
    );
    return data;
};

export const logoutUser = async () => {
    const { data } = await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
    );
    return data;
};

export const getCurrentUser = async () => {
    try {
        const { data } = await axios.get(
            `${API_URL}/api/auth/me`,
            { withCredentials: true }
        );
        return data;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
};
