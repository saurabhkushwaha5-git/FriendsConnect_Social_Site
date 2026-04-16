import React, { useContext, useEffect, useState } from 'react';
import '../styles/Posts.css';
import { AiOutlineHeart, AiTwotoneHeart } from "react-icons/ai";
import { FaGlobeAmericas } from "react-icons/fa";
import {IoIosPersonAdd} from 'react-icons/io'
import axios from 'axios';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useNavigate } from 'react-router-dom';
import { FiSend } from "react-icons/fi";

const Post = () => {

    const navigate = useNavigate();
    const {socket} = useContext(GeneralContext);
    const [posts, setPosts] = useState([]);
const [followingList, setFollowingList] = useState(JSON.parse(localStorage.getItem('following') || "[]"));  
    useEffect(() => {
        fetchPosts();
      }, []);

      const fetchPosts = async () => { 
        try {
          const response = await axios.get('http://localhost:6001/auth/fetchAllPosts');
          const fetchedPosts = response.data;
          setPosts(fetchedPosts);
        } catch (error) {
          console.error(error);
        }
      };

    //   Like
    const handleLike = (userId, postId) =>{
        socket.emit('postLiked', {userId, postId});
    }
    const handleUnLike = (userId, postId) =>{
        socket.emit('postUnLiked', {userId, postId});
    }
    
    //handle post logic frontend
    useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
    console.log("New post event received!");
        // Instead of manually pushing to state, force a fresh fetch from the database
        setTimeout(() => {
        fetchPosts(); 
    }, 500); // Wait 500ms for DB consistency
    };

    const refreshData = () => fetchPosts();

    const handleFollow = (data) => {
    // 1. Access the 'following' array from the data object
    // 2. Use JSON.stringify to save it as a proper array string
    const currentUserId = localStorage.getItem('userId');
    if (data.following) {
            localStorage.setItem('following', JSON.stringify(data.following));
                        setFollowingList(data.following); // This makes the icon disappear instantly
            fetchPosts(); // This refreshes stories/posts automatically 
        }
   // localStorage.setItem('following', JSON.stringify(data.following || []));
};

    socket.on('new-post-added', handleNewPost);
    socket.on("likeUpdated", refreshData);
    socket.on('postListUpdated', refreshData);
    socket.on('userFollowed', handleFollow);
    socket.on('userUnFollowed', handleFollow);

    return () => {
        socket.off('new-post-added', handleNewPost);
        socket.off('likeUpdated', refreshData);
        socket.off('postListUpdated', refreshData);
        socket.off('userFollowed', handleFollow);
        socket.off('userUnFollowed', handleFollow);
    };
}, [socket]);


    const handleFollow = async (userId) =>{
        socket.emit('followUser', {ownId: localStorage.getItem('userId'), followingUserId: userId});
    }

    //comment

    const [comment, setComment] = useState('');

    const handleComment = (postId, username)=>{
        socket.emit('makeComment', {postId, username, comment});
        setComment('');
    }

   const handleShare = (post) => {
    const url = `${window.location.origin}/profile/${post?.userId}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
};

  return (
    <div className='postsContainer'>

    {posts ? posts.map((post, index) => {
       // if (!post) return null;
        return(
        <div className="Post" key={post._id|| index}>

        <div className="postTop">
            <div className="postTopDetails">
                <img src={post?.userPic} alt="" className="userpic" />
                <h3 className="usernameTop" onClick={()=> navigate(`/profile/${post?.userId}`)}>{post?.userName}</h3>
            </div>

            {//(localStorage.getItem('following') || "").includes(post?.userId) || localStorage.getItem('userId') === post?.userId ?
             followingList.includes(post?.userId) || localStorage.getItem('userId') === post?.userId ?

            
            <></>
            :
            <IoIosPersonAdd style={{cursor: "pointer"}} id='addFriendInPost' onClick={()=>handleFollow(post?.userId)} />
             }

        </div>

        { post.fileType === 'image' || post.fileType === 'photo' ?  
                <img src={post?.file} className='postimg' alt="post" />
                :
                <video id="videoPlayer" className='postimg' controls autoPlay muted>
                    <source src={post?.file} />
                </video>
                }

        <div className="postReact">
            <div className="supliconcol">

                {
                    post?.likes?.includes(localStorage.getItem('userId')) ?
                    <AiTwotoneHeart className='support reactbtn'  onClick={() => handleUnLike(localStorage.getItem('userId'), post._id)}/>
                    :
                    <AiOutlineHeart className='support reactbtn'  onClick={() => handleLike(localStorage.getItem('userId'), post._id)}/>
                }
                
                <span className='supportCount'>{post?.likes?.length || 0}</span>

            </div>
            {/* <BiCommentDetail className='comment reactbtn' /> */}
            { <FiSend className='share reactbtn' onClick={()=> {handleShare(post)}} /> }
            <div className="placeiconcol">
    <FaGlobeAmericas className='placeicon reactbtn' />
    <span className='place'>{post.location}</span>
</div>
        </div>

        <div className="detail">
            <div className='descdataWithBtn'>
                <div className="desc labeldata"> 
    <span style={{fontWeight: 'bold'}}>{post.userName}</span> 
    &nbsp; {post.description}
</div>

            </div>
        </div>
        <div className="commentsContainer">
            <div className="makeComment">
                <input type="text" placeholder='type something...' value={comment} onChange={(e)=>setComment(e.target.value)}/>
                {comment.length === 0 ?
                    <button className='btn btn-primary' disabled>comment</button>
                :
                    <button className='btn btn-primary' onClick={()=>handleComment(post._id, localStorage.getItem('username'))} >comment</button>
                }
            </div>
{post?.comments && post.comments.length > 0 && (
    <div className="commentsBody">
        <div className="comments">
            {post.comments.map((c, index) => {
                // Safeguard against missing data to prevent "User:" showing for empty objects
                const userName = c?.username || (Array.isArray(c) && c[0] ? c[0][0] : null);
                const commentText = c?.text || (Array.isArray(c) && c[0] ? c[0][1] : null);

                // Only render the row if we actually have both a name and text
                if (!userName || !commentText) return null;

                return (
                    <div key={index} className="comment-item">
                        <span className="comment-user" style={{ fontWeight: 'bold' }}>{userName}:</span> 
                        <span className="comment-text"> {commentText}</span>
                    </div>
                );
            })}
        </div>
    </div>
)}
        </div>
        </div>
        )

    }) : <></>}

    </div>
  )
}

export default Post