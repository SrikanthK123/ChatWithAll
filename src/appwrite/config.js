import { Client, Databases } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")  // Appwrite endpoint
  .setProject("67389abd00352e0b1d76");  // Replace with your Appwrite project ID

// Initialize the Databases API
const databases = new Databases(client);

// Define the database and collection IDs
const databaseId = "67389b1e002b13b51f67";  // Replace with your database ID
const collectionId = "6738bb47000e6b648061";  // Replace with your collection ID

// Optional: Define queries (use an empty array if no filtering is needed)
const queries = []; // Replace with filters like ['title=Testing In Appwrite'] if required

// Call the listDocuments API
const promise = databases.listDocuments(databaseId, collectionId, queries);

// Handle the API response
promise.then(
  function (response) {
    console.log("Documents fetched successfully:", response.documents);
  },
  function (error) {
    console.error("Error fetching documents:", error);
  }
);

// Export the client and databases for reuse in other parts of your app
export { client, databases };
