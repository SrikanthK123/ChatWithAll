/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { FaImage } from 'react-icons/fa'; // Import the gallery icon
import { useUser } from '../../UseContext';
import { account, client, databases } from "../../lib/appwrite";
import { AlluseUsers } from '../../hook/AllUserData';
import { ID, Query } from 'appwrite';

const Chatbox = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userData, setUserData] = useState(null); // User data state
  const [selectedUserId, setSelectedUserId] = useState(null); // State to store selected user ID
  const { users, error } = AlluseUsers();
  const [messageBody, setMessageBody] = useState('');

  // Helper function to format time
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Fetch user data using useEffect
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Assuming the user object contains the necessary data or a call to Appwrite can be made here
        const userData = await account.get();
        setUserData(userData);
        console.log("login user Right", userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []); // Run only when `user` changes

  // Handle sending a message
  const handleSendMessage = async () => {
    if (message.trim() || selectedFile) {
      const time = formatTime(new Date()); // Get the current time
  
      // Prepare the payload for the database
      const payload = {
        user_id: user.$id ,
        username: users.name ,
        body: message,
      };
  
      try {
        // Save the message to the database
        const response = await databases.createDocument(
          '67389b1e002b13b51f67', // Replace with your actual database ID
          '6738bb47000e6b648061', // Replace with your actual collection ID
          ID.unique(), // Generate a unique ID for the document
          Query.orderDesc('$createdAt'),
          payload
        );
  
        console.log('Message saved to database:', response);
      } catch (error) {
        console.error('Error saving message:', error);
      }
  
      // Update the local message list
      setMessages([
        ...messages,
        { text: message, file: selectedFile, userId: user?.$id || 'Guest', time },
      ]);
  
      // Clear input and file selection
      setMessage('');
      setSelectedFile(null);
    }
  };
  

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file)); // Preview the selected file
    }
  };

  // UseContext hook to get the user data
  const { user } = useUser();

  // Only render user info if user data is available
  const userName = user ? user.name : 'Guest';

  // Filter messages based on selected user ID
  const filteredMessages = selectedUserId 
    ? messages.filter(msg => msg.userId === selectedUserId) 
    : messages;

   

  return (
    <div className="bg-slate-200 w-full min-h-screen flex flex-col">
      {/* Only render the card if there are messages */}
      {messages.length > 0 && (
        <div className="bg-slate-600 p-4 pl-10 text-white text-2xl">
          <div className="card">
            <div className="img"></div>
            <div className="textBox" style={{ lineHeight: '1.5' }}>
              <div className="textContent">
                {users.map((user) => (
                  <p key={user.id} className="p" onClick={() => setSelectedUserId(user.$id)}>
                    {user.username} {user.$id}
                  </p>
                ))}
              </div>
              <p className="p">Online</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Conditionally render message list or placeholder */}
          {filteredMessages.length === 0 ? (
            <div>
              <div className="flex justify-center items-center space-x-4 mt-10 mb-5">
                {/* Display a placeholder image or message */}
                <img
                  src="https://img.freepik.com/free-vector/hello-concept-illustration_114360-540.jpg?t=st=1732009114~exp=1732012714~hmac=8c14f1d801f8b0a563974ecd835b159fc799e8c76100a76b6b4f12b1130e00ce&w=740"
                  alt="Placeholder"
                  className="w-80 h-96 object-cover rounded-md"
                  style={{
                    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
                  }}
                />
              </div>
              <div className="p-3 bg-slate-300 my-4 text-center rounded-lg">
                <p className="text-center text-xl">Let's Chat</p>
                <div>
                  <p className="text-sm">
                    Let's chat with friends, share moments, and connect with others!😆😁😃💬
                  </p>
                </div>
                <button className='p-2 px-4 bg-[#007dfe] text-white rounded-lg mt-4 hover:bg-[#317ae9]'>Join</button>
              </div>
            </div>
          ) : (
            filteredMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 ${index % 2 === 0 ? 'justify-end' : ''}`}
              >
                {/* Avatar */}
                {index % 2 !== 0 && (
                  <div>
                    <img
                      src={`https://randomuser.me/api/portraits/men/${msg.userId}.jpg`}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full bg-gray-500"
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] ${index % 2 === 0 ? 'ml-auto' : ''} p-3 shadow-md ${
                    index % 2 === 0
                      ? 'rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-md bg-blue-500 text-white'
                      : 'rounded-tr-lg rounded-br-lg rounded-tl-none rounded-bl-md bg-gray-200 text-black'
                  }`}
                >
                  {/* Conditional rendering for messages with text */}
                  {msg.text && <p className="text-sm break-words">{msg.text}</p>}

                  {/* Conditional rendering for messages with an image */}
                  {msg.file && (
                    <div
                      className={`mt-2 transition-opacity duration-500 ${msg.file ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <img
                        src={msg.file}
                        alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    </div>
                  )}

                  {/* Time below text or image */}
                  <span
                    className={`text-xs mt-1 font-semibold block ${
                      index % 2 === 0 ? 'text-black' : 'text-blue-500'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {/* For sent messages, hide avatar */}
                {index % 2 === 0 && <div className="w-10"></div>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat input area */}
      <div className="bg-slate-700 p-4">
        <div className="flex items-center px-6">
          {/* Gallery Icon */}
          <button
            className="mr-4 text-white p-2 rounded-lg hover:bg-slate-400 hover:text-[#001529] transition-all duration-300 ease-in-out"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <FaImage size={24} />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 rounded-lg text-gray-700"
            placeholder="Type a message..."
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            className="ml-4 bg-[#0066ff] hover:bg-[#4485e7] text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Chatbox;
