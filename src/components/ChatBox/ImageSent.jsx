/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { storage, databases } from '../../lib/appwrite';
import { ID } from 'appwrite';

const ImageSent = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // To store the image URL after upload

  // Handle image selection
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
    setSuccess(null);
    setError(null);
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload the file to the storage bucket
      const response = await storage.createFile(
        '67625c290014521446c8', // Your BucketID
        ID.unique(), // Unique file ID
        image // The file itself
      );

      const fileId = response.$id;
      setUploading(false);
      setSuccess('Image uploaded successfully!');

      // Now store the file reference (file ID) in the database
      await saveImageReference(fileId);

      // Get the image URL from storage to display it
      const fileUrl = await storage.getFileView('67625c290014521446c8', fileId);
      setImageUrl(fileUrl.href); // Set the image URL to state

      console.log('Upload response:', response);
    } catch (err) {
      setUploading(false);
      setError('Error uploading image: ' + err.message);
      console.error('Upload error:', err);
    }
  };

  // Save file reference in the database (for example, storing the file ID)
  const saveImageReference = async (fileId) => {
    try {
      const imageDocument = {
        fileId: fileId, // Store the file ID in the database
      };

      await databases.createDocument(
        import.meta.env.VITE_DATABASE_ID_2, // Your Appwrite database ID
        ID.unique(), // Unique document ID
        imageDocument // The image document
      );
    } catch (err) {
      setError('Error saving image reference: ' + err.message);
      console.error('Error saving image reference:', err);
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default ImageSent;
