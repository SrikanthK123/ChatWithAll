/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { account, storage, ID, databases,permission } from '../lib/appwrite';
import { role } from '../lib/appwrite';

const BucketTest = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Check user session
  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get(); // Check if user is authenticated
        setIsAuthenticated(true);
      } catch (error) {
        console.error('User not logged in:', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  const handleUpload = async (event) => {
    try {
      // Ensure valid input and file selection
      if (!event?.target?.files || event.target.files.length === 0) {
        console.error('No file selected or input is invalid');
        return;
      }

      const file = event.target.files[0]; // Get the first selected file

      console.log('Uploading file:', file);

      const response = await storage.createFile(
        import.meta.env.VITE_BUCKET_IMAGE_SHARE, // Bucket ID from .env
        ID.unique(), // Generate a unique file ID
        file,
        ['write'] // Use "write" permission for file uploads (for authenticated users or specific roles)
      );

      console.log('File uploaded successfully:', response);
      setUploadedFile(response.fileId); // Update state with uploaded file ID

      // Create a document with permissions in the database (example usage)
      const document = {
        fileId: response.fileId,
        uploadedBy: account.get() ? account.get().then(user => user.$id) : null, // Add any necessary info
      };

      const docResponse = await databases.createDocument(
        import.meta.env.VITE_DATABASE_ID, // Your database ID
        import.meta.env.VITE_COLLECTION_ID, // Your collection ID
        ID.unique(), // Generate a unique document ID
        document,
        [
          permission.read('any'),                // Anyone can view this document
          permission.update('users'),            // Authenticated users can update this document
          permission.update('admins'),           // Only admins can update this document
          permission.delete('admins')            // Only admins can delete this document
        ]
      );

      console.log('Document created successfully:', docResponse);

    } catch (error) {
      console.error('Error uploading file or creating document:', error.message);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <h1>File Upload to Appwrite</h1>
          <input type="file" onChange={handleUpload} />
          {uploadedFile && (
            <div>
              <h2>Uploaded File</h2>
              <img
                src={`https://cloud.appwrite.io/v1/storage/buckets/${import.meta.env.VITE_BUCKET_IMAGE_SHARE}/files/${uploadedFile}/view`}
                alt="Uploaded Preview"
                style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '20px' }}
              />
            </div>
          )}
        </>
      ) : (
        <p>Please log in to upload files.</p>
      )}
    </div>
  );
};

export default BucketTest;
