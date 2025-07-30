import { cookieOption } from "../config/config.js";
import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields (name, email, password) are required"
            });
        }

        const { token, user } = await registerUser(name, email, password);

        // Set the token as a cookie
        res.cookie("accessToken", token, cookieOption);

        // Also return the token in the response body for clients that prefer Bearer token auth
        res.status(201).json({
            message: "Registration successful!",
            user,
            token
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(err.statusCode || 500).json({
            message: err.message || "Internal server error during registration"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const { token, user } = await loginUser(email, password);

        // Set the token as a cookie
        res.cookie("accessToken", token, cookieOption);

        // Also return the token in the response body for clients that prefer Bearer token auth
        res.status(200).json({
            message: "Login successful!",
            user,
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(error.statusCode || 401).json({
            message: error.message || "Authentication failed"
        });
    }
};
