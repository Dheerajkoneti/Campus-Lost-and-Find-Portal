import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { currentUser } = useAuth();
  
  if (currentUser === null) {
    return <Navigate to="/login" />;
  }

  return currentUser.isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;