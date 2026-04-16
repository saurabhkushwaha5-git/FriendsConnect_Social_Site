import React, { useContext, useEffect, useState } from 'react'
import '../styles/Stories.css'
import { BiPlusCircle } from 'react-icons/bi'
import { GeneralContext } from '../context/GeneralContextProvider';
import axios from 'axios';
import { RxCross2 } from 'react-icons/rx';
import navProfile from '../images/nav-profile.png';

const Stories = () => {
    const { socket, setIsCreateStoryOpen } = useContext(GeneralContext);
    const [stories, setStories] = useState([]);
    const [isStoryPlaying, setIsStoryPlaying] = useState(false);
    const [story, setStory] = useState(null);

    // Get current user data safely
    const currentUserId = localStorage.getItem('userId');
    const followingList = localStorage.getItem('following') || "";

    const addStory = () => {
        setIsCreateStoryOpen(true);
    };

    /*useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const response = await axios.get('http://localhost:6001/auth/fetchAllStories');
            setStories(response.data);
        } catch (error) {
            console.error("Error fetching stories:", error);
        }
    };*/

        useEffect(() => {
        if (!socket || !currentUserId) return;

        // 1. Define the handler function inside the effect
        const handleStories = ({ stories }) => {
            setStories(stories);
        };

        // 2. Request stories
        socket.emit('fetch-stories', { userId: currentUserId });

        // 3. Set up listeners
        socket.on('stories-fetched', handleStories);

        // 4. Handle real-time updates
        const handleUpdate = () => {
            socket.emit('fetch-stories', { userId: currentUserId });
        };
        socket.on('new-story-added', handleUpdate);

        // 5. Cleanup function
        return () => {
            socket.off('stories-fetched', handleStories);
            socket.off('new-story-added', handleUpdate);
        };
    }, [socket, currentUserId]); 



    const handleOpenStory = (storyData) => {
        setStory(storyData);
        setIsStoryPlaying(true);
        // Safety check for socket before emitting
        if (socket) {
            socket.emit('story-played', { storyId: storyData._id, userId: currentUserId });
        }
    };

    const handleCloseStory = () => {
        setIsStoryPlaying(false);
        setStory(null); // Clear active story memory
    };

    return (
        <div className='storiesContainer'>
            <div className="storiesTitle">
                <h3>Stories</h3>
            </div>

            <div className="storiesBody" style={isStoryPlaying ? { display: 'none' } : {}}>
                <div className="stories">
                    <div className="story self-story" onClick={addStory}>
                        <img src={localStorage.getItem('profilePic') || "/images/nav-profile.png"} alt="Profile" />
                        <p>Add story</p>
                        <span><BiPlusCircle /></span>
                    </div>

                    {stories && stories
                      /*  .filter(s => {
                            const isFollowing = followingList.includes(s.userId) || s.userId === currentUserId;
                            const isRecent = (new Date() - new Date(s.createdAt)) < 24 * 60 * 60 * 1000;
                            return isFollowing && isRecent;
                        })*/
                        .map((s) => (
                            <div 
                                className="story user-story" 
                                key={s._id}
                                onClick={() => handleOpenStory(s)}
                                style={{
                                    border: s.viewers?.includes(currentUserId) 
                                        ? '3px solid #a5a7a995' 
                                        : '3px solid #569bdfc9'
                                }}
                            >
                                <img src={s.userPic || "/images/nav-profile.png"} alt={s.username} />
                                <p>{s.username}</p>
                            </div>
                        ))
                    }
                </div>
            </div>

            {story && isStoryPlaying && (
                <div className="storyPlayContainer">
                    <div className="storyPlayBodyTop">
                        <p>{story.username}</p>
                        <span onClick={handleCloseStory}><RxCross2 /></span>
                    </div>
                    <div className="storyPlayBodyContent">
                       {story.fileType === 'photo' ? (
    // Only render the img tag if story.file actually has a value
    story.file && <img src={story.file} alt="Story Content" />
) : (
    // Only render the video tag if story.file actually has a value
    story.file && <video src={story.file} className='postimg' controls autoPlay muted playsInline />
)}

                        <p>{story.text}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Stories;
