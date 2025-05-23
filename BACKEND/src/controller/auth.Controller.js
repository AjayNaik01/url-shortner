import { cookieOption } from "../config/config.js";
import { registerUser } from "../services/auth.service.js";
import { loginUser } from "../services/auth.service.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const { token, user } = await registerUser(name, email, password); // Destructure here

        res.cookie("accessToken", token, cookieOption);
        res.status(200).json({ message: "Registration successful!", user });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await loginUser(email, password); // Destructure both

        res.cookie("accessToken", token, cookieOption);
        res.status(200).json({ message: "Login successful!", user });
    } catch (error) {
        res.status(error.statusCode || 401).json({ message: error.message });
    }
};
