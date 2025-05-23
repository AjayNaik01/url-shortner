import { nanoid } from "nanoid";
import { cookieOption } from "../config/config.js";
import jwt from "jsonwebtoken";

export const generateNanoId = (length = 7) => {
    return nanoid(length);
};

export const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

export const verifyToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
};
