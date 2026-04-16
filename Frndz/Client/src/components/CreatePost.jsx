import React, { useContext, useState, useEffect } from 'react';
import '../styles/CreatePosts.css';
import { RxCross2 } from 'react-icons/rx';
import { GeneralContext } from '../context/GeneralContextProvider';
import axios from "axios";
import { AuthenticationContext } from '../context/AuthenticationContextProvider';
import { SocketContext } from '../context/SocketContextProvider'; // 1. Add this import

const CreatePost = () => {
    const { isCreatePostOpen, setIsCreatePostOpen } = useContext(GeneralContext);
    const { userData } = useContext(AuthenticationContext);
     // 2. Add this line to access the socket
    const { socket } = useContext(SocketContext); 
    const [postType, setPostType] = useState('photo');
    const [postDescription, setPostDescription] = useState('');
    const [postLocation, setPostLocation] = useState('');
    const [postFile, setPostFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Cloudinary Config - Replace with your actual credentials
    const CLOUD_NAME = "**********"; 
    const UPLOAD_PRESET = "*********"; 

    useEffect(() => {
        if (uploadProgress === 100) {
            const timer = setTimeout(() => {
                setPostDescription('');
                setPostLocation('');
                setPostFile(null);
                setIsCreatePostOpen(false);
                setUploadProgress(0);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [uploadProgress, setIsCreatePostOpen]);

    const handlePostUpload = async (e) => {
        e.preventDefault();
        if (!postFile) return alert("Please select a file!");

        const formData = new FormData();
        formData.append('file', postFile);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            setUploadProgress(1); // Start progress bar

            // 1. Upload to Cloudinary
            const cloudRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
                formData,
                {
                    onUploadProgress: (p) => {
                        setUploadProgress(Math.round((p.loaded * 100) / p.total));
                    }
                }
            );

            const downloadURL = cloudRes.data.secure_url;
            console.log('File available at Cloudinary:', downloadURL);

            // 2. Send Data to your Backend
            const inputs = {
                userId: localStorage.getItem('userId'),
                userName: userData?.username,
                userPic: userData?.profilePic,
                fileType: postType,
                file: downloadURL,
                description: postDescription,
                location: postLocation,
                likes: [], // Initialize empty
                comments: { "Admin": "Welcome to your new post!" }
            };
            // Emit the event to the SocketHandler we just updated  
            socket.emit('newPostCreated', inputs);
            //await axios.post('http://localhost:6001/createPost', inputs);
            setTimeout(() => {
                setUploadProgress(100);
            }, 500);

        } catch (err) {
            console.error("Upload Error:", err);
            setUploadProgress(0);
            alert("Failed to upload post.");
        }
    };

    return (
        <div className="createPostModalBg" style={isCreatePostOpen ? { display: 'flex' } : { display: 'none' }}>
            <div className="createPostContainer">
                <RxCross2 className='closeCreatePost' onClick={() => {
                    setIsCreatePostOpen(false);
                    setUploadProgress(0);
                }} />
                <h2 className="createPostTitle">Create post</h2>
                <hr className="createPostHr" />

                <div className="createPostBody">
                    <form onSubmit={handlePostUpload}>
                        <select className="form-select" onChange={(e) => setPostType(e.target.value)}>
                            <option value="photo">Photo</option>
                            <option value="video">Video</option>
                        </select>

                        <div className="uploadBox">
                            <input type="file" id="uploadPostFile" onChange={(e) => setPostFile(e.target.files[0])} />
                        </div>

                        <div className="form-floating mb-3 authFormInputs">
                            <input type="text" className="form-control" placeholder="Description"
                                onChange={(e) => setPostDescription(e.target.value)} value={postDescription} />
                            <label>Description</label>
                        </div>

                        <div className="form-floating mb-3 authFormInputs">
                            <input type="text" className="form-control" placeholder="Location"
                                onChange={(e) => setPostLocation(e.target.value)} value={postLocation} />
                            <label>Location</label>
                        </div>

                        {uploadProgress > 0 && uploadProgress <= 100 ? (
                            <button disabled className="uploadBtn">Uploading... {uploadProgress}%</button>
                        ) : (
                            <button type="submit" className="uploadBtn">Upload</button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
