import React, { useContext, useState,useEffect } from 'react';
import '../styles/CreatePosts.css'
import { GeneralContext } from '../context/GeneralContextProvider';
import { RxCross2 } from 'react-icons/rx';
//import {ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
//import {storage} from '../firebase.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const CreateStory = () => {

    const {socket, isCreateStoryOpen, setIsCreateStoryOpen} = useContext(GeneralContext);

    const [storyType, setStoryType] = useState('photo');
    const [storyDescription, setStoryDescription] = useState('');
    const [storyFile, setStoryFile] = useState(null);
 
    const [uploadProgress, setUploadProgress] = useState(0);

  // This runs AFTER the render is complete
useEffect(() => {
        if (uploadProgress === 100) {
            const timer = setTimeout(() => {
                // Reset everything to base state
                setStoryDescription('');
                setStoryFile(null);
                setUploadProgress(0); 
                setIsCreateStoryOpen(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [uploadProgress, setIsCreateStoryOpen]);

    const CLOUD_NAME = "*********";
    const UPLOAD_PRESET = "**********";

    const handleStoryUpload = async (e) =>{
        e.preventDefault();
        if (!storyFile) return alert("Please select a file first!");
        const formData = new FormData();
    formData.append('file', storyFile);
    formData.append('upload_preset', UPLOAD_PRESET);
        try {
        setUploadProgress(1); // Start fake progress

        // 1. Upload to Cloudinary
        const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, 
            formData,
            {
                onUploadProgress: (p) => {
                    setUploadProgress(Math.round((p.loaded * 100) / p.total));
                }
            }
        );

        const downloadURL = res.data.secure_url; // Cloudinary returns the public URL here
        console.log('File available at', downloadURL);

            try{
                 socket.emit('create-new-story', {userId: localStorage.getItem('userId'), username: localStorage.getItem('username'), 
                                                        userPic: localStorage.getItem('profilePic'), fileType: storyType, file: downloadURL, 
                                                        text: storyDescription});
                //setIsCreateStoryOpen(false);
                //setStoryDescription('');
               // setStoryFile(null);
                //setIsCreateStoryOpen(false);
                setUploadProgress(100);

            }catch(err){
                console.log(err);
            }
        } catch (err) {
            console.error("Cloudinary Error:", err);
            setUploadProgress(0);
            alert("Upload failed!");
        }

    };

  return (
    <div className="createPostModalBg" style={isCreateStoryOpen? {display: 'flex'} : {display: 'none'}} >
            <div className="createPostContainer">
               
                <RxCross2 className='closeCreatePost' 
                onClick={()=> {
                    setIsCreateStoryOpen(false);
                     setUploadProgress(0);}} />
                <h2 className="createPostTitle">Add new story</h2>
                <hr className="createPostHr" />
                
                <div className="createPostBody">
                    <form>

                    <select className="form-select" aria-label="Select Post Type" onChange={(e)=> setStoryType(e.target.value)}  >
                        <option defaultValue='photo'>Choose post type</option>
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                    </select>

                        <div className="uploadBox">
                            <input type="file" name="PostFile" id="uploadPostFile" onChange={(e)=> setStoryFile(e.target.files[0])} />
                        </div>
                        <div className="form-floating mb-3 authFormInputs descriptionInput">
                            <input type="text" className="form-control descriptionInput" id="floatingDescription" placeholder="Description" 
                                                                onChange={(e)=> setStoryDescription(e.target.value)} value={storyDescription}  /> 
                            <label htmlFor="floatingDescription">Text</label>
                        </div>
                        {uploadProgress > 0 && uploadProgress <= 100 ? (
    <button disabled className="uploadBtn disabled">
        Uploading... {Math.round(uploadProgress)}%
    </button>
) : (
    <button className="uploadBtn" onClick={handleStoryUpload}>
        Upload
    </button>
)}
                    </form>
                </div>
            </div>
        </div>
  )
}

export default CreateStory