import { Client, Account } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(import.meta.env.VITE_ENDPOINT) // Appwrite API Endpoint
    .setProject(import.meta.env.VITE_PROJECT_ID); // Appwrite Project ID

const account = new Account(client);

// Sign-up function
export const signUp = async (email, password) => {
    try {
        const response = await account.create('unique()', email, password);
        console.log('Sign-up successful:', response);
        return response;
    } catch (error) {
        console.error('Error during sign-up:', error.message);
        throw error;
    }
};

// Login function
export const loginUser = async (email, password) => {
    try {
        const response = await account.createSession(email, password);
        console.log('Login successful:', response);
        return response;
    } catch (error) {
        console.error('Error during login:', error.message);
        throw error;
    }
};
