/* eslint-disable no-unused-vars */
import React, { useEffect,useState } from 'react'
import { databases } from '../../appwrite/config'

const Testpage = () => {
    const [message, setMessage] = useState([]);
    useEffect(() => {
        init();
    },[])
    const init = async () => {
        const response = await databases.listDocuments(
            import.meta.env.VITE_DATABASE_ID,
            import.meta.env.VITE_COLLECTION_ID_MESSAGE
        );
        setMessage(response.documents);
    }
  return (
    <div>
      <h3>Test</h3>
      {message.map((item) => (
        <div key={item.$id}>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  )
}

export default Testpage
