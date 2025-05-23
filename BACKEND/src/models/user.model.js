import mongoose from "mongoose";
import crypto from "crypto";

function getGravatarUrl(email) {
    const hash = crypto
        .createHash("md5")
        .update(email.trim().toLowerCase())
        .digest("hex");

    return `https://www.gravatar.com/avatar/${hash}?d=mp`; // Corrected to use backticks
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: function () {
            return getGravatarUrl(this.email);
        },
    }
});

const User = mongoose.model("User", userSchema);
export default User;
