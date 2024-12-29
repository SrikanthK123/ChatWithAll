/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Account } from 'appwrite'; // Assuming you are using the Appwrite SDK
import { client } from './lib/appwrite';

const UserContext = createContext();

export const useUser = () => useContext(UserContext); // Hook to access context

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const account = new Account(client);

  const loginUser = (userData) => {
    setUser(userData);
    console.log('ContextData', userData); // Log user data to verify the update
  };

  const logoutUser = async () => {
    try {
      await account.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
