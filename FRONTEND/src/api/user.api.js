import axios from "axios";

// ✅ Optional: Set this once for all Axios requests
axios.defaults.withCredentials = true;

export const loginUser = async (email, password) => {
    const { data } = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password },
        { withCredentials: true } // 👈 Ensures cookies are sent
    );
    return data;
};

export const registerUser = async (name, email, password) => {
    const { data } = await axios.post(
        "http://localhost:3000/api/auth/register",
        { name, email, password },
        { withCredentials: true } // 👈 Ensures cookies are sent
    );
    return data;
};

export const logoutUser = async () => {
    const { data } = await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true } // 👈 Include credentials for logout
    );
    return data;
};

export const getCurrentUser = async () => {
    try {
        const { data } = await axios.get(
            "http://localhost:3000/api/auth/me",
            { withCredentials: true }
        );
        return data;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
};
