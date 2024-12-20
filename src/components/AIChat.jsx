/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { account } from "../lib/appwrite"; // Ensure Appwrite is correctly configured
import { FaTrash, FaLocationArrow, FaSignOutAlt } from "react-icons/fa"; // Icons
import EmojiPicker from "emoji-picker-react"; // Emoji picker component
import { useNavigate } from "react-router-dom";

const GEMINI_API_KEY = "AIzaSyBAi_WiK4z3HSBrnOdhjdENOlb0WH6HcAI"; // Replace with your actual API key

const AIChat = () => {
  const [question, setQuestion] = useState(""); // Question input
  const [messages, setMessages] = useState([]); // All chat messages
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showAlert, setShowAlert] = useState(false); // Empty question alert
  const [userName, setUserName] = useState(""); // User's name
  const [userId, setUserId] = useState(""); // User's ID
  const [showPicker, setShowPicker] = useState(false); // Emoji picker toggle

  const navigate = useNavigate();

  // Fetch user data and messages on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await account.get();
        setUserName(userData.name);
        setUserId(userData.$id);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Format timestamps for chat bubbles
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? ""
      : new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(date);
  };

  // Generate AI response
  const generateAnswer = async () => {
    if (!question.trim()) {
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    setShowAlert(false);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: question }] }],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiResponse =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

      const truncatedAnswer = aiResponse.slice(0, 500) + (aiResponse.length > 500 ? "..." : "");

      const newMessages = [
        ...messages,
        { type: "user", text: question, senderId: userId },
        { type: "ai", text: truncatedAnswer, senderId: "ai" },
      ];

      setMessages(newMessages);
      localStorage.setItem("messages", JSON.stringify(newMessages));
      setQuestion("");
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "An error occurred. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a specific message
  const deleteMessage = (index) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
  };

  // Clear all messages
  const clearAllMessages = () => {
    setMessages([]);
    localStorage.removeItem("messages");
  };

  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    setQuestion((prev) => prev + emoji.emoji);
  };

  const logoutUser = () => {
    try {
      localStorage.removeItem("messages");
      navigate("/");
    } catch (error) {
      alert("Error logging out. Please try again.");
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center text-white">
      {/* Header */}
      <header className="py-4 bg-gray-800 w-full flex justify-between items-center px-6">
  <div className="text-center flex-1">
    <h1 className="text-2xl text-cyan-400 p-1 font-semibold">Chat With AI</h1>
    {userName && <p className="text-sm">Welcome, {userName}!</p>}
  </div>
  
  <button
    className="text-red-500 p-2 py-1 my-2 border-2 border-red-500  rounded hover:bg-red-500 hover:text-[#001529] transition-all"
    onClick={logoutUser}
  >
     <FaSignOutAlt size={25} /> 
  </button>
</header>


      {/* Chat Container */}
      <main className="flex-grow w-full max-w-2xl px-4 py-6">
        {showAlert && <div className="text-red-500 mb-4">Please type a message!</div>}

        <div className="space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg shadow-md max-w-xs ${
                  msg.type === "user" ? "bg-slate-500 text-white self-end" : "bg-cyan-700 text-white self-start"
                }`}
              >
                <small className="text-[13px]">{msg.senderId === "ai" ? "AI Generate" : userName}</small>
                <p className="text-sm py-2">{msg.text}</p>
                <small className="block text-gray-300 text-xs">{formatTime(msg.timestamp)}</small>
              </div>
              {msg.type === "user" && (
                <button
                  onClick={() => deleteMessage(index)}
                  className="text-red-500 ml-2"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          
          {/* Loading Message */}
          {isLoading && (
            <div className="flex justify-center items-center py-4 text-gray-400">
              <h1 className="text-3xl gradient-text font-semibold font-mono">AI Chat</h1>
            </div>
          )}
        </div>
      </main>

      {/* Input Section */}
      <footer className="w-full bg-gray-800 p-4 fixed bottom-0 left-0">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        generateAnswer();
      }}
      className="flex items-center gap-2"
    >
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow p-2 rounded-lg bg-gray-700 text-white resize-none h-12 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="p-2 bg-gray-700 rounded-lg"
      >
        😀
      </button>
      {showPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <button
        type="submit"
        className="p-2 bg-blue-500 rounded-lg"
        disabled={isLoading}
      >
        <FaLocationArrow />
      </button>
      {/* Clear All Button */}
      <button
        type="button"
        onClick={clearAllMessages}
        className="p-2 bg-red-500 rounded-lg"
      >
        Clear
      </button>
    </form>
  </footer>
    </div>
  );
};

export default AIChat;
