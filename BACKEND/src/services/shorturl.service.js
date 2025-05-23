import ShortUrl from "../models/shorturl.model.js";
import { nanoid } from "nanoid";  // Import directly from nanoid package

export const createShortUrlService = async (url, userId) => {
    const shortUrl = nanoid(7);  // Use nanoid directly
    const newUrl = new ShortUrl({
        full_url: url,
        short_url: shortUrl,
        user: userId,
    });
    await newUrl.save();
    return shortUrl;
};
