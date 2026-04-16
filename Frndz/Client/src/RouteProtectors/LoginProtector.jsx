import React from 'react';
import { Navigate } from 'react-router-dom';

const LoginProtector = ({ children }) => {
    // If user is ALREADY logged in, send them to the Dashboard
    if (localStorage.getItem('userToken')) {
      return <Navigate to='/dashboard' replace />; 
    }
  
    // If NOT logged in, show the Landing/Login page
    return children;
}

export default LoginProtector;
