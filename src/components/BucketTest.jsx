/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { storage } from '../lib/appwrite'; // Ensure the storage is imported from your Appwrite setup

const BucketTest = () => {
  const [bucketDetails, setBucketDetails] = useState(null); // State to store bucket details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null); // State to track delete status

  // Specify the bucket ID to check
  const bucketId = '6745c7af000a499a05f5'; // Replace with your actual bucket ID
useEffect(() => {
    const result =  storage.listFiles(
        bucketId,
        []
    )
    console.log(result)
},[]) 

  useEffect(() => {
    const fetchBucketDetails = async () => {
      try {
        setLoading(true);
        setDeleteStatus(null); // Clear delete status when fetching bucket details
        // Fetch all buckets
        const response = await storage.listBuckets();
        // Find the bucket with the specific ID
        const bucket = response.buckets.find((b) => b.$id === bucketId);

        if (bucket) {
          setBucketDetails(bucket);
        } else {
          setError(`Bucket with ID "${bucketId}" does not exist.`);
        }
      } catch (err) {
        setError(`Failed to fetch buckets: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBucketDetails();
  }, [bucketId]);

  const handleDeleteBucket = async () => {
    try {
      setLoading(true);
      setError(null);
      setDeleteStatus(null);

      // Delete the bucket
      await storage.deleteBucket(bucketId);
      setDeleteStatus(`Bucket with ID "${bucketId}" has been successfully deleted.`);
      setBucketDetails(null); // Clear the bucket details after deletion
    } catch (err) {
      setError(`Failed to delete bucket: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Bucket Details</h1>
      <div aria-live="polite">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {deleteStatus && <p style={{ color: 'green' }}>{deleteStatus}</p>}
        {!loading && !error && bucketDetails && (
          <div>
            <p>
              <strong>Name:</strong> {bucketDetails.name}
            </p>
            <p>
              <strong>ID:</strong> {bucketDetails.$id}
            </p>
            <p>
              <strong>Created At:</strong> {new Date(bucketDetails.$createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated At:</strong> {new Date(bucketDetails.$updatedAt).toLocaleString()}
            </p>
            <button onClick={handleDeleteBucket} style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'red', color: 'white' }}>
              Delete Bucket
            </button>
          </div>
        )}
        {!loading && !error && !bucketDetails && <p>No bucket details available.</p>}
      </div>
    </div>
  );
};

export default BucketTest;
