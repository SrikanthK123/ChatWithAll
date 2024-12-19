/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { account, databases, ID } from "../lib/appwrite"; // Ensure appwrite is correctly configured
import { FaTrash, FaEllipsisV, FaImage, FaLocationArrow } from "react-icons/fa"; // Importing icons
import EmojiPicker from "emoji-picker-react"; // Import emoji picker component

const GEMINI_API_KEY = "AIzaSyBAi_WiK4z3HSBrnOdhjdENOlb0WH6HcAI"; // Replace with your actual API key

const AIChat = () => {
  const [question, setQuestion] = useState(""); // State for the question input
  const [messageBody, setMessageBody] = useState(""); // State for message input body
  const [messages, setMessages] = useState([]); // State for storing messages
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showAlert, setShowAlert] = useState(false); // Show alert for empty question
  const [userName, setUserName] = useState(""); // State to store user name
  const [userId, setUserId] = useState(""); // State to store user ID
  const [selectedMenu, setSelectedMenu] = useState(null); // State for message options menu
  const [showPicker, setShowPicker] = useState(false); // Show emoji picker
  const [isMessageFocused, setIsMessageFocused] = useState(false); // Focus state for textarea

  // Fetch logged-in user's name and ID
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await account.get();
        setUserName(userData.name); // Set the user's name
        setUserId(userData.$id); // Set the user's ID
        console.log("Logged-in user:", userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserData();

    // Retrieve messages from localStorage if available
    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Format time to be more readable
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return ""; // Return an empty string if the timestamp is invalid
    }
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  // Generate AI response based on the question
  const generateAnswer = async () => {
    if (question.trim() === "") {
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    setShowAlert(false);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: question }],
            },
          ],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      let receivedAnswer =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

      // Truncate the answer to 1000 characters
      const MAX_LENGTH = 900;
      if (receivedAnswer.length > MAX_LENGTH) {
        receivedAnswer = receivedAnswer.slice(0, MAX_LENGTH) + "...";
      }

      // Add both question and AI response to the messages array
      setMessages((prevMessages) => {
        const updatedMessages = [
          ...prevMessages,
          { type: "user", text: question, senderId: userId },
          { type: "ai", text: receivedAnswer, senderId: "ai" },
        ];

        // Store the updated messages in localStorage
        localStorage.setItem("messages", JSON.stringify(updatedMessages));

        return updatedMessages;
      });

      setIsLoading(false);
      setQuestion(""); // Clear input after submission
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", text: "An error occurred while generating the response. Please try again." },
      ]);
      setIsLoading(false);
    }
  };

  // Function to delete a specific message
  const deleteMessage = (index) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
  };

  // Function to clear all messages
  const clearAllMessages = () => {
    setMessages([]);
    localStorage.setItem("messages", JSON.stringify([]));
  };

  // Toggle the message options menu
  const toggleMenu = (messageId) => {
    setSelectedMenu(selectedMenu === messageId ? null : messageId);
  };

  // Handle emoji click
  const handleEmojiClick = (emoji) => {
    setMessageBody((prev) => prev + emoji.emoji);
  };

  return (
    <div>
      <div className=" bg-slate-400">
        <div className="p-2 text-center">
          <h1 className="display-5 fw-bold text-white">Chat With</h1>
          {/* Display the logged-in user's name */}
          {userName && <p className="text-white">Welcome, {userName}!</p>}
        </div>

        <div className="chat-container" style={{ minHeight: "100vh", display: "flex", justifyContent: "center" }}>
          <div className=" container">
            <h2 className="text-white text-center m-4">Chat Here</h2>

            {showAlert && (
              <div className="p-3">
                <h6 className="text-warning">Please enter a question before generating an answer.</h6>
              </div>
            )}

            <div className="button-wrapper">
              <button onClick={generateAnswer} className="m-4 btn bg-green-300 p-2 rounded-lg hover:bg-green-400">
                {isLoading ? "Loading..." : "Generate Answer"}
              </button>
              <button onClick={clearAllMessages} className="m-4 btn bg-red-300 p-2 rounded-lg hover:bg-red-400">
                Clear All Messages
              </button>
            </div>

            {/* Message Display */}
            <div className="messages-container space-y-4">
              {messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === userId;
                return (
                  <div key={index} className={`message flex ${isCurrentUser ? "justify-end" : "justify-start"} items-start mx-2`}>
                    <div
                      className={`message-box px-4 py-3 rounded-lg shadow-lg max-w-[80%] ${
                        isCurrentUser
                          ? "bg-blue-500 text-white self-end rounded-tr-none"
                          : "bg-gray-100 text-black self-start rounded-tl-none"
                      } relative`}
                    >
                      {/* Message Timestamp */}
                      <span className={`message-time text-[10px] text-black ${isCurrentUser ? "text-white" : "text-black"}`}>
                        {new Date(msg.timestamp).toLocaleDateString()} {/* Display the full date */}
                      </span>

                      {/* Message Content */}
                      <div
                        className="message-content"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <p className={`text-[12px] font-semibold ${isCurrentUser ? "text-black" : "text-blue-500"}`}>
                          {isCurrentUser ? `${userName} (You)` : msg.senderName}
                        </p>
                        <p className="text-[16px]">{msg.text}</p>
                        <small className={`text-[10px] ${isCurrentUser ? "text-white" : "text-black"}`}>
                          {formatTime(msg.timestamp)} {/* Format the timestamp */}
                        </small>
                      </div>

                      {/* Options Button */}
                      {isCurrentUser && (
                        <button onClick={() => toggleMenu(msg.$id)} className="absolute top-1 right-1 text-white hover:text-black">
                          <FaEllipsisV size={12} />
                        </button>
                      )}

                      {/* Message Options Menu */}
                      {selectedMenu === msg.$id && (
                        <div
                          className="message-options absolute right-0 top-8 shadow-md bg-white rounded-lg p-4 z-30"
                          style={{ minWidth: "120px" }}
                        >
                          <button
                            onClick={() => deleteMessage(index)}
                            className="block w-full text-xs text-red-500 hover:bg-red-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-red-600"
                          >
                            <FaTrash size={12} />
                            <span>Delete</span>
                          </button>
                          <button
                            onClick={() => {}}
                            className="block w-full text-xs text-blue-500 hover:bg-blue-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-blue-600"
                          >
                            <FaImage size={12} />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generateAnswer();
              }}
              className="message-input-form flex items-center gap-2 px-3 p-4 bg-[#001529] justify-center fixed bottom-0 w-full"
            >
              <textarea
                type="text"
                value={messageBody}
                onFocus={() => setIsMessageFocused(true)}
                onBlur={() => setIsMessageFocused(false)}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message..."
                className={`input-text bg-gray-700 text-white w-[70%] p-3 rounded-lg shadow-md resize-none ${
                  isMessageFocused ? "h-20" : "h-12"
                } transition-all`}
              ></textarea>

              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="emoji-button hover:bg-gray-400 text-white rounded-lg px-1 py-1"
              >
                😀
              </button>

              {showPicker && (
                <div className="emoji-picker absolute bottom-16 right-4 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

              <button
                type="submit"
                className="send-button bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center"
              >
                <FaLocationArrow size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
