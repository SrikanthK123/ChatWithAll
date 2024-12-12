/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { FaImage, FaTrash, FaEllipsisV ,FaFileAlt,FaPaperclip,FaCamera,FaFolderOpen,FaLocationArrow, } from 'react-icons/fa'; 
import { useUser } from '../../UseContext';
import { account, client, databases } from "../../lib/appwrite";
import { AlluseUsers } from '../../hook/AllUserData';
import { ID, Query } from 'appwrite';
import EmojiPicker from 'emoji-picker-react';

const IndividualChat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);  
  const [selectedFile, setSelectedFile] = useState(null);
  const [userData, setUserData] = useState(null); 
  const { users, error } = AlluseUsers();
  const [messageBody, setMessageBody] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null); // Track which message is being edited
  const [isMessageFocused, setIsMessageFocused] = useState(false); // Track if textarea is focused
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false); 
  const [showPicker, setShowPicker] = useState(false);
  const [text, setText] = useState("Edited");

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  const toggleAttachmentOptions = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };
  const handleEmojiClick = (emoji) => {
    setMessageBody((prevMessageBody) => prevMessageBody + emoji.emoji);
    setShowPicker(false); // Hide picker after selection
  };

  const handleOptionClick = (option) => {
    console.log(`${option} clicked!`);
    // Implement specific functionality for each option here
  };  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await account.get();
        setUserData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COLLECTION_ID_MESSAGE,
          [Query.orderAsc('$createdAt'),
            Query.limit(500)
          ]
        );
        setMessages(response.documents);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${import.meta.env.VITE_DATABASE_ID}.collections.${import.meta.env.VITE_COLLECTION_ID_MESSAGE}.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          // Handle new messages
          setMessages((prevMessages) => {
            const isDuplicate = prevMessages.some((msg) => msg.$id === response.payload.$id);
            return isDuplicate ? prevMessages : [...prevMessages, response.payload];
          });
        }
  
        if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
          // Handle deleted messages
          setMessages((prevMessages) => prevMessages.filter((msg) => msg.$id !== response.payload.$id));
        }
  
        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          // Handle updated messages
          setMessages((prevMessages) => {
            return prevMessages.map((msg) =>
              msg.$id === response.payload.$id ? { ...msg, body: response.payload.body } : msg
            );
          });
        }
      }
    );
  
    return () => unsubscribe();
  }, []);
  

  const handleSendMessage = async () => {
    if (message.trim() || selectedFile) {
      const time = formatTime(new Date());
      const newMessage = {
        body: message,
        completed: false,
        username: userData?.name || 'Anonymous',
        user_id: userData?.$id || 'unknown',
        file: selectedFile,
        time,
      };

      try {
        const response = await databases.createDocument(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COLLECTION_ID_MESSAGE,
          ID.unique(),
          newMessage,
          
        );

        setMessages((prevMessages) => [response, ...prevMessages]);
        setMessage('');
        setSelectedFile(null);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
    }
  };

  const handleCreateMessage = async (e) => {
    e.preventDefault();
  
    let payload = {
      body: messageBody,
      user_id: userData.$id,
      username: userData.name
    };
  
    if (editingMessageId) {
      // Update the existing message
      try {
        const response = await databases.updateDocument(
          import.meta.env.VITE_DATABASE_ID,
          import.meta.env.VITE_COLLECTION_ID_MESSAGE,
          editingMessageId, // Use the editing message ID
          payload
        );
  
        // Update the message in the state without adding a new one
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.$id === editingMessageId ? { ...msg, body: messageBody, } : msg
       
          )
        );
        setMessageBody('');
        setEditingMessageId(null); // Reset editing state
      } catch (error) {
        console.error('Error updating message:', error);
      }
    } else {
      // Create a new message
      try {
        const response = await databases.createDocument(
          import.meta.env.VITE_DATABASE_ID,
          '6738bb47000e6b648061',
          ID.unique(),
          payload
        );
  
        setMessages((prevMessages) => [response, ...prevMessages]);
        setMessageBody('');
      } catch (error) {
        console.error('Error creating message:', error);
      }
    }
  };
  

  const toggleMenu = (messageId) => {
    setSelectedMenu(selectedMenu === messageId ? null : messageId);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await databases.deleteDocument(import.meta.env.VITE_DATABASE_ID, '6738bb47000e6b648061', messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEditMessage = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setMessageBody(currentText);
    setSelectedMenu(null); // Close the menu when editing
    
  };

  const handleUpdateMessage = async (messageId) => {
    if (messageBody.trim()) {
      try {
        const response = await databases.updateDocument(
          import.meta.env.VITE_DATABASE_ID,
          '6738bb47000e6b648061',
          messageId,
          { body: messageBody, edited: true } // Add the updated fields
        );
  
        // Update the message in the state
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.$id === messageId ? { ...msg, body: messageBody, edited: true } : msg
          )
        );
  
        // Clear input and reset editing state
        setMessageBody('');
        setEditingMessageId(null);
      } catch (error) {
        console.error('Error updating message:', error);
      }
    }
  };
  const RandomUserImageGenerated = Math.floor(Math.random() * 50);

  return (
    <div className="bg-slate-200 w-full min-h-screen flex flex-col " style={{background:'linear-gradient(to bottom,transparent),linear-gradient(to top, black, transparent),url(https://img.freepik.com/free-vector/pastel-blue-watercolor-background-vector_53876-62430.jpg?t=st=1732900085~exp=1732903685~hmac=df29dc26604d2568ebb61693167ae0eb70d90f1b34db2d4cdc2592ab88c54843&w=740)',backgroundRepeat:'no-repeat',backgroundPosition:'center',backgroundSize:'cover'}}>
      <div className='bg-slate-300 flex justify-center p-3 '>
      <h3 className='bg-[#001529] text-xl text-center p-1 rounded-md text-white shadow-lg'>This is IndividualChatx page</h3>
      </div>
     
      
      <div className="flex-1 p-4 overflow-y-auto max-h-[79vh]">
        <div className="space-y-4">
        {messages.map((msg) => {
  const isCurrentUser = msg.user_id === userData?.$id;
  
  return (
    <div
      key={msg.$id}
      className={`relative flex items-start space-x-4 ${isCurrentUser ? 'justify-end' : ''}`}
    >
      {!isCurrentUser &&  (
        <div>
          <img
            src={`https://randomuser.me/api/portraits/men/${RandomUserImageGenerated}.jpg`}
            alt="User Avatar"
            className="w-10 h-10 rounded-full bg-gray-500"
          />
          
        </div>
      )}
      <div
        className={`relative max-w-[80%] p-3 shadow-md ${isCurrentUser ? 'rounded-tl-lg rounded-br-lg rounded-bl-lg bg-blue-500 text-white ml-auto' : 'rounded-tr-lg rounded-bl-lg rounded-br-lg  bg-gray-200 text-black'}`}
      >
        <span style={{ fontSize: '10px' }}>
          {new Date(msg.$createdAt).toLocaleDateString()}
        </span>
        
        {isCurrentUser && (
          <button
            onClick={() => toggleMenu(msg.$id)}
            className="absolute top-1 right-1 text-white hover:text-black"
          >
            <FaEllipsisV size={10} />
          </button>
        )}
        {selectedMenu === msg.$id && (
          <div className="absolute right-0 top-8 bg-white shadow-md rounded-lg p-2 z-30" style={{ minWidth: '120px' }}>
            <button
              onClick={() => handleDeleteMessage(msg.$id)}
              className="block w-full text-xs text-red-500 hover:bg-red-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg"
            >
              <FaTrash size={12} />
              <span>Delete</span>
            </button>
            <button
              onClick={() => handleEditMessage(msg.$id, msg.body)}
              className="block w-full text-xs text-blue-500 hover:bg-blue-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg"
            >
              <FaImage size={12} />
              <span>Edit</span>
            </button>
          </div>
        )}
        <span className={`text-xs font-semibold block mb-1 ${isCurrentUser ? 'text-black' : 'text-blue-600'}`}>
          {isCurrentUser ? `${msg.username} (You)` : msg.username || 'Anonymous'}
        </span>
        <p className="text-md font-semibold break-words">{msg.body}</p>
        {msg.edited && <span className="text-xs text-white italic">edited</span>} {/* Show 'edited' label */}
        <span style={{ fontSize: '10px' }}>
          {new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          
        </span>
      </div>
    </div>
  );
})}


        </div>
      </div>
      <div className="bg-[#001529] p-4 sticky bottom-0">
  <form className="flex items-center gap-1 px-3" onSubmit={handleCreateMessage}>
  
    {showAttachmentOptions && (
      <div className="absolute bottom-16 left-0 bg-slate-600 shadow-md rounded-lg p-2 w-48 flex flex-col gap-2 z-50">
        <button
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
          onClick={() => handleOptionClick('Location')}
        >
          <FaLocationArrow size={16} className="text-blue-500" />
          <span>Location</span>
        </button>
        <button
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
          onClick={() => handleOptionClick('Gallery')}
        >
          <FaImage size={16} className="text-green-500" />
          <span>Gallery</span>
        </button>
      </div>
    )}
   <textarea
            type="text"
            value={messageBody}
            onFocus={() => setIsMessageFocused(true)}
            onBlur={() => setIsMessageFocused(false)}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type your message..."
            className={`bg-gray-700 text-white w-full p-3 rounded-lg shadow-md resize-none ${isMessageFocused ? 'h-24' : 'h-16'} transition-all`}
          ></textarea>
           { /*<FaPaperclip
      onClick={toggleAttachmentOptions}
      className="cursor-pointer text-blue-500 hover:text-blue-700"
      size={25}
    />*/}
    <button
      type="button"
      onClick={() => setShowPicker(!showPicker)}
      className=" hover:bg-gray-400 text-white rounded-lg px-1 py-1"
    >
      😀
    </button>
    
    {showPicker && (
      <div className="absolute bottom-16 right-4 z-50">
        <EmojiPicker onEmojiClick={handleEmojiClick} value={messageBody}  onChange={(e) => setMessageBody(e.target.value)} />
      </div>
    )}
    <button
          type='submit'
          className=" bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3"
        >
          <FaLocationArrow />
        </button>
  </form>
</div>

    </div>
  );
};

export default IndividualChat; 