import { createShortUrlService } from "../services/shorturl.service.js";
import ShortUrl from "../models/shorturl.model.js";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
dotenv.config();


export const createShortUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        const shortUrl = await createShortUrlService(url);
        const baseUrl = process.env.APP_URL?.replace(/\/+$/, '') || 'https://url-shortner-eight-lime.vercel.app';
        res.json({ shortUrl: `${baseUrl}/${shortUrl}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createShortUrlWithUSerId = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        const shortUrl = await createShortUrlService(url, req.user._id); // ✅ FIXED HERE
        const baseUrl = process.env.APP_URL?.replace(/\/+$/, '') || 'https://url-shortner-eight-lime.vercel.app';
        res.json({ shortUrl: `${baseUrl}/${shortUrl}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




export const redirectShortUrl = async (req, res) => {
    const { id } = req.params;

    try {
        const url = await ShortUrl.findOne({ short_url: id });

        if (!url) {
            return res.status(404).send("URL not found");
        }

        // Increment clicks
        url.clicks += 1;
        await url.save();

        // Ensure full_url has http or https
        const destination = url.full_url.startsWith("http://") || url.full_url.startsWith("https://")
            ? url.full_url
            : `https://${url.full_url}`;

        // Redirect to the full URL
        res.redirect(destination);

    } catch (error) {
        console.error("Redirect error:", error);
        res.status(500).send("Server error");
    }
};

export const createCustomShortUrl = async (req, res) => {
    const { full_url, short_url } = req.body;

    if (!full_url) {
        return res.status(400).json({ message: "full_url is required." });
    }

    if (!req.user || !req.user._id) {
        console.error("No user found in request:", req.user);
        return res.status(401).json({ message: "User not authenticated properly" });
    }

    const customShort = short_url?.trim() || nanoid(7);

    // Check for duplicates
    const existing = await ShortUrl.findOne({ short_url: customShort });
    if (existing) {
        return res.status(409).json({ message: "Short URL already exists. Try another." });
    }

    console.log("Creating URL with user ID:", req.user._id);
    console.log("User object:", JSON.stringify(req.user));

    const newUrl = new ShortUrl({
        full_url,
        short_url: customShort,
        user: req.user._id // 👈 Store user ID
    });

    await newUrl.save();
    console.log("Saved URL:", JSON.stringify(newUrl.toObject()));

    const baseUrl = process.env.APP_URL?.replace(/\/+$/, '') || 'https://url-shortner-eight-lime.vercel.app';
    res.status(201).json({
        shortUrl: `${baseUrl}/${customShort}`,
        message: "Short URL created successfully"
    });
};

export const getShortUrls = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error("No user found in request:", req.user);
            return res.status(401).json({ message: "User not authenticated properly" });
        }

        const userId = req.user._id;
        console.log("Fetching URLs for user ID:", userId);
        console.log("User object:", JSON.stringify(req.user));

        // Use exec() for better error handling
        const links = await ShortUrl.find({ user: userId }).exec();

        console.log("Found links for user:", links.length);

        // Debug: Log all URLs and their user IDs
        const allLinks = await ShortUrl.find({}).exec();
        console.log("All links in database:", allLinks.length);
        console.log("Links by user:",
            allLinks.reduce((acc, link) => {
                const userIdStr = link.user ? link.user.toString() : 'none';
                acc[userIdStr] = (acc[userIdStr] || 0) + 1;
                return acc;
            }, {})
        );

        res.status(200).json(links);
    } catch (error) {
        console.error("Error fetching URLs:", error);
        res.status(500).json({ message: "Failed to fetch links: " + error.message });
    }
};
