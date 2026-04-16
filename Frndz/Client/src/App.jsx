// App.jsx
import { Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginProtector from './RouteProtectors/LoginProtector';
import AuthProtector from './RouteProtectors/AuthProtector';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
function App() {
  // IMPORTANT: Ensure this return statement exists!
  return (
    <Routes>
       {/* 1. ADD THIS TEST ROUTE HERE */}
      <Route path="/test" element={<h1>Router is working!</h1>} />
      {/* If NOT logged in, show LandingPage. If logged in, redirect to /dashboard */}

      <Route exact path='/' element={ <AuthProtector><Home/></AuthProtector>}  />

      <Route 
        path="/login" 
        element={
          <LoginProtector>
            <LandingPage />
          </LoginProtector>
        } 
      />

      {/* PROTECTED: Only logged-in users can see this */}
      <Route 
        path="/dashboard" 
        element={
          <AuthProtector>
            <div className="dashboard">
              <h1>Welcome to Friends Connect!</h1>
              <p>This is your protected feed.</p>
            </div>
          </AuthProtector>
        } 
      />

      {/* PROTECTED: Only logged-in users can see their profile */}
<Route 
  path="/profile/:id" 
  element={
    <AuthProtector>
      <Profile />
    </AuthProtector>
  } 
/>
{/* ADD THIS NEW ROUTE */}
  <Route 
    path="/chat" 
    element={
      <AuthProtector>
        <Chat /> {/* See explanation below */}
      </AuthProtector>
    } 
  />


      {/* Fallback for any unknown URLs */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    
  );
}

export default App;
