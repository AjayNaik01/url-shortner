import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sign a token with the user ID
export const signToken = (payload) => {
    // Make sure the payload includes the user ID
    return jwt.sign(
        { id: payload.id || payload }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
    );
};

// Verify a token and return the decoded payload
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
