import User from "../models/user.model.js";

export const findUserByEmail = async (email) => {
    return await User.findOne({ email: email.toLowerCase().trim() });
}

export const findUserById = async (id) => {
    return await User.findById(id);
}

export const createUser = async (name, email, password) => {
    const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
    });
    await newUser.save();
    return newUser;
}

