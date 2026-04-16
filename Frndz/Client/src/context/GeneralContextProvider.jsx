import React, { createContext, useReducer, useState } from 'react';
import socketIoClient from 'socket.io-client';

export const GeneralContext = createContext();

const WS = 'http://localhost:6001';

const socket = socketIoClient(WS);

export const GeneralContextProvider = ({children}) => {

    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);

    const [notifications, setNotifications] = useState([]);

    const [chatFirends, setChatFriends] = useState([]);

    const INITIAL_STATE = {
        chatId: null,
        user: {},
    };

    const userId = localStorage.getItem('userId');

    const chatReducer = (state, action) => {
        switch (action.type) {
            case "CHANGE_USER":
                // Combined ID must be sorted to match backend: [id1, id2].sort().join("")
                const combinedId = [userId, action.payload._id].sort().join("");
                return {
                    user: action.payload,
                    chatId: combinedId
                }
            default:
                return state;
        }
    };


    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    return (
        <GeneralContext.Provider value={{socket, isCreatePostOpen, setIsCreatePostOpen, isCreateStoryOpen, 
            setIsCreateStoryOpen, isNotificationsOpen, setNotificationsOpen, notifications, 
            setNotifications, chatFirends, setChatFriends, chatData:state, dispatch}}>
            
            {children}
        </GeneralContext.Provider>
    )
}

export default GeneralContextProvider;