/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { Query } from 'appwrite';
import { account, databases, ID } from '../../lib/appwrite'; // Assuming appwrite is configured

const PersonalChat = ({ user }) => {
  const { userId, username } = useParams(); // Get route params (selected user)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !user?.$id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await databases.listDocuments(
          '67389b1e002b13b51f67', // Database ID
          '6746b7de001c8034e867', // Collection ID
          [
            Query.or(
              Query.and([Query.equal('senderId', user.$id), Query.equal('receiverId', userId)]),
              Query.and([Query.equal('senderId', userId), Query.equal('receiverId', user.$id)])
            ),
          ]
        );

        setMessages(response.documents || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, userId]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);

      const messageData = {
        senderId: user.$id,
        senderName: user.name,
        receiverId: userId,
        receiverName: username,
        timestamp: new Date().toISOString(),
        messageBody: newMessage,
      };

      const response = await databases.createDocument(
        '67389b1e002b13b51f67', // Database ID
        '6746b7de001c8034e867', // Collection ID
        ID.unique(),
        messageData
      );

      setMessages((prev) => [...prev, response]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      {/* Chat Header */}
      <div className="bg-blue-600 p-4 text-white text-lg font-semibold rounded-t-lg shadow-md">
        <h1>Chat with {username}</h1>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-600">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.$id}
              className={`flex ${msg.senderId === user.$id ? 'justify-end' : 'justify-start'} space-x-4`}
            >
              {msg.senderId !== user.$id && (
                <img
                  src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 50)}.jpg`}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.senderId === user.$id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                <p className="text-sm font-semibold">{msg.senderName}</p>
                <p className="text-md">{msg.messageBody}</p>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {msg.senderId === user.$id && (
                <img
                  src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 50)}.jpg`}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="flex items-center space-x-4 p-4 border-t border-gray-300">
        <p className="text-lg bg-[#001529] text-white p-3 rounded-md">
          {user?.name || 'Anonymous'}
        </p>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || loading}
          className={`p-3 rounded-lg bg-blue-500 text-white ${
            !newMessage.trim() || loading ? 'opacity-50' : 'hover:bg-blue-600'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

PersonalChat.propTypes = {
  user: PropTypes.shape({
    $id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default PersonalChat;
