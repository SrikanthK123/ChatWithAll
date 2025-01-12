/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { FaImage, FaTrash,FaEdit, FaEllipsisV,FaUpload,FaGlobe,FaDownload ,FaFileAlt,FaPaperclip,FaCamera,FaFolderOpen,FaLocationArrow,FaUserFriends,FaBan,FaSmile, FaSearchLocation, FaAudible, FaAudioDescription, FaCommentDots, FaMicrophone, FaCog, FaVideo, FaDollarSign } from 'react-icons/fa'; 
import { useUser } from '../../UseContext';
import { account, client, databases,storage } from "../../lib/appwrite";
import { AlluseUsers } from '../../hook/AllUserData';
import { ID, Query } from 'appwrite';
import EmojiPicker from 'emoji-picker-react';
import MessageSendPopSound from "../../assets/Images/MessagePop.mp3"
import { saveAs } from 'file-saver';
import axios from "axios";
import { GEMINI_API_KEY } from '../SecretKeys';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

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
  const [latestUsername, setLatestUsername] = useState('');
  const [latestMessage, setLatestMessage] = useState('');
  const [image, setImage] = useState(null);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [errorData, setErrorData] = useState(null); 
  const [uploading, setUploading] = useState(false); // Upload process indicator
 const [userProfiles, setUserProfiles] = useState(userData?.profileImage);
 const { user } = useUser();
// Destructure fullResponse (profilePicture, username, etc.) from user
const { profilePicture, username, userId } = user || {};
const [downloadedImages, setDownloadedImages] = useState({});
const [dialogImage, setDialogImage] = useState("");
const [dialogOpen, setDialogOpen] = useState(false);
const [dialogUsername, setDialogUsername] = useState("");
const [isModalVisible, setModalVisible] = useState(false);
const [modalImage, setModalImage] = useState("");
const [modalTitle, setModalTitle] = useState("");
const [modalDateTime, setModalDateTime] = useState("");
const [translatedMessages, setTranslatedMessages] = useState({});
const [checkTranslate, setCheckTranslate] = useState(false);
const [aiAnswer, setAiAnswer] = useState(null);
const [selectedLanguage, setSelectedLanguage] = useState(); // Default to Telugu
const [showOkButton, setShowOkButton] = useState(false);


const generateAIAnswer = async (textToTranslate, targetLanguage) => {
  const API_KEY = GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const payload = {
    contents: [{ parts: [{ text: `Translate to ${targetLanguage} in short according to text size: ${textToTranslate}` }] }]
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0] &&
      response.data.candidates[0].content.parts[0].text
    ) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      return 'Could not get a valid translation from the AI.';
    }
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return 'Error occurred while fetching AI response.';
  }
};





const handleTranslateMessage = async (body, targetLanguage) => {
  const translatedText = await generateAIAnswer(body, targetLanguage);
  alert(`Translated to ${targetLanguage}: ${translatedText}`);
  setShowOkButton(false); // Hide the "OK" button after translation
};

const handleLanguageSelect = (language) => {
  setSelectedLanguage(language);
  setShowOkButton(true); // Show the "OK" button when a language is selected
};




const openDialog = (imageUrl, username) => {
  setDialogImage(imageUrl);
  setDialogUsername(username);
  setDialogOpen(true);
};

