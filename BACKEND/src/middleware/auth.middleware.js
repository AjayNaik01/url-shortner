import { verifyToken } from "../utils/helper.js";
import { findUserById } from "../dao/user.dao.js";

export const authMiddleware = async (req, res, next) => {
    // Get token from cookie or Authorization header
    let token = req.cookies.accessToken;
    
    // Check for Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    
    console.log("Auth check - Headers:", JSON.stringify(req.headers['authorization'] || "None"));
    console.log("Auth check - Cookies:", JSON.stringify(req.cookies || "None"));

    if (!token) {
        console.log("No token found in cookies or Authorization header");
        return res.status(401).json({ message: "No token found. Please log in." });
    }

    try {
        const decoded = await verifyToken(token);
        
        // If the token payload contains an id property
        const userId = decoded.id || decoded;
        
        const user = await findUserById(userId);

        if (!user) {
            console.log("User not found with ID:", userId);
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Auth error:", error.message);
        return res.status(401).json({ message: "Authentication failed: " + error.message });
    }
};


