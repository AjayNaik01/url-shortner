import ShortUrl from "../models/shorturl.model.js";
import { generateNanoId } from "../utils/helper.js";

export const createShortUrlService = async (url, userId) => {
    const shortUrl = generateNanoId(7);
    const newUrl = new ShortUrl({
        full_url: url,
        short_url: shortUrl,
        user: userId,
    });
    await newUrl.save();
    return shortUrl;
};

