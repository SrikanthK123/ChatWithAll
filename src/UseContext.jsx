/* eslint-disable no-unused-vars */
// UserContext.js
import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Account,Storage } from 'appwrite'; // Assuming you are using the Appwrite SDK
import { client } from './lib/appwrite';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const account = new Account(client);

  const loginUser = (userData) => {
    setUser(userData);
    console.log('ContextData', userData);
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
