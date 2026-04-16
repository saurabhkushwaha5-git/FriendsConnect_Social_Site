import React, { createContext, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 1. Named Export for the Context object
export const AuthenticationContext = createContext();

const AuthenticationContextProvider = ({ children }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const profilePic = ''; // Placeholder for now

    // 1. Initialize state from localStorage so it's ready on page load
    const [userData, setUserData] = useState({
        username: localStorage.getItem('username') || '',
        profilePic: localStorage.getItem('profilePic') || ''
    });

    const navigate = useNavigate();

     // Helper to update state and storage at the same time
    const updateLocalUser = (updatedUser) => {
        localStorage.setItem('username', updatedUser.username);
        localStorage.setItem('profilePic', updatedUser.profilePic);
        
        // ADD THESE: Ensure the following/followers are updated in storage
        localStorage.setItem('followers', JSON.stringify(updatedUser.followers || []));
        localStorage.setItem('following', JSON.stringify(updatedUser.following || []));
        
        setUserData({
            username: updatedUser.username,
            profilePic: updatedUser.profilePic
        });
    };


    // Helper to save user data to localStorage
    const setUserSession = (data) => {
        // Ensure data exists before setting
        if (data.token && data.user) {
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userId', data.user._id);
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('email', data.user.email);
            localStorage.setItem('profilePic', data.user.profilePic || '');
            localStorage.setItem('posts', JSON.stringify(data.user.posts || []));
            localStorage.setItem('followers', JSON.stringify(data.user.followers || []));
            localStorage.setItem('following', JSON.stringify(data.user.following || []));
            setUserData({
                username: data.user.username,
                profilePic: data.user.profilePic || ''
            });
        }
    };

    const login = async () => {
        try {
            const loginInputs = { email, password };
            const res = await axios.post('http://localhost:6001/auth/login', loginInputs);
            setUserSession(res.data);
            navigate('/');
        } catch (err) {
            // Log specific error message from server if available
            console.error("Login Error:", err.response?.data || err.message);
        }
    };

    const register = async () => {
        try {
            const inputs = { username, email, password, profilePic };
            const res = await axios.post('http://localhost:6001/auth/register', inputs);
            setUserSession(res.data);
            navigate('/');
        } catch (err) {
            console.error("Registration Error:", err.response?.data || err.message);
        }
    };

    const logout = () => {
        localStorage.clear(); 
        navigate('/landing');
    };

    // 2. The 'value' prop contains EVERYTHING needed by Login and Register components
    return (
        <AuthenticationContext.Provider value={{ 
            login, 
            register, 
            logout, 
            username, 
            setUsername, 
            email, 
            setEmail, 
            password, 
            setPassword,
            userData,         // <--- ADD THIS
            updateLocalUser   // <--- ADD THIS
        }}>
            {children}
        </AuthenticationContext.Provider>
    );
};

// 3. Default Export for the Provider component
export default AuthenticationContextProvider;