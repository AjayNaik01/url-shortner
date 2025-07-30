import { findUserByEmail } from "../dao/user.dao.js";
import { createUser } from "../dao/user.dao.js"; // Make sure createUser is exported from user.dao.js
import { signToken } from "../utils/helper.js";
import { ConflictError, UnauthorizedError, BadRequestError } from "../utils/error.js";

// Input validation helper
const validateInput = (name, email, password) => {
    if (!name || !email || !password) {
        throw new BadRequestError("All fields are required");
    }

    if (name.trim().length < 2) {
        throw new BadRequestError("Name must be at least 2 characters long");
    }

    if (password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters long");
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        throw new BadRequestError("Please enter a valid email address");
    }
};

export const registerUser = async (name, email, password) => {
    // Validate input
    validateInput(name, email, password);

    // Check if user already exists
    const existingUser = await findUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
        throw new ConflictError("User with this email already exists");
    }

    // Create new user (password will be hashed automatically by the model)
    const newUser = await createUser(name.trim(), email.toLowerCase().trim(), password);
    const token = signToken({ id: newUser._id });

    return { token, user: newUser }; // return both token and user
};

export const loginUser = async (email, password) => {
    // Validate input
    if (!email || !password) {
        throw new BadRequestError("Email and password are required");
    }

    // Find user by email
    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    // Compare password using the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const token = signToken({ id: user._id });
    return { token, user }; // Return both token and user
};
