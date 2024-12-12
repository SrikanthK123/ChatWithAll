import { useState, useEffect } from 'react';
import { databases } from '../lib/appwrite';

const DATABASE_ID = '67389b1e002b13b51f67';
const COLLECTION_ID = '67389b43003b7770ee97';

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
