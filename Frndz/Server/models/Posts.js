import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    // Link to the User model using ObjectId
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userPic: {
        type: String
    },
    fileType: {
        type: String,
        enum: ['image', 'video'], // Optional: Restricts type to only these two
        default: 'image'
    },
    file: {
        type: String, // Usually the URL of the image/video
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    likes: {
        type: Array,
        default: [] // Ensures it starts as an empty list
    },
    comments: {
        type: Array,
        default: [] // Ensures it starts as an empty list
    }
}, { timestamps: true });

const Post = mongoose.model("posts", postSchema);
export default Post;
