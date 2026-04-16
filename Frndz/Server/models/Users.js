import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String },
    about: { type: String },
    posts: { type: Array, default: [] },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] }
}, { timestamps: true });

const User = mongoose.model("users", userSchema);
export default User;
