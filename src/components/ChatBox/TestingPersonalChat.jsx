/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { account, databases, client ,storage} from "../../lib/appwrite"; // Assuming Appwrite is configured
import { Query, ID } from "appwrite";
import { FaLocationArrow, FaEllipsisV, FaTrash, FaImage, FaUser,FaSignOutAlt,FaCamera,FaVideo,FaSearchLocation,FaFileAlt,FaDollarSign } from "react-icons/fa"; // Added FaEllipsisV and FaTrash
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-hot-toast";



const TestingPersonalChat = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null); // Track which message is selected for options
  const [isMessageFocused, setIsMessageFocused] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // For file upload
  

  // Fetch current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  // Logout Function
  const handleLogout = async () => {
    try {
      await account.deleteSession("current"); // Logs out the user
      navigate("/"); // Redirect to home
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Fetch messages for the current conversation
  const getMessages = async () => {
    setLoading(true);
    try {
      const messagesForSender = await databases.listDocuments(
        import.meta.env.VITE_DATABASE_ID,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT,
        [
          Query.equal("senderName", user.name),
          Query.equal("receiverName", username),
        ]
      );

      const messagesForReceiver = await databases.listDocuments(
        import.meta.env.VITE_DATABASE_ID,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT,
        [
          Query.equal("senderName", username),
          Query.equal("receiverName", user.name),
        ]
      );

      const allMessages = [
        ...messagesForSender.documents,
        ...messagesForReceiver.documents,
      ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessages(allMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getMessages();
    }
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (user && username) {
      getMessages(); // This fetches messages as soon as the user loads
      const unsubscribe = client.subscribe(
        `databases.${import.meta.env.VITE_DATABASE_ID}.collections.${import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT}.documents`,
        (response) => {
          const newMessage = response.payload;
          if (
            (newMessage.senderName === user.name && newMessage.receiverName === username) ||
            (newMessage.senderName === username && newMessage.receiverName === user.name)
          ) {
            setMessages((prev) => {
              const existingMessageIndex = prev.findIndex((msg) => msg.$id === newMessage.$id);
              if (existingMessageIndex !== -1) {
                const updatedMessages = [...prev];
                updatedMessages[existingMessageIndex] = newMessage;
                return updatedMessages;
              } else {
                return [...prev, newMessage];
              }
            });
          }
        }
      );
      return () => unsubscribe();
    }
  }, [user, username]);

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageBody.trim() && !selectedFile) return;

    const newMessage = {
      senderName: user.name,
      receiverName: username,
      timestamp: new Date().toISOString(),
      PersonalMessage: [messageBody.trim()],
      isRead: false,
    };
    

    if (editingMessageId) {
      try {
        // Update existing message
        await databases.updateDocument(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT,
          editingMessageId,
          { PersonalMessage: [messageBody.trim()] }
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg.$id === editingMessageId
              ? { ...msg, PersonalMessage: [messageBody.trim()] }
              : msg
          )
        );
        setEditingMessageId(null); // Reset editing state
      } catch (error) {
        console.error("Error updating message:", error);
      }
    } else {
      try {
        // Save the new message to the database
        const createdMessage = await databases.createDocument(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT,
          ID.unique(),
          newMessage
        );
        setMessages((prev) => [...prev, createdMessage]); // Add the message to the state after creation
        
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }

    setMessageBody(""); // Reset the input field
    
  };
  useEffect(() => {
    console.log("All Messages", messages);
  })

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      // Delete the message from the database
      await databases.deleteDocument(
        import.meta.env.VITE_DATABASE_ID,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT,
        messageId
      );
  
      // Immediately update the UI by removing the message from the state
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.$id !== messageId));
  
      // Fetch the messages again to ensure the UI is consistent with the database state
      getMessages();
  
      // Close the menu after deleting
      setSelectedMenu(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  
  

  // Edit a message
  const editMessage = (messageId, messageText) => {
    setEditingMessageId(messageId);
    setMessageBody(messageText);
    setSelectedMenu(null); // Close the menu after editing
  };

  // Toggle the options menu (edit/delete)
  const toggleMenu = (messageId) => {
    setSelectedMenu(selectedMenu === messageId ? null : messageId);
  };

  // Format timestamp for display
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    setMessageBody((prev) => prev + emoji.emoji);
    setShowPicker(false);
  };

  // Send a "Hi" message when the "Hi" button is clicked
  const handleHiButtonClick = async () => {
    const newMessage = {
      senderName: user.name,
      receiverName: username,
      timestamp: new Date().toISOString(),
      PersonalMessage: ["Hello!"],
      isRead: false,
    };
  
    try {
      // Create the "Hello!" message directly without handleSubmit
      const createdMessage = await databases.createDocument(
        import.meta.env.VITE_DATABASE_ID,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT,
        ID.unique(),
        newMessage
      );
  
      // Add the message to the state
      setMessages((prev) => [...prev, createdMessage]);
    } catch (error) {
      console.error("Error sending 'Hello!' message:", error);
    }
  };
  
   //Image Upload Testing
   const ImageClick = () => {
    console.log("Image clicked");
    toast.success("Oops! Coming Soon");
  };
  
  

  return (
    <div className="chat-container flex flex-col h-screen w-screen bg-slate-200">
      <header className="chat-header bg-[#001529] text-white p-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Chat with {username}</h3>
        <button onClick={handleLogout} className="text-white hover:text-gray-400">
          <FaSignOutAlt size={20}/> {/*<spna style={{fontSize:'10px'}} >{user?.name}</spna>*/}
        </button>
      </header>

      <div className="flex-grow overflow-y-auto p-4 max-h-[79vh]">
        {loading ? (
          /* From Uiverse.io by adamgiebl */ 
<section className="dots-container">
  <div className="dot"></div>
  <div className="dot"></div>
  <div className="dot"></div>
  <div className="dot"></div>
  <div className="dot"></div>
</section>

        ) : messages.length === 0 ? (
          <div>
           <div className="flex justify-center items-center space-x-4 mt-10 mb-5">
  <img
    src="https://img.freepik.com/free-vector/hello-concept-illustration_114360-540.jpg?t=st=1732009114~exp=1732012714~hmac=8c14f1d801f8b0a563974ecd835b159fc799e8c76100a76b6b4f12b1130e00ce&w=740"
    alt="Placeholder"
    className="w-60 h-60 sm:w-80 sm:h-96 object-cover rounded-md"
    style={{
      boxShadow:
        'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
    }}
  />
</div>

          <div className="flex justify-center items-center flex-col space-y-4 p-4 rounded-lg ">
            
            <p className="text-xl">Let's Chat</p>
            <p className="text-sm">
              Let's chat with <span className="font-semibold text-blue-500">{username}</span>, share moments, and connect with others! 😆😁😃💬
            </p>
            <button
              onClick={handleHiButtonClick}
              className="bg-[#007dfe] text-white p-2 px-4 rounded-2xl mt-4 font-bold hover:bg-[#317ae9] rounded-bl-none" style={{boxShadow:'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset'}}
            >
              Hello!
              
            </button>
          </div>
          </div>
        ) : (
          <div className="messages-container space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.senderName === user?.name;
              return (
                <div
                  key={message.$id}
                  className={`message flex ${isCurrentUser ? "justify-end" : "justify-start"} items-start`}
                >
                 
                  <div
                    className={`message-box px-3 rounded-lg shadow-lg max-w-[60%] ${
                      isCurrentUser
                        ? "bg-blue-500 text-white self-end rounded-tr-none"
                        : "bg-gray-100 text-black self-start rounded-tl-none"
                    } relative`}
                  >
                    {isCurrentUser && (
                      <button
                        onClick={() => toggleMenu(message.$id)}
                        className="absolute top-1 right-1 text-white hover:text-black"
                      >
                        <FaEllipsisV size={12} />
                      </button>
                    )}

                    {selectedMenu === message.$id && (
                      <div
                        className="message-options absolute right-0 top-8 shadow-md bg-white rounded-lg p-4 z-30"
                        style={{ minWidth: "120px" }}
                      >
                        <button
                          onClick={() => deleteMessage(message.$id)}
                          className="block w-full text-xs text-red-500 hover:bg-red-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-red-600"
                        >
                          <FaTrash size={12} />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => editMessage(message.$id, message.PersonalMessage[0])}
                          className="block w-full text-xs text-blue-500 hover:bg-blue-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-blue-600"
                        >
                          <FaImage size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}

                    <span className={`message-time text-[10px] text-black ${isCurrentUser ? "text-white" : "text-black"}`}>
                      {new Date(message.$createdAt).toLocaleDateString()}
                    </span>

                    <div className="message-content " style={{
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
}}>
                      <p className={`text-[12px] font-semibold ${isCurrentUser ? "text-black" : "text-blue-500"}`}>
                        {isCurrentUser ? `${user?.name} (You)` : message.senderName}
                      </p>
                      <p className="text-[16px]">{message.PersonalMessage}</p>
                      <small className={`text-[10px] ${isCurrentUser ? "text-white" : "text-black"}`}>
                        {formatTime(new Date(message.timestamp))}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="message-input-form flex items-center gap-2 px-3 p-4 bg-[#001529] justify-center">
        <textarea
          type="text"
          value={messageBody}
          onFocus={() => setIsMessageFocused(true)}
          onBlur={() => setIsMessageFocused(false)}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="Type your message..."
          className={`input-text bg-gray-700 text-white w-[70%] p-3 rounded-lg shadow-md resize-none ${isMessageFocused ? "h-20" : "h-12"} transition-all`}
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
            <EmojiPicker onEmojiClick={handleEmojiClick} value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
          </div>
        )}

        <button
          type="submit"
          className="send-button bg-blue-500 hover:bg-blue-600 text-white w-10 h-10  rounded-full flex items-center justify-center"
        >
          <FaLocationArrow size={18} />
        </button>
      </form>
      {/* Navigation buttons */}
      <div className="flex items-center lg:justify-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2 bg-slate-900">
        <button
          className="cursor-pointer bg-white  relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB300] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-[#41dce4] h-9 rounded-md px-3"
        >
          <i className="fas fa-th-large"></i>
          <FaCamera className="text-[#41dce4]" size={17} />Camera
        </button>
        
        <button
          className="cursor-pointer bg-white  relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB300] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-[#e46241] h-9 rounded-md px-3"
        >
          <i className="fas fa-th-large"></i>
          <FaImage className="text-[#e46241]" size={17} />Images
        </button>
      
        <button
          className="cursor-pointer bg-white  relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42A5F5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-[#42A5F5] h-9 rounded-md px-3"
        >
          <i className="fas fa-comment-alt"></i>
          <FaVideo className="text-[#42A5F5]" size={17} /> Video
        </button>
      
        <button
          className="cursor-pointer bg-white relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FB8C00] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-[#FB8C00] h-9 rounded-md px-3"
        >
          <i className="fas fa-bell"></i>
          <FaSearchLocation className="text-[#FFB300]" size={17} />Location
        </button>
      
        <button
          className="cursor-pointer bg-white relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AB47BC] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-[#AB47BC] h-9 rounded-md px-3"
        >
          <i className="fas fa-user-friends"></i>
          <FaFileAlt className="text-[#AB47BC]" size={17} />File
        </button>
      
        <button
          className="cursor-pointer bg-white relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66BB6A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-[#66BB6A] h-9 rounded-md px-3"
        >
          <i className="fas fa-cog"></i>
          <FaDollarSign className="text-[#66BB6A]" size={18} />Money
        </button>
      </div>
    </div>
  );
};

export default TestingPersonalChat; 