import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import App from './App.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthenticationContextProvider from './context/AuthenticationContextProvider.jsx';
import GeneralContextProvider from './context/GeneralContextProvider.jsx';
import SocketContextProvider from './context/SocketContextProvider.jsx';
import CreatePost from './components/CreatePost';
import CreateStory from './components/CreateStory.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthenticationContextProvider>
        <SocketContextProvider>
        <GeneralContextProvider>
        {/* Socket usually needs Auth data (like userId) to connect properly */}
              <App />
              <CreatePost />
              <CreateStory />
              </GeneralContextProvider>
              </SocketContextProvider>
      </AuthenticationContextProvider>
    </BrowserRouter>  
  </StrictMode>
);
