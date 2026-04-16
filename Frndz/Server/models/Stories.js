import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId
        ref: 'users', // Reference to your User model name
        required: true
    },
    username: {
        type: String
    },
    userPic:{
        type: String
    },
    fileType: {
        type: String
    },
    file: {
        type: String
    },
    text:{
        type: String
    },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }] // Best practice for viewers
}, {timestamps: true});

const Stories = mongoose.model('stories', storySchema);
export default Stories;