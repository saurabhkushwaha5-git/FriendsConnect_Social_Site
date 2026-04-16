import React, { useContext, useEffect, useState } from 'react'
import '../styles/ProfilePage.css'
import '../styles/Posts.css';
import { AiOutlineHeart, AiTwotoneHeart } from "react-icons/ai";
import { BiCommentDetail } from "react-icons/bi";
import { FaGlobeAmericas } from "react-icons/fa";
import HomeLogo from '../components/HomeLogo'
import Navbar from '../components/Navbar'
import { AuthenticationContext } from '../context/AuthenticationContextProvider'
import { GeneralContext } from '../context/GeneralContextProvider'
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const { logout, updateLocalUser } = useContext(AuthenticationContext);
    const { socket } = useContext(GeneralContext);
    const { id } = useParams();
    const userId = localStorage.getItem("userId");

    const [userProfile, setUserProfile] = useState({});
    const [posts, setPosts] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Form States
    const [updateProfilePic, setUpdateProfilePic] = useState('');
    const [updateProfileUsername, setUpdateProfileUsername] = useState('');
    const [updateProfileAbout, setUpdateProfileAbout] = useState('');

    useEffect(() => {
        if (!socket) return;

        socket.emit("fetch-profile", { _id: id });

        const handleProfileFetched = ({ profile }) => {
            if (!profile) {
        console.error("No profile data received from server.");
        return;
    }
    // ADD THIS GUARD: Only update if the ID matches the URL param
    if (profile._id !== id) {
        console.log("Ignoring data meant for a different profile");
        return;
    }
            setUserProfile(profile);
            setUpdateProfilePic(profile.profilePic ||'');
            setUpdateProfileUsername(profile.username||'');
            setUpdateProfileAbout(profile.about||'');
        };

        const handleProfileUpdated = ({ profile }) => {
            console.log("Update received from server!"); // Add this to debug
            setUserProfile(profile);
             // 1. THIS IS THE KEY: Close the edit form
                setIsUpdating(false); 
            if (profile._id === userId) {
                updateLocalUser(profile);
            }
        };

        socket.on("profile-fetched", handleProfileFetched);
        socket.on("profile-updated", handleProfileUpdated);

        return () => {
            socket.off("profile-fetched", handleProfileFetched);
            socket.off("profile-updated", handleProfileUpdated);
        };
    }, [socket, id, userId, updateLocalUser]);

    const handleUpdate = () => {
        socket.emit('updateProfile', { 
            userId: userId, 
            profilePic: updateProfilePic, 
            username: updateProfileUsername, 
            about: updateProfileAbout 
        });
         // Add this line here to close the edit card immediately
    setIsUpdating(false); 
    };

    return (
        <div className='profilePage'>
            <HomeLogo />
            <Navbar />

            {/* VIEW CARD - Visible when NOT updating */}
            <div className="profileCard" style={{ display: isUpdating ? 'none' : 'flex' }}>
                <img 
             src={userProfile?.profilePic && userProfile.profilePic !== "" ? userProfile.profilePic : "https://placeholder.com"} 
            alt="Picture"
            />

                <h4>{userProfile?.username}</h4>
                <p>{userProfile?.about}</p>
                
                <div className="profileDetailCounts">
                    <div className="followersCount">
                        <p>Followers</p>
                        <p><b>{userProfile?.followers?.length || 0}</b></p>
                    </div>
                    <div className="followingCounts">
                        <p>Following</p>
                        <p><b>{userProfile?.following?.length || 0}</b></p>
                    </div>
                </div>

                <div className="profileControlBtns">
                    {userProfile?._id === userId && (
                        <>
                            <button onClick={logout} style={{backgroundColor: '#dc3545'}}>Logout</button>
                            <button onClick={() => setIsUpdating(true)}>Edit</button>
                        </>
                    )}
                </div>
            </div>

            {/* EDIT CARD - Visible only when updating */}
            <div className='profileEditCard' style={{ display: !isUpdating ? 'none' : 'flex' }}>
                <h4 style={{marginBottom: '20px'}}>Update Profile</h4>
                <div style={{width: '80%', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <label>Profile Image URL</label>
                    <input type="text" className="form-control" value={updateProfilePic} onChange={(e) => setUpdateProfilePic(e.target.value)} />
                    
                    <label>Username</label>
                    <input type="text" className="form-control" value={updateProfileUsername} onChange={(e) => setUpdateProfileUsername(e.target.value)} />
                    
                    <label>About</label>
                    <input type="text" className="form-control" value={updateProfileAbout} onChange={(e) => setUpdateProfileAbout(e.target.value)} />
                    
                    <div className="profileControlBtns" style={{marginTop: '10px', justifyContent: 'center'}}>
                         <button onClick={() => setIsUpdating(false)} style={{backgroundColor: 'grey'}}>Cancel</button>
                         <button onClick={handleUpdate}>Update</button>
                    </div>
                </div>
            </div>

            <div className="profilePostsContainer">
                {posts.filter(post => post.userId === userProfile._id).map((post) => (
                    <div className="Post" key={post._id}>
                        {/* Post details here... */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
