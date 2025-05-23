import express from "express";
import { createShortUrl, createCustomShortUrl, createShortUrlWithUSerId, getShortUrls } from "../controller/shortul.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", createShortUrl);
router.post("/shorten", authMiddleware, createShortUrlWithUSerId);
router.post("/custom", authMiddleware, createCustomShortUrl);
router.get("/urls", authMiddleware, getShortUrls);

export default router;
