import { useState, useEffect } from 'react';
import { databases } from '../lib/appwrite';

const DATABASE_ID = import.meta.env.VITE_DATABASE_ID_2;
const COLLECTION_ID = import.meta.env.VITE_COLLECTION_ID_SIGNUP_2;

export const AlluseUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        setUsers(response.documents);
        console.log("AllUSers",response.documents);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      }
    };

    fetchUsers();
  }, []);

  return { users, error };
};
