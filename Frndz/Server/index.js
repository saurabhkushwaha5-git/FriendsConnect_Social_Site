//Below forced Node.js to use Google and Cloudflare's DNS servers instead of your local network's default DNS.
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
// 1. Consistent Imports (ES Modules)
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config'; // Shorthand for loading .env
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your Models
import User from './models/Users.js'
import Post from './models/Posts.js'
import Stories from './models/Stories.js'
import Chats from './models/Chats.js';

import authRoutes from './routes/routes.js';
import SocketHandler from './SocketHandler.js';

// Config for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

// 2. Middleware Configuration
app.use(cors()); // Fixed: removed the double app.use
app.use(express.json({ limit: "30mb" })); // Use built-in express instead of body-parser
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Routes
app.use('/auth', authRoutes);

// 3. Basic Route
app.get('/', (req, res) => {
  res.send('Frends Social Site API is running!');
});

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

io.on("connection", (socket) => {
    console.log("User connected via Socket");
    SocketHandler(socket);
});

io.on('connection', (socket) => {
    // Check if this listener exists!
    socket.on('create-new-story', async (data) => {
        console.log("Data received on server:", data); // If you don't see this in your terminal, the emit failed
        try {
            const newStory = new Story(data); // Using your Mongoose Model
            await newStory.save();
            console.log("Saved to MongoDB!");
            
            // Broadcast so other users see it immediately
            io.emit('new-story-added', newStory); 
        } catch (error) {
            console.error("DB Save Error:", error);
        }
    });
});

// --- POST LOGIC (Add This) ---
io.on('connection', (socket) => {
    socket.on('create-new-post', async (data) => {
        try {
            const newPost = new Post({
                userId: data.userId,
                userName: data.userName,
                userPic: data.userPic,
                fileType: data.fileType,
                file: data.file,
                description: data.description,
                location: data.location,
                likes: [],
                comments: []
            });

            const savedPost = await newPost.save();
            // Broadcast to EVERYONE including the sender
            io.emit('new-post-added', savedPost); 

        } catch (error) {
            console.error("Post Save Error:", error);
            socket.emit('post-error', { message: "Failed to save post" });
        }
    });
});


// 4. Database Connection Logic
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1); // Stop the server if no DB string is found
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    
    // 5. Start Server ONLY after DB connects (Best Practice)
    const PORT = process.env.PORT || 6001;
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
  });

  //below code to test the Mongoo schema only with curl command- curl -X POST http://localhost:5000/test-setup

app.post('/test-setup', async (req, res) => {
  try {
    // 1. Create User with ALL schema fields
    const newUser = await User.create({
      username: "JohnDoe",
      email: "john@frends.com",
      password: "hashed_password_123", // In production, use bcrypt to hash!
      profilePic: "https://link-to-pic.com",
      about: "Software Developer and traveler.",
      posts: [],      // Initialized as empty array
      followers: [],  // Initialized as empty array
      following: []   // Initialized as empty array
    });

    // 2. Create Post with ALL schema fields
    const newPost = await Post.create({
      userId: newUser._id,           // Links the post to the user created above
      userName: newUser.username,     // Redundant but matches your schema
      userPic: newUser.profilePic,    // From the user object above
      fileType: "video",              // Options: image/video
      file: "https://link-to-video.com",
      description: "Exploring the mountains!",
      location: "Himalayas, India",   // Added location field
      likes: [],                      // Initialized as empty array
      comments: []                    // Initialized as empty array
    });

    // 3. Optional: Link the post ID back to the User's post array
    newUser.posts.push(newPost._id);
    await newUser.save();

    res.status(201).json({
      message: "Frends_social_site database, users, and posts collections are now fully populated!",
      user: newUser,
      post: newPost
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Setup failed", 
      details: err.message 
    });
  }
});
