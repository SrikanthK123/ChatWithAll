/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { FaImage, FaTrash,FaEdit, FaEllipsisV,FaUpload,FaDownload ,FaFileAlt,FaPaperclip,FaCamera,FaFolderOpen,FaLocationArrow,FaUserFriends,FaBan,FaSmile, FaSearchLocation, FaAudible, FaAudioDescription, FaCommentDots, FaMicrophone, FaCog, FaVideo, FaDollarSign } from 'react-icons/fa'; 
import { useUser } from '../../UseContext';
import { account, client, databases,storage } from "../../lib/appwrite";
import { AlluseUsers } from '../../hook/AllUserData';
import { ID, Query } from 'appwrite';
import EmojiPicker from 'emoji-picker-react';
import MessageSendPopSound from "../../assets/Images/MessagePop.mp3"
import { saveAs } from 'file-saver';
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [modalImage, setModalImage] = useState(null); // Image being displayed in modal
 const [ImageModalOpen, setImageModalOpen] = useState(false);
 const [userProfiles, setUserProfiles] = useState(userData?.profileImage);
 const { user } = useUser();
// Destructure fullResponse (profilePicture, username, etc.) from user
const { profilePicture, username, userId } = user || {};
const [downloadedImages, setDownloadedImages] = useState({});
const [dialogImage, setDialogImage] = useState("");
const [dialogOpen, setDialogOpen] = useState(false);
const [dialogUsername, setDialogUsername] = useState("");


const openDialog = (imageUrl, username) => {
  setDialogImage(imageUrl);
  setDialogUsername(username);
  setDialogOpen(true);
};

const closeDialog = () => {
  setDialogOpen(false);
  setDialogImage("");
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
        const response = await databases.updateDocument(
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2,
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
  {messages.map((msg) => {
    const isCurrentUser = msg.user_id === userData?.$id;
    const isImageMessage = msg.imageUrl && msg.imageUrl.length > 0;

    // Fetch the profile image for the message sender
    const userProfileImage = isCurrentUser
      ? userData?.profilePicture || "https://img.freepik.com/free-vector/smiling-young-man-glasses_1308-174373.jpg?t=st=1735473718~exp=1735477318~hmac=4ba0ccc1684548f8599be9329aa873201c52ed5a9d80e985803a70067bce99a5&w=740"
      : (userProfiles?.[msg.user_id]?.profileImage || "https://img.freepik.com/free-vector/smiling-young-man-glasses_1308-174702.jpg?t=st=1735473746~exp=1735477346~hmac=d1d5680259e80f68ca8417ac715696af4512da3e86aa09d56661ee9d28bfc817&w=740");

    return (
      <div key={msg.$id} className={`relative flex items-start space-x-4 ${isCurrentUser ? "justify-end" : ""}`}>
        {/* Avatar for non-current user */}
        {!isCurrentUser && (
          <div>
            <img
              src={userProfileImage}
              alt="User Avatar"
              className="w-10 h-10 rounded-full bg-gray-500"
            />
          </div>
        )}

        {/* Message Box */}
        <div
          className={`relative max-w-[60%] p-3 mx-5 shadow-md ${isCurrentUser
            ? "rounded-tl-lg rounded-br-lg rounded-bl-lg bg-blue-500 text-white ml-auto"
            : "rounded-tr-lg rounded-bl-lg rounded-br-lg bg-gray-100 text-black"
          }`}
        >
          {/* Display timestamp */}
          <span style={{ fontSize: "10px" }}>
            {new Date(msg.timestamp).toLocaleDateString()}
          </span>

          {/* Sender Name */}
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
                  <div className="absolute cursor-pointer inset-0 flex items-center justify-center  bg-black bg-opacity-50 text-cyan-400 text-lg font-mono rounded-lg z-30">
                    See Image
                  </div>
                )}
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className={`message-image max-w-full max-h-60 rounded-lg cursor-pointer ${
                    !isCurrentUser && !downloadedImages[url] ? "blur-sm" : "blur-none"
                  }`}
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
                  }}
                />
              </div>
            ))}
          </div>
          
          )}
          <Dialog open={dialogOpen}  handler={closeDialog} className="bg-gray-800" style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://img.freepik.com/free-vector/seamless-pattern-with-speech-bubbles-communication-speak-word-illustration_1284-52009.jpg?t=st=1736347661~exp=1736351261~hmac=5fe0af02bf8072ece1ec264d2591cd2789b0a22ac6646520776a59d1d4f50e0a&w=740')`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}>
  <DialogHeader
    className="text-2xl text-cyan-300 font-bold tracking-wide"
    style={{ background: 'top right rgba(15, 16, 16, 0.16)' }}
  >
    <p className='text-xl'>✨ Image Shared by {dialogUsername} ✨</p>
  </DialogHeader>

  <p className="text-[11px] text-gray-200 mt-1 mx-2 w-fit p-1 rounded-md bg-[#001529]">
    Date: {new Date(msg.timestamp).toLocaleDateString()} & Time: 
    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </p>

  <DialogBody className="flex justify-center items-center min-h-[65vh]">
    <div className="relative">
      <img
        src={dialogImage}
        alt="Shared Image"
        className="max-w-full max-h-[65vh] rounded-lg transform transition-transform duration-500 ease-in-out hover:rotate-3d hover:scale-105"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      />
    </div>
  </DialogBody>
  <DialogFooter>
    <Button
      variant="text"
      color="red"
      onClick={closeDialog}
      className="mr-1 bg-white"
    >
      <span>Close</span>
    </Button>
    <Button
      variant="gradient"
      color="blue"
      className="bg-blue-500 hover:bg-blue-600 rounded-xl mx-1"
      onClick={() => handleDownload(dialogImage)}
    >
      <FaDownload className="DownloadingProcessing" size={20} />
    </Button>
  </DialogFooter>
</Dialog>
         

 {/* Edited tag */}
          {msg.edited && <span className="text-xs text-white italic">edited</span>}

          {/* Time */}
          <span style={{ fontSize: "10px" }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>

          {/* Options for current user */}
          {isCurrentUser && (
            <div className="absolute top-1 right-0 px-2">
              <FaEllipsisV
                className="cursor-pointer text-white hover:text-black"
                onClick={() => toggleMenu(msg.$id)}
                size={12}
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
                  {!isImageMessage && (
                    <button
                      onClick={() => handleEditMessage(msg.$id, msg.body)}
                      className="block w-full text-xs text-blue-500 hover:bg-blue-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-blue-600"
                    >
                      <FaEdit size={12} />
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  })}
  
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