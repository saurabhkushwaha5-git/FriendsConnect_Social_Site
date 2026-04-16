import React, { useContext } from 'react'
import Input from './Input';
import Messages from './Messages';
import { GeneralContext } from '../../context/GeneralContextProvider';

const UserChat = () => {

  const {chatData} = useContext(GeneralContext);

  return (
    <>
      { chatData.user &&
   
      <div className="chatInfo">
        <img src={chatData.user?.profilePic} alt="" />
        <span>{chatData.user.username}</span>

      </div>
    }
      <Messages />
      <Input />

    </>
  )
}
export default UserChat