const closeDialog = () => {
  setDialogOpen(false);
  setDialogImage("");
};
  // Function to open the dialog
  const showDialog = (imageUrl, title, dateTime) => {
    setModalImage(imageUrl);
    setModalTitle(title);
    setModalDateTime(dateTime);
    setModalVisible(true);
  };

  // Function to close the dialog
  const hideDialog = () => {
    setModalVisible(false);
    setModalImage("");
    setModalTitle("");
    setModalDateTime("");
  };

  // Function to handle image download
  const downloadImage = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "shared_image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
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
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2,
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
      `databases.${import.meta.env.VITE_DATABASE_ID_2}.collections.${import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2}.documents`,
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
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2,
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
      username: userData.name,
      timestamp: new Date().toISOString(),
    };
  
    if (editingMessageId) {
      // Update the existing message
      try {
        const response = await databases.updateDocument(
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2,
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
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2,
          ID.unique(),
          payload
        );
  
        setMessages((prevMessages) => [response, ...prevMessages]);
        const audio = new Audio(MessageSendPopSound);
        audio.play();
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
      await databases.deleteDocument(import.meta.env.VITE_DATABASE_ID_2, import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2, messageId);
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
        // Update the message in the database
        const response = await databases.updateDocument(
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2,
          messageId,
          { body: messageBody, edited: true } // Mark the message as edited
        );
  
        // Translate the updated message text to Telugu
        const translatedText = await generateAIAnswer(messageBody); // Assuming `generateAIAnswer` translates the message
  
        // Update the message in the state with both original and translated text
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.$id === messageId
              ? { ...msg, body: messageBody, translatedText: translatedText, edited: true }
              : msg
          )
        );
  
        // Clear the input and reset editing state
        setMessageBody('');
        setEditingMessageId(null);
      } catch (error) {
        console.error('Error updating message:', error);
      }
    }
  };
  
  const RandomUserImageGenerated = Math.floor(Math.random() * 50);
  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
    setIsImageSelected(!!selectedImage);
    setErrorData(null);
  };
  const handleUpload = async (event) => {
    event.preventDefault();
  
    if (!image) {
      setErrorData("Please select an image first.");
      return;
    }
    setUploading(true);
    setErrorData(null);
  
    try {
      // Upload the image to the storage
      const response = await storage.createFile(
        import.meta.env.VITE_SECOND_ACCOUNT_BUCKET_2,
        ID.unique(),
        image
      );
      const fileId = response.$id;
      const fileUrl = await storage.getFileView(import.meta.env.VITE_SECOND_ACCOUNT_BUCKET_2, fileId);
  
      // Save image reference in the database with fileId and imageUrl
      await saveImageReference(fileId, fileUrl.href);
  
      setUploading(false);
      setIsImageSelected(false);
    } catch (err) {
      setUploading(false);
      setErrorData("Error uploading image: " + err.message);
    }
  };
  
  // Save image reference in the database
  const saveImageReference = async (fileId, imageUrl) => {
    try {
      // Create the new message object with the relevant data
      const newMessage = {
        user_id: userData.$id,
        username: userData.name,
        timestamp: new Date().toISOString(),
        imageUrl: [imageUrl],  // Store image URL in the array
        fileId: fileId,  // Store file ID for reference
      };
  
      // Check if environment variables are defined
      const databaseId = import.meta.env.VITE_DATABASE_ID_2;
      const collectionId = import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2;
  
      if (!databaseId || !collectionId) {
        throw new Error("Environment variables for database or collection ID are not set.");
      }
  
      // Create a new document for the group chat message
      const response = await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        newMessage
      );
  
      console.log('Created new document with image reference', response);
    } catch (err) {
      setErrorData("Error saving image reference: " + err.message);
      console.error('Error saving image reference:', err);
    }
  };
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2,
          [Query.orderAsc('$createdAt'), Query.limit(500)]
        );
        setMessages(response.documents);
  
        // Optionally: You can also handle image URL fetching here if needed.
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
  
    fetchMessages();
  }, []);
  
  
  const updateProfileImage = (newImageUrl) => {
    setUserData((prev) => ({ ...prev, profileImage: newImageUrl }));
  };
  
  const updateUserProfile = (userId, newImageUrl) => {
    setUserProfiles((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), profileImage: newImageUrl },
    }));
  };
  
  // Fetch user profile data from the database
