import Chats from './models/Chats.js';
import Post from './models/Posts.js';
import Stories from './models/Stories.js';
import User from './models/Users.js';
import mongoose from 'mongoose';

const SocketHandler = (socket) => {
    
    socket.onAny((eventName, args) => {
    console.log(`Incoming Event: ${eventName}`, args);});

    // --- LIKES ---
    socket.on('postLiked', async ({userId, postId}) => {
        await Post.updateOne({_id: postId}, {$addToSet: {likes: userId}});
        socket.emit("likeUpdated"); // Update YOU
        socket.broadcast.emit("likeUpdated"); // Update OTHERS
    });

    socket.on('postUnLiked', async ({userId, postId}) => {
        await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
        socket.emit("likeUpdated"); // Update YOU
        socket.broadcast.emit("likeUpdated"); // Update OTHERS
    });

    // --- PROFILE ---
    socket.on("fetch-profile", async ({_id}) => {
        const user = await User.findOne({_id});
        socket.emit("profile-fetched", {profile: user});
    });

  socket.on('updateProfile', async ({userId, profilePic, username, about}) => {
        // Use findByIdAndUpdate to get the updated document in one go
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { profilePic, username, about }, 
            { new: true }
        );
        
        if (updatedUser) {
            // FIX: Emit 'profile-updated' so Profile.jsx calls updateLocalUser()
            socket.emit("profile-updated", { profile: updatedUser }); 
            
            // Still broadcast 'profile-fetched' so others looking at your profile see the change
            //socket.broadcast.emit("profile-fetched", { profile: updatedUser });
        }
    });

    // --- FOLLOWS ---
    socket.on('followUser', async ({ownId, followingUserId}) => {
           try {
            // 1. THE GUARD: Stop if followingUserId is an object/invalid
            if (!followingUserId || typeof followingUserId !== 'string' || followingUserId.length !== 24) {
                console.log("Blocking invalid follow attempt:", followingUserId);
                return;
            }
        await User.updateOne({_id: ownId}, {$addToSet: {following: followingUserId}});
        await User.updateOne({_id: followingUserId}, {$addToSet: {followers: ownId}});

        const user1 = await User.findOne({_id: ownId});
        const user2 = await User.findOne({_id: followingUserId});
        
        socket.emit('userFollowed', {following: user1.following}); // FIX: Update your follow button
        //socket.broadcast.emit('userFollowed', {following: user1.following});
        // ADD THIS: This tells Stories.jsx to run its fetch-stories logic again
        socket.emit('new-story-added'); 

        if (user2.following.includes(user1._id) && user1.following.includes(user2._id)) {
            const chatId = [user1._id, user2._id].sort().join("");
            const existingChat = await Chats.findOne({ _id: chatId });
            if (!existingChat) {
                await new Chats({ _id: chatId }).save();
            }
        }
        } catch (error) {
            console.error("Follow User Error:", error);
        }
    });

    socket.on('unFollowUser', async ({ownId, followingUserId}) => {
        await User.updateOne({_id: ownId}, { $pull: { following: followingUserId } });
        await User.updateOne({_id: followingUserId}, { $pull: { followers: ownId } });

        const user = await User.findOne({_id: ownId});
        socket.emit('userUnFollowed', { following: user.following }); // FIX
       // socket.broadcast.emit('userUnFollowed', { following: user.following });
       // ADD THIS: This tells Stories.jsx to run its fetch-stories logic again
        socket.emit('new-story-added'); 
    });

     // --- FRIENDS LIST ---
    socket.on('fetch-friends', async ({ userId }) => {
        try {
            const user = await User.findById(userId);
            if (user) {
                // Extract just the ID strings and filter out invalid data
                const followingIds = user.following
                    .map(id => (id && id._id ? id._id.toString() : id?.toString()))
                    .filter(id => id && id.length === 24);

                const friendsData = await User.find({ _id: { $in: followingIds } });
                socket.emit("friends-data-fetched", { friendsData });
            }
        } catch (err) {
            console.error(err);
        }
    });
    
    
    // --- MESSAGING ---
    socket.on('fetch-messages', async ({ chatId }) => {
        const chat = await Chats.findOne({ _id: chatId });
        socket.join(chatId);
        socket.emit('messages-updated', { chat }); // FIX: Only you need your chat history
    });

    socket.on('new-message', async ({ chatId, id, text, file, senderId, date }) => {
        try {
            const chat = await Chats.findOneAndUpdate(
                { _id: chatId },
                { $addToSet: { messages: { id, text, file, senderId, date } } },
                { returnDocument: 'after'}
            );
            socket.emit('messages-updated', { chat }); // To sender
            socket.broadcast.to(chatId).emit('messages-updated', { chat }); // To receiver
        } catch (error) {
            console.error(error);
        }
    });


// --- POSTS ---
socket.on('newPostCreated', async (postData) => {
    try {
        // 1. Create the database entry using your Post model
        const newPost = new Post({
            userId: new mongoose.Types.ObjectId(postData.userId),
            userName: postData.userName,
            userPic: postData.userPic,
            // FIX: Convert 'photo' to 'image' so it passes your Schema validation
            fileType: postData.fileType === 'photo' ? 'image' : 'video', 
            file: postData.file,
            description: postData.description,
            location: postData.location,
            likes: [], 
            comments: postData.comments 
        });

        // 2. DEFINE savedPost by assigning the result of the save operation
        const savedPost = await newPost.save(); 

        console.log("✅ Post successfully saved to Database");

        // 3. BROADCAST to everyone so the feed updates instantly
        socket.emit('new-post-added',savedPost); // Tells you to refresh
        socket.broadcast.emit('new-post-added',savedPost); // Tells everyone else to refresh
        
    } catch (err) {
        console.error("❌ Database Save Error:", err);
    }
});

    // --- COMMENTS ---
    socket.on('makeComment', async ({ postId, username, comment }) => {
        try {
            // 1. Update the DB: Push as an array [username, comment] 
            // to match your frontend .map((comment) => comment[0])
            await Post.findByIdAndUpdate(
                new mongoose.Types.ObjectId(postId),
                { $push: { comments: { 
                        username: username, 
                        text: comment 
                    }  } }
            );

            console.log("✅ Comment saved to DB");

            // 2. Refresh the UI
            // Your frontend already has a 'likeUpdated' listener that calls fetchPosts()
            // We can reuse that to force the browser to get the new data.
            socket.emit("likeUpdated"); 
            socket.broadcast.emit("likeUpdated");

        } catch (err) {
            console.error("❌ Comment Error:", err);
        }
    });


    socket.on('fetch-all-posts', async () => {
        const posts = await Post.find();
        socket.emit('all-posts-fetched', { posts }); // FIX: Only you need the list you requested
    });

    socket.on('delete-post', async ({ postId }) => {
        await Post.deleteOne({ _id: postId });
        const posts = await Post.find();
        socket.emit('post-deleted', { posts }); // To you
        socket.broadcast.emit('post-deleted', { posts }); // To others
    });

// --- STORIES ---

// Inside your SocketHandler function
socket.on('create-new-story', async (data) => {
    console.log("SERVER SIDE: Received story data!"); // Should appear in terminal
    try {
        const newStory = new Stories({
            userId: new mongoose.Types.ObjectId(data.userId), // Ensure ObjectId type
            username: data.username,
            userPic: data.userPic,
            fileType: data.fileType,
            file: data.file,
            text: data.text,
            viewers: []
        });

       await newStory.save();
       console.log("SUCCESS: Story saved to MongoDB");
        // Tell everyone (including the sender) to refresh their stories
        socket.emit('new-story-added'); 
        socket.broadcast.emit('new-story-added');
    } catch (err) {
        console.error("Database Save Error:", err);
    }
});

// --- Replace from socket.on('fetch-stories' down to the end of the file ---

socket.on('fetch-stories', async ({ userId }) => {
    try {
        // 1. Safety check for null or invalid userId string
        if (!userId || userId === "null" || typeof userId !== 'string') return;

        const user = await User.findById(userId);
        if (!user) return;

        // 2. SANITIZE IDs: Ensure we extract only the string ID if the item is an object
        const cleanFollowing = user.following.map(id => {
            if (id && typeof id === 'object' && id._id) return id._id.toString();
            return id ? id.toString() : null;
        }).filter(id => id && id.length === 24); // Keep only valid 24-char hex strings

        // 3. Combine current user with following list and convert to ObjectIds
        const authorIds = [...cleanFollowing, userId.toString()]
            .map(id => new mongoose.Types.ObjectId(id));

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 4. Fetch stories where userId is in our list and created in last 24h
        const stories = await Stories.find({
            userId: { $in: authorIds },
            createdAt: { $gte: yesterday } 
        }).sort({ createdAt: -1 });

        // 5. Send data back to Stories.jsx
        console.log(`✅ Found ${stories.length} stories for ${user.username}`);
        socket.emit('stories-fetched', { stories });

    } catch (error) {
        console.error("❌ Fetch Stories Error:", error);
    }
}); 

}; // End of SocketHandler function

export default SocketHandler;

