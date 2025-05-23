import { findUserByEmail } from "../dao/user.dao.js";
import { createUser } from "../dao/user.dao.js"; // Make sure createUser is exported from user.dao.js
import { signToken } from "../utils/helper.js";
import { ConflictError } from "../utils/error.js"; // Ensure you define this custom error if needed
import { UnauthorizedError } from "../utils/error.js";

export const registerUser = async (name, email, password) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) throw new ConflictError("User already exists");

    const newUser = await createUser(name, email, password);
    const token = signToken({ id: newUser._id });

    return { token, user: newUser }; // return both token and user
};


export const loginUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user || user.password !== password) {
        throw new UnauthorizedError("Invalid credentials");
    }

    const token = signToken({ id: user._id });
    return { token, user }; // Return both token and user
};