const getUserProfile = async (userId) => {
  try {
    const userDoc = await databases.getDocument(import.meta.envVITE_COLLECTION_ID_GROUP_MESSAGE_2, userId);
    return userDoc.avatar || "default-avatar-url";
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return "default-avatar-url";
  }
};
const handleDownload = (url) => {
  // Fetch the image as a Blob
  fetch(url)
    .then(response => response.blob()) // Convert the image to a Blob
    .then(blob => {
      // Generate a filename (if the URL does not already provide a name)
      const fileName = url.split('/').pop(); // Take the last part of the URL
      saveAs(blob, fileName); // Trigger the download using file-saver
    })
    .catch(error => {
      console.error('Download failed:', error);
    });
};
// Translating text 

  
  return (
    <div className="bg-slate-200 w-full min-h-screen flex flex-col " style={{background:'linear-gradient(to bottom,transparent),linear-gradient(to top, black, transparent),url(https://img.freepik.com/free-vector/pastel-blue-watercolor-background-vector_53876-62430.jpg?t=st=1732900085~exp=1732903685~hmac=df29dc26604d2568ebb61693167ae0eb70d90f1b34db2d4cdc2592ab88c54843&w=740)',backgroundRepeat:'no-repeat',backgroundPosition:'center',backgroundSize:'cover'}}>
     <div
  className="fixed top-0 left-0 right-0 flex justify-center items-center p-3 z-30"
  style={{ backgroundColor: 'rgb(62 76 188 / 16%)' }}
>
  <h3 className="text-xl text-center px-4 py-2 rounded-md text-[#001529] font-bold  text-shadow-lg" style={{textShadow:'2px 2px 4px rgba(0, 0, 0, 0.5)'}}>
  Chat Among Friends
  </h3>
</div>  
<div className="flex-1 p-2 overflow-y-auto max-h-[82vh]">
<div className="space-y-4 mt-14">
  {/* Replace `messages` with your array of messages */}
  {messages.map((msg) => {
  const isCurrentUser = msg.user_id === userData?.$id;
  const isImageMessage = msg.imageUrl && msg.imageUrl.length > 0;

  const userProfileImage = isCurrentUser
    ? userData?.profilePicture || "https://img.freepik.com/free-vector/smiling-young-man-glasses_1308-174373.jpg"
    : userProfiles?.[msg.user_id]?.profileImage || "https://img.freepik.com/free-vector/smiling-young-man-glasses_1308-174702.jpg";

  return (
    <div key={msg.$id} className={`relative flex items-start space-x-4 py-2 ${isCurrentUser ? "justify-end" : ""}`}>
      {!isCurrentUser && (
        <div>
          <img src={userProfileImage} alt="User Avatar" className="w-10 h-10 rounded-full bg-gray-500" />
        </div>
      )}

      <div
        className={`relative max-w-[60%] p-3 mx-5 shadow-md ${isCurrentUser ? "rounded-tl-lg rounded-br-lg rounded-bl-lg bg-blue-500 text-white ml-auto" : "rounded-tr-lg rounded-bl-lg rounded-br-lg bg-gray-100 text-black"}`}
      >
        {/* Render message timestamp */}
        <span style={{ fontSize: "10px" }}>
          {new Date(msg.timestamp).toLocaleDateString()}
        </span>

        {/* Render sender name */}
        <span className={`text-xs font-semibold block mb-1 ${isCurrentUser ? "text-black" : "text-blue-600"}`}>
          {isCurrentUser ? `${msg.username} (You)` : msg.username || "Anonymous"}
        </span>

        {/* Render text message */}
        {!isImageMessage && <p className="text-md font-semibold break-words">{msg.body}</p>}

        {/* Render image message */}
        {isImageMessage && (
          <div className="image-container mt-2 relative">
            {msg.imageUrl.map((url, index) => (
              <div key={index} className="relative" onClick={() => openDialog(url, msg.username || "Anonymous")}>
                {!isCurrentUser && !downloadedImages[url] && (
                  <div className="absolute cursor-pointer inset-0 flex items-center justify-center bg-black bg-opacity-30 text-blue-200 text-lg font-mono rounded-lg z-30">
                    See Image
                  </div>
                )}
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className={`message-image max-w-full max-h-60 rounded-lg cursor-pointer ${!isCurrentUser && !downloadedImages[url] ? "blur-sm" : "blur-none"}`}
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
                  }}
                />
              </div>
            ))}
          </div>
        )}
         {/* Time */}
         <span style={{ fontSize: "10px" }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>

        {/* Options */}
{!isImageMessage && (
  <div className="absolute top-1 right-0 px-2">
    <FaEllipsisV
      className={`cursor-pointer hover:text-black ${isCurrentUser ? "text-white" : "text-black"}`}
      onClick={() => toggleMenu(msg.$id)}
      size={11}
    />
    {selectedMenu === msg.$id && (
      <div className="absolute right-0 top-5 shadow-md bg-white rounded-lg p-2 z-30" style={{ minWidth: "120px" }}>
        {isCurrentUser ? (
          <>
            <button
              onClick={() => handleDeleteMessage(msg.$id)}
              className="block w-full text-xs text-red-500 hover:bg-red-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-red-600"
            >
              <FaTrash size={12} />
              Delete
            </button>
            <button
              onClick={() => handleEditMessage(msg.$id, msg.body)}
              className="block w-full text-xs text-blue-500 hover:bg-blue-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-blue-600"
            >
              <FaEdit size={12} />
              Edit
            </button>

            {/* Language Selection Dropdown */}
            <select
              onChange={(e) => {
                handleLanguageSelect(e.target.value);
                setShowOkButton(true); // Ensure OK button shows up immediately after language selection
              }}
              className="text-green-500 text-center text-sm"
              value={selectedLanguage || ""}
            >
              <option value="" className="text-gray-400 text-sm">
                Translate
              </option>
              <option value="Telugu" className="text-gray-400 text-sm">
                Telugu
              </option>
              <option value="Hindi" className="text-gray-400">
                Hindi
              </option>
              <option value="Tamil" className="text-gray-400">
                Tamil
              </option>
              <option value="Malayalam" className="text-gray-400">
                Malayalam
              </option>
              <option value="Kannada" className="text-gray-400">
                Kannada
              </option>
              <option value="English" className="text-gray-400">
                English
              </option>
            </select>

            {/* Show the "OK" button after a language is selected */}
            {selectedLanguage !== "Translate" && showOkButton && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleTranslateMessage(msg.body, selectedLanguage)} // Pass the message and selected language
                  className="bg-blue-500 text-white px-4 w-full rounded-md mt-2 text-[12px]"
                >
                  OK
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="">
            {/* Language Selection Dropdown */}
            <select
              onChange={(e) => {
                handleLanguageSelect(e.target.value);
                setShowOkButton(true); // Ensure OK button shows up immediately after language selection
              }}
              className="text-green-500 text-center text-sm"
              value={selectedLanguage || ""}
            >
              <option value="" className="text-gray-400 text-sm">
                Translate
              </option>
              <option value="Telugu" className="text-gray-400 text-sm">
                Telugu
              </option>
              <option value="Hindi" className="text-gray-400">
                Hindi
              </option>
              <option value="Tamil" className="text-gray-400">
                Tamil
              </option>
              <option value="Malayalam" className="text-gray-400">
                Malayalam
              </option>
              <option value="Kanada" className="text-gray-400">
                Kannada
              </option>
              <option value="English" className="text-gray-400">
                English
              </option>
            </select>

            {/* Show the "OK" button after a language is selected */}
            {selectedLanguage !== "Translate" && showOkButton && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleTranslateMessage(msg.body, selectedLanguage)} // Pass the message and selected language
                  className="bg-blue-500 text-white px-4 w-full rounded-md mt-2 text-[12px]"
                >
                  OK
                </button>
              </div>
            )}
            
          </div>
        )}
        
      </div>
    )}
    
  </div>
)}

{/* For image messages, only show the delete option */}
{isImageMessage && isCurrentUser && (
  <div className="absolute top-1 right-0 px-2">
    <FaEllipsisV
      className={`cursor-pointer hover:text-black ${isCurrentUser ? "text-white" : "text-black"}`}
      onClick={() => toggleMenu(msg.$id)}
      size={11}
    />
    {selectedMenu === msg.$id && (
      <div className="absolute right-0 top-5 shadow-md bg-white rounded-lg p-2 z-30" style={{ minWidth: "120px" }}>
        <button
          onClick={() => handleDeleteMessage(msg.$id)}
          className="block w-full text-xs text-red-500 hover:bg-red-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-red-600"
        >
          <FaTrash size={12} />
          Delete
        </button>
      </div>
    )}
  </div>
)}

      </div>
    </div>
  );
})}


  {/* Dialog */}
  <Dialog open={dialogOpen} handler={closeDialog} className="" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://img.freepik.com/free-vector/seamless-pattern-with-speech-bubbles-communication-speak-word-illustration_1284-52009.jpg')`, backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
    <DialogHeader className="text-2xl text-cyan-300 font-bold">
      <p className="text-xl">✨ Image Shared by {dialogUsername} ✨</p>
    </DialogHeader>
    <DialogBody className="flex justify-center items-center min-h-[65vh]">
      <img src={dialogImage} alt="Shared" className="max-w-full max-h-[65vh] rounded-lg transform hover:scale-105 transition duration-300" />
    </DialogBody>
    <DialogFooter>
      <button onClick={closeDialog} className="bg-white text-red-600 px-4 py-1 rounded-lg font-semibold hover:bg-red-100" style={{ boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px' }}>Close</button>
      <button onClick={() => handleDownload(dialogImage)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ml-2" style={{ boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px' }}>
        <FaDownload />
      </button>
    </DialogFooter>
  </Dialog>
</div>

</div>
      <div className="bg-[#001529] px-4 py-3 sticky bottom-0 flex justify-center">
      <form
  className="flex items-center gap-3 px-4 w-full max-w-3xl rounded-lg"
  onSubmit={handleCreateMessage}
>
  <textarea
    type="text"
    value={messageBody}
    onFocus={() => setIsMessageFocused(true)}
    onBlur={() => setIsMessageFocused(false)}
    onChange={(e) => setMessageBody(e.target.value)}
    placeholder="Type your message..."
    className={`bg-gray-700 text-white w-full p-3 rounded-lg shadow-md resize-none ${
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
  <input
    type="file"
    accept="image/*"
    id="image-upload"
    onChange={handleImageChange}
    className="hidden"
  />
  <label htmlFor="image-upload" className="cursor-pointer">
    <FaImage size={18} className="text-white hover:text-[#5fc9f3]" />
  </label>
  {isImageSelected && (
    <button
      onClick={handleUpload}
      disabled={uploading}
      className="text-white px-3 py-2 rounded flex items-center justify-center gap-2"
    >
      {uploading ? <div className="loading-circle"></div> : <FaUpload className="UploadMovement py-1 rounded-sm" size={25} />}
    </button>
  )}
  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 flex items-center justify-center"
  >
    <FaLocationArrow />
  </button>
</form>
</div>
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

export default IndividualChat; 