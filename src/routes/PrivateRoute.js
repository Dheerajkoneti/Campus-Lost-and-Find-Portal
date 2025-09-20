import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser } = useAuth(); // Get the current user from our context

  // If there's a user, render the child page. Otherwise, redirect to login.
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;