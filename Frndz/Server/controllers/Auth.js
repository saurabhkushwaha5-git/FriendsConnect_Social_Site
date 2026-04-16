import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';

// Helper to format user data for responses
const formatUserData = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
    about: user.about,
    posts: user.posts,
    followers: user.followers,
    following: user.following
});

const generateToken = (id) => {
    // Use an environment variable for security
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

    return jwt.sign({ id }, jwtSecret, {
        expiresIn: '30d',
    });
};

export const register = async (req, res) => {
    try {
        const { username, email, password, profilePic } = req.body;

        // Check if user already exists
        const existingUser = await Users.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "User already exists." });

        const salt = await bcrypt.genSalt(10); // Explicit salt rounds (10 is standard)
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new Users({
            username,
            email,
            password: passwordHash,
            profilePic
        });

        const savedUser = await newUser.save();
        const token = generateToken(savedUser._id);

        res.status(201).json({ 
            token, 
            user: formatUserData(savedUser) 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Use .lean() or select(+password) if your model hides password by default
        const user = await Users.findOne({ email: email });
        if (!user) return res.status(400).json({ msg: "User does not exist. " });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

        const token = generateToken(user._id);

        res.status(200).json({ 
            token, 
            user: formatUserData(user) 
        });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
