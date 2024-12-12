/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { databases, account, ID } from '../../lib/appwrite'; // Importing the appwrite services

const FinalTest = () => {
    const [user, setUser] = useState(null);  // Store user information
    const [messages, setMessages] = useState([]);  // Store messages
    const [messageBody, setMessageBody] = useState('');  // Store input message

    // Fetch current user session
    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await account.get();  // Get the current user session
                setUser(currentUser);  // Set the user data to state
            } catch (error) {
                console.log('User not authenticated', error);
            }
        };

        checkUser();  // Run the checkUser function when the component mounts
    }, []);

    // Fetch messages from the database
    const getMessages = async () => {
        try {
            const response = await databases.listDocuments(
                "67389b1e002b13b51f67",  // Database ID
                "6746b7de001c8034e867"   // Collection ID
            );
            console.log("PersonalData", response.documents);
            setMessages(response.documents);  // Set fetched messages to state
        } catch (error) {
            console.log("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        if (user) {  // Only fetch messages if the user is authenticated
            getMessages();  // Fetch messages when the user is authenticated
        }
    }, [user]);

    // Submit message handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('You must be logged in to send a message');
            return;
        }

        let payload = {
          //  timestamp: new Date().toISOString(),  // Current timestamp
            body: messageBody,  // Message content
        };

        try {
            // Create new document (message)
            let response = await databases.createDocument(
                "67389b1e002b13b51f67",  // Database ID
                "6746b7de001c8034e867",  // Collection ID
                ID.unique(),  // Unique ID for the document
                payload  // Payload containing the message body and timestamp
            );
            console.log("Created message", response);
            setMessageBody('');  // Clear the message input field
            getMessages();  // Refresh the message list
        } catch (error) {
            console.log("Error creating message:", error);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <div className="flex flex-col h-96 bg-gray-100 rounded-lg p-4 overflow-y-scroll">
                {/* Display messages */}
                <div className="flex flex-col space-y-2">
                    <h2>Message List</h2>
                    {messages.map((message, index) => (
                        <div key={index} className="flex items-start">
                            <div className="bg-blue-500 text-white p-2 rounded-lg">
                                {message.body}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message input form */}
                <form onSubmit={handleSubmit} className="flex items-center mt-4">
                    <input
                        type="text"
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow p-2 border rounded-lg"
                    />
                    <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-lg">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FinalTest;
