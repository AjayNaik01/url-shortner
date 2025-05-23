import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

// The function is currently named 'generateNanoId' but the error suggests it's not exported
export const generateNanoId = (length = 7) => {
    return nanoid(length);
};

export const signToken = (payload) => {
    // Make sure the payload includes the user ID
    return jwt.sign(
        { id: payload.id || payload }, 
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
};
