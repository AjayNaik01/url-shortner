import express from "express";
import { register, login } from "../controller/auth.Controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Logout route
router.post("/logout", (req, res) => {
    res.clearCookie("accessToken");
    res.status(200).json({ message: "Logged out successfully" });
});

// Get current user route
router.get("/me", authMiddleware, (req, res) => {
    // The user is already attached to the request by the authMiddleware
    const { _id, name, email, avatar } = req.user;
    res.status(200).json({ user: { _id, name, email, avatar } });
});

export default router;
