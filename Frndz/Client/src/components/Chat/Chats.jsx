import React, { useContext, useEffect, useState } from 'react'
import {GeneralContext} from '../../context/GeneralContextProvider';
const Chats = () => {

  const {socket, chatFirends, setChatFriends, dispatch, chatData} = useContext(GeneralContext)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!socket) return;

    socket.emit('fetch-friends', { userId });

    const handleFriends = ({ friendsData }) => {
      setChatFriends(friendsData);
    };

    socket.on("friends-data-fetched", handleFriends);

    // CLEANUP: Add this return to prevent memory leaks
    return () => socket.off("friends-data-fetched", handleFriends);
  }, [socket, userId]);


  const handleSelect = (data) =>{
    dispatch({type:"CHANGE_USER", payload: data});
  }
  useEffect(()=>{

    if(chatData.chatId !== null){
      console.log("Fetching messages for ID:", chatData.chatId);
      socket.emit('fetch-messages', {chatId: chatData.chatId})
    }
  }, [chatData.chatId])

  return (
    <div className='chats'>
      {/* Use the CSS class instead of inline styles */}
    {chatFirends.length === 0 && (
      <div className="no-friends">
        <h2>No friends found in your chat list.</h2>
      </div>
    )}
    
   {chatFirends.map((data)=>{
    return(
      <div className="userInfo" key={data._id} onClick={()=> handleSelect(data)} >
        <img src={data.profilePic} alt="" />
        <div className="userChatInfo">
          <span>{data.username}</span>
        </div>
      </div>
    )
   })}
    </div>
  )
}
export default Chats