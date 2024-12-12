import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_ENDPOINT) // Your Appwrite API Endpoint
  .setProject(import.meta.env.VITE_PROJECT_ID); // Your Appwrite Project ID

export const databases = new Databases(client);
