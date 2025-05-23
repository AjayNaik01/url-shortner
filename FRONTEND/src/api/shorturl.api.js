import axios from "axios";

// Set default axios config for all requests
axios.defaults.withCredentials = true;

//it's used when not user is not logged in
export const createShortUrl = async (url) => {
    return await axios.post("http://localhost:3000/api/create", { url });
}

//store user details along url
export const createShortUrlWithUserId = async (url) => {
    return await axios.post("http://localhost:3000/api/shorten", { url });
}

//same ^
export const customShortUrl = async (full_url, short_url) => {
    return await axios.post(
        "http://localhost:3000/api/custom",
        { full_url, short_url },
        { withCredentials: true }
    );
};

export const getAllUrl = async () => {
    return await axios.get(
        "http://localhost:3000/api/urls",
        { withCredentials: true }
    );
};
