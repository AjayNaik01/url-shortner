import { verifyToken } from "../utils/helper.js";
import { findUserById } from "../dao/user.dao.js";


export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.accessToken;
    console.log("Access Token:", token);
    console.log("Cookies received:", req.cookies);

    if (!token) {
        console.log("No token found in cookies");
        return res.status(401).json({ message: "No token found. Please log in." });
    }

    try {
        const decoded = await verifyToken(token);
        console.log("Decoded token:", decoded);

        const user = await findUserById(decoded);
        console.log("User Found:", user);

        if (!user) {
            console.log("User not found with ID:", decoded);
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Auth error:", error.message);
        return res.status(401).json({ message: "Authentication failed: " + error.message });
    }
};
