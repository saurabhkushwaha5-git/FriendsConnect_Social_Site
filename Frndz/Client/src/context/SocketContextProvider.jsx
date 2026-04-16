import React, { createContext, useEffect, useState} from 'react';
import socketIoClient from 'socket.io-client';


export const SocketContext = createContext();

const WS = 'http://localhost:6001'; 
const socket = socketIoClient(WS);

export const SocketContextProvider =  ({children}) => {
return (
    <SocketContext.Provider  value={{socket}} >{children}</SocketContext.Provider>
);
}

export default SocketContextProvider;
