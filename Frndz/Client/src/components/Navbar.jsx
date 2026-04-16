import React, { useContext, useEffect, useState } from 'react';
import "../styles/Navbar.css";
import { BiHomeAlt } from "react-icons/bi";
import { BsChatSquareText } from "react-icons/bs";
import { CgAddR } from "react-icons/cg";
import { TbNotification } from "react-icons/tb";
import navProfile from '../images/nav-profile.png';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useNavigate } from 'react-router-dom';
import { AuthenticationContext } from '../context/AuthenticationContextProvider';

const Navbar = () => {
  // Use the reactive userData instead of localStorage
  const { userData } = useContext(AuthenticationContext);
  const {isCreatPostOpen, setIsCreatePostOpen, setIsCreateStoryOpen, isNotificationsOpen, setNotificationsOpen} = useContext(GeneralContext);

  const navigate = useNavigate();
  const profilePic = localStorage.getItem('profilePic');
  const userId = localStorage.getItem('userId');
  
   return (
    <div className="Navbar">
        <BiHomeAlt className="homebtn btns" onClick={()=> navigate('/')} />
        <BsChatSquareText  className="chatbtn btns" onClick={()=> navigate('/chat')} />
        <CgAddR className="createPostbtn btns" onClick={()=> {setIsCreatePostOpen(!isCreatPostOpen); setIsCreateStoryOpen(false)}} />
        <TbNotification className="Notifybtn btns" onClick={()=> setNotificationsOpen(!isNotificationsOpen)}/>
        <img 
        className="profile"
        key={userData.profilePic} 
        src={userData.profilePic || navProfile}  // Use the imported image if profilePic is empty
        alt="profile" 
        onClick={() => navigate(`/profile/${userId}`)} 
        />

    </div>
  )
}
export default Navbar