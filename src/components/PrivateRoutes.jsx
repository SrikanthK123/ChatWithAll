/* eslint-disable no-unused-vars */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { account } from '../lib/appwrite';

const PrivateRoutes = () => {
  const isAuthenticated = () => {
    // Replace with actual authentication logic
    try {
      const user = account.get(); // Appwrite account SDK
      return !!user;
    } catch {
      return false;
    }
  };

  return isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
