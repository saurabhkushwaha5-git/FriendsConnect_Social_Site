import { Navigate } from 'react-router-dom';

const AuthProtector = ({ children }) => {
  const token = localStorage.getItem('userToken');

  // If no token exists, redirect to the root (Landing Page)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected component (e.g., Dashboard)
  return children;
};

export default AuthProtector;
