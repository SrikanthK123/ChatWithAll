/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { account, databases, client ,storage} from "../../lib/appwrite"; // Assuming Appwrite is configured
import { Query, ID } from "appwrite";
import { FaLocationArrow, FaEllipsisV, FaTrash,FaArrowUp,FaArrowDown,FaCaretUp,FaImage,FaDownload,FaCaretDown,FaLanguage, FaEdit,FaUser,FaSignOutAlt,FaCamera,FaVideo,FaSearchLocation,FaFileAlt,FaDollarSign, FaUpload, FaEye } from "react-icons/fa"; // Added FaEllipsisV and FaTrash
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-hot-toast";
import MessageSendPopSound from "../../assets/Images/MessagePop.mp3"
import axios from "axios";
import { GEMINI_API_KEY } from "../SecretKeys";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { saveAs } from 'file-saver';
import debounce from "lodash/debounce";


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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInfo, setCurrentInfo] = useState(null);;
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDownloaded, setDownloaded] = useState(false); // State to track if the image is downloaded
  const [downloadedImages, setDownloadedImages] = useState({});
  const [ImageModalOpen, setImageModalOpen] = useState(false);
  const [viewedImages, setViewedImages] = useState({});
  const [hideButton, setHideButton] = useState(false);
const [isImageSelected, setIsImageSelected] = useState(false);
const [dialogOpen, setDialogOpen] = useState(false);
const [dialogImage, setDialogImage] = useState("");
const [isModalVisible, setModalVisible] = useState(false);
const [modalImage, setModalImage] = useState("");
const [modalTitle, setModalTitle] = useState("");
const [modalDateTime, setModalDateTime] = useState("");
const [chatDetails, setChatDetails] = useState(false);
const [loadingChatInfo, setLoadingChatInfo] = useState(true);
const [isTyping, setIsTyping] = useState(false);
const [otherUserTyping, setOtherUserTyping] = useState(false);
const [selectedLanguage, setSelectedLanguage] = useState(); // Default to Telugu
const [showOkButton, setShowOkButton] = useState(false);

const openDialog = debounce((imageUrl, username) => {
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    setDialogImage(imageUrl);
    setDialogOpen(true);
  };
}, 200);

const closeDialog = () => {
  setDialogOpen(false);
  setTimeout(() => {
    setDialogImage("");
  }, 300);
};

  // Function to open the dialog
  const showDialog = (imageUrl, title, dateTime) => {
    setModalImage(imageUrl);
    setModalTitle(title);
    setModalDateTime(dateTime);
    setModalVisible(true);
};

const openModal = (info) => {
    setCurrentInfo(info);
    setIsModalOpen(true);
};

const closeModal = () => {
    setIsModalOpen(false);
    setCurrentInfo(null);
};

// Modal Pop-Up Information
const Info = [
    {
        title: "Camera",
        ImgUrl: "https://img.freepik.com/free-vector/couple-photo-booth-concept-illustration_114360-4712.jpg",
        Para: "Please grant camera access to use this feature.",
    },
    {
        title: "Image",
        ImgUrl: "https://img.freepik.com/free-vector/concept-with-selfie-social-application_23-2148280535.jpg?t=st=1735050348~exp=1735053948~hmac=4a3651ffe939d89c3a4e14f1c9a88622cb9b97e3e486a5b982e27e90077802b2&w=740",
        Para: "Access your image gallery to upload or select images.",
    },
    {
        title: "Video",
        ImgUrl: "https://img.freepik.com/free-vector/telecommuting-concept_52683-36509.jpg?t=st=1735050139~exp=1735053739~hmac=0e45f14d710514b76fc3521ce7b2d256ffa678a6c10fffe537876048241879be&w=1060",
        Para: "Enable video access to record or upload videos.",
    },
    {
        title: "Location",
        ImgUrl: "https://img.freepik.com/free-vector/directions-concept-illustration_114360-5203.jpg?t=st=1735050039~exp=1735053639~hmac=ff3e8bbd649744d09379a7b317ea90456935739c0f622819deca5c34fc83dad0&w=740",
        Para: "Allow location access to use this feature effectively.",
    },
    {
        title: "File",
        ImgUrl: "https://img.freepik.com/free-vector/concept-landing-page-transfer-files_23-2148298755.jpg?t=st=1735049761~exp=1735053361~hmac=8856396895a74df16322704efc6a34739519707a6d26b0a496440f34c830ca81&w=740",
        Para: "Grant file access to upload and manage your files.",
    },
    {
        title: "Money",
        ImgUrl: "https://img.freepik.com/free-vector/volunteers-help-work_24908-58096.jpg?t=st=1735049647~exp=1735053247~hmac=54ad1f62fff71c00d1ec0280329b7c62df54b6239916bae30afec967a2be630c&w=740",
        Para: "Provide access to manage your financial resources securely.",
    },
];
  
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
        import.meta.env.VITE_DATABASE_ID_2,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
        [
          Query.equal("senderName", user.name),
          Query.equal("receiverName", username),
        ]
      );

      const messagesForReceiver = await databases.listDocuments(
        import.meta.env.VITE_DATABASE_ID_2,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
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

  //Real Time Messages 
 // Real-time subscription and message handling
 useEffect(() => {
  if (user && username) {
    // Fetch initial messages when the component is loaded
    getMessages();

    const unsubscribe = client.subscribe(
      `databases.${import.meta.env.VITE_DATABASE_ID_2}.collections.${import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2}.documents`,
      (response) => {
        const newMessage = response.payload;
        const event = response.events[0];

        if (event.includes("delete")) {
          // Handle message deletion
          const deletedMessageId = newMessage.$id;
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.$id !== deletedMessageId)
          );
        } else if (event.includes("create") || event.includes("update")) {
          // Handle message create or update
          if (
            (newMessage.senderName === user.name && newMessage.receiverName === username) ||
            (newMessage.senderName === username && newMessage.receiverName === user.name)
          ) {
            setMessages((prevMessages) => {
              const existingMessageIndex = prevMessages.findIndex(
                (msg) => msg.$id === newMessage.$id
              );

              if (existingMessageIndex !== -1) {
                // Message exists, update it
                const updatedMessages = [...prevMessages];
                updatedMessages[existingMessageIndex] = newMessage;
                return updatedMessages;
              } else {
                // Message doesn't exist, add it
                return [...prevMessages, newMessage];
              }
            });
          }
        }
      }
    );

    return () => unsubscribe();
  }
}, [user, username]);

  // New message submission
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
  
    try {
      if (editingMessageId) {
        // Update existing message
        await databases.updateDocument(
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
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
        setEditingMessageId(null);
      } else {
        // Create a new message
        const createdMessage = await databases.createDocument(
          import.meta.env.VITE_DATABASE_ID_2,
          import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
          ID.unique(),
          newMessage
        );
  
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.$id === createdMessage.$id);
          if (exists) return prev; // Prevent duplicates
          return [...prev, createdMessage];
        });
  
        // Play sound after message is sent
        const audio = new Audio(MessageSendPopSound);
        audio.play();
      }
  
      setMessageBody(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  
  
  
  useEffect(() => {
    console.log("All Messages", messages);
  })

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      // Delete the message from the database
      await databases.deleteDocument(
        import.meta.env.VITE_DATABASE_ID_2,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
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
        import.meta.env.VITE_DATABASE_ID_2,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
        ID.unique(),
        newMessage
      );
  
      // Add the message to the state
      setMessages((prev) => [...prev, createdMessage]);
      // Play sound after message is sent
      const audio = new Audio(MessageSendPopSound);
      audio.play();
    } catch (error) {
      console.error("Error sending 'Hello!' message:", error);
    }
  };
  
   //Image Upload Testing
   const ImageClick = () => {
    console.log("Image clicked");
    toast.success("Oops! Coming Soon");
  };

  const handleCameraClick = () => {
    console.log("Camera clicked");
    //alert("Allow Camera Permission to use Camera");
    openModal();
  }
  
   // Handle image selection
   const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
    setIsImageSelected(!!selectedImage); // Update the state based on selection
    setSuccess(null);
    setError(null);
  };
  
  const handleUpload = async (event) => {
    event.preventDefault();
  
    if (!image) {
      setError('Please select an image first.');
      return;
    }
  
    setUploading(true);
    setError(null);
  
    try {
      // Upload the file to the storage
      const response = await storage.createFile(
        '67625c290014521446c8', // Your BucketID
        ID.unique(),           // Unique file ID
        image                  // The file itself
      );
  
      const fileId = response.$id;
      const fileUrl = await storage.getFileView('67625c290014521446c8', fileId);
  
      // Save the file reference in the database
      await saveImageReference(fileId, fileUrl.href);
  
      // Update local state if unique
      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some((msg) => msg.imageUrl?.includes(fileUrl.href));
        if (!isDuplicate) {
          return [
            ...prevMessages,
            {
              senderName: user.name,
              receiverName: username,
              timestamp: new Date().toISOString(),
              imageUrl: [fileUrl.href],
              $id: ID.unique(),
            },
          ];
        }
        return prevMessages;
      });
  
      setUploading(false);
      setSuccess('Image uploaded successfully!');
      setIsImageSelected(false); // Reset state
    } catch (err) {
      setUploading(false);
      setError('Error uploading image: ' + err.message);
      console.error('Upload error:', err);
    }
  };
  
  

// Save or update file reference in the database
const saveImageReference = async (fileId, imageUrl) => {
  try {
    // Check if a message for the user already exists
    const existingDocument = messages.find((msg) => msg.senderId === user.id);

    if (existingDocument) {
      // Avoid duplicate image URLs
      const updatedImageUrls = existingDocument.imageUrl.includes(imageUrl)
        ? existingDocument.imageUrl
        : [...existingDocument.imageUrl, imageUrl];

      // Update the document with the new URLs
      await databases.updateDocument(
        import.meta.env.VITE_DATABASE_ID_2,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
        existingDocument.$id,
        { imageUrl: updatedImageUrls }
      );

      console.log('Updated image reference in existing document');
    } else {
      // Create a new document
      const newDocument = {
        senderName: user.name,
        receiverName: username,
        timestamp: new Date().toISOString(),
        isRead: false,
        imageUrl: [imageUrl],
        fileId: fileId,
      };

      await databases.createDocument(
        import.meta.env.VITE_DATABASE_ID_2,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
        ID.unique(),
        newDocument
      );

      console.log('Created new document with image reference');
    }
  } catch (err) {
    setError('Error saving image reference: ' + err.message);
    console.error('Error saving image reference:', err);
  }
};


// Fetch messages with images (useEffect)

  const fetchMessagesWithImages = async () => {
    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_DATABASE_ID_2,
        import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2
      );
  
      const uniqueMessages = [];
      const seenIds = new Set();
  
      // Filter duplicates by `$id`
      response.documents.forEach((message) => {
        if (!seenIds.has(message.$id)) {
          uniqueMessages.push({
            ...message,
            imageUrl: message.imageUrl || [],
          });
          seenIds.add(message.$id);
        }
      });
  
      setMessages(uniqueMessages);
      console.log('Fetched unique messages:', uniqueMessages);
    } catch (error) {
      console.error('Error fetching messages with images:', error);
    }
  };
  
  useEffect(() => {

  fetchMessagesWithImages();
}, []);

// Delete Image
// Function to download the image
const downloadImage = (imageUrl) => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = 'downloaded-image';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to clear the image (for the current user)
const clearImage = async (messageId) => {
  try {
    const updatedMessages = messages.map((msg) =>
      msg.$id === messageId ? { ...msg, imageUrl: [] } : msg
    );
    setMessages(updatedMessages);
    console.log(`Image cleared for message ID: ${messageId}`);
  } catch (error) {
    console.error('Error clearing image:', error);
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



const openImageModal = (url) => {
  setModalImage(url);
  ImageModalOpen(true);
};
const closeModalImage = () => {
  setModalImage("");
  ImageModalOpen(false);
};

// Chat Details Condition
const ChatInfo = () =>{
  setChatDetails((prev) => !prev);
}
useEffect(() => {
  const timer = setTimeout(() => setLoadingChatInfo(false), 1500); // Simulate 1.5 seconds delay
  return () => clearTimeout(timer);
}, [messages]);

// Function to handle user typing
const handleTyping = (e) => {
  setIsTyping(true);

  // Emit typing status to the database for the current user
  databases.updateDocument(
    import.meta.env.VITE_DATABASE_ID_2,
    import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
    user.$id, // User ID for current user
    { isTyping: true }
  );

  // Clear typing state after 2 seconds once typing stops
  setTimeout(() => {
    setIsTyping(false);

    // Update the typing status in the database
    databases.updateDocument(
      import.meta.env.VITE_DATABASE_ID_2,
      import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2,
      user.$id,
      { isTyping: false }
    );
  }, 2000); // Adjust delay if needed
};

useEffect(() => {
  const unsubscribe = client.subscribe(
    `databases.${import.meta.env.VITE_DATABASE_ID_2}.collections.${import.meta.env.VITE_COLLECTION_ID_PERSONAL_CHAT_2}.documents`,
    (response) => {
      const event = response.payload;

      // Check if the other user is typing
      if (event.senderName !== username && event.isTyping) {
        setOtherUserTyping(true);

        // Reset the "typing" indicator after 2 seconds of inactivity
        setTimeout(() => setOtherUserTyping(false), 2000);
      }
    }
  );

  return () => unsubscribe(); // Clean up on unmount
}, [username]);

// Translate Languauge
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


  return (
    <div className="chat-container flex flex-col h-screen w-screen bg-slate-200">
       <header
      className={`chat-header bg-[#001529] text-white p-4 flex items-center justify-between transition-all duration-300 ${
        chatDetails ? 'transform translate-y-0 h-40' : 'transform translate-yb-8 h-16'
      }`}
    >
      <div>
        <h3 className="text-lg lg:text-base font-semibold">Chat with {username}</h3> {/* Smaller text size for desktop */}
        <p
          className="lg:text-[13px] sm:text-[10px] text-blue-700 font-semibold cursor-pointer flex items-center gap-1"
          onClick={ChatInfo} // Use the updated ChatInfo function
        >
          {chatDetails ? (
            <>
              See Less <FaCaretUp /> {/* FaCaretUp icon */}
            </>
          ) : (
            <>
              See More <FaCaretDown /> {/* FaCaretDown icon */}
            </>
          )}
        </p>

        {chatDetails && (
          <div className="text-sm mt-2 text-gray-300">
            {/* Show Shared Images in a Horizontal Scrolling Row */}
            <div className="overflow-x-auto flex space-x-2 mt-2">
              {loadingChatInfo ? (
                <div className="text-center text-gray-500">Loading Images...</div> // Show loading text
              ) : (
                messages
                  .filter((message) => message.imageUrl && message.imageUrl.length > 0) // Only messages with images
                  .map((message, index) => (
                    message.imageUrl.map((url, imgIndex) => (
                      <div
                        key={`${index}-${imgIndex}`}
                        className="relative w-[40px] h-[40px] sm:w-[60px] sm:h-[60px]"
                        onClick={() => openDialog(url)}
                      >
                      <img
  src={url}
  alt={`Shared Image ${imgIndex + 1}`}
  className="object-cover w-full h-full rounded-md shadow-md cursor-pointer border-2 border-white hover:border-2 hover:border-[#f70776] "
  style={{
    boxShadow:
      'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset',
  }}
/>


                      </div>
                    ))
                  ))
              )}
            </div>
          </div>
        )}
      </div>

      <button onClick={handleLogout} className="text-white hover:text-gray-400 absolute top-5 right-5">
        <FaSignOutAlt size={20} />
      </button>
    </header>



      <div className=" flex-1 p-2 overflow-y-auto max-h-[74vh]">
        {loading ? (
          /* From Uiverse.io by adamgiebl */ 
<section className="dots-container1">
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
    const isImageMessage = message.imageUrl && message.imageUrl.length > 0;
    const isTextMessage = !isImageMessage;
    

    return (
      <div
        key={message.$id}
        className={`message flex ${isCurrentUser ? "justify-end" : "justify-start"} items-start`}
      >
        <div
          className={`message-box px-3 rounded-lg max-w-[60%]  ${
            isCurrentUser
              ? "bg-[#18b4e4] text-white self-end rounded-tr-none"
              : "bg-gray-100 text-black self-start rounded-tl-none"
          } relative`}
          style={{
            boxShadow:
              "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
          }}
        >
          {/* Message Time */}
          <span
            className={`message-time text-[10px] ${isCurrentUser ? "text-white" : "text-black"}`}
          >
            {new Date(message.$createdAt).toLocaleDateString()}
          </span>

          {/* Message Content */}
          <div className="message-content">
            <p className={`text-[12px] font-semibold ${isCurrentUser ? "text-black" : "text-blue-500"}`}>
              {isCurrentUser ? `${user?.name} (You)` : message.senderName}
            </p>
            {!isImageMessage && (
  <p className="py-1 text-[12px] sm:text-[12px] md:text-[14px] lg:text-[16px]">
    {message.PersonalMessage}
  </p>
)}


            {/* Display Image If Exists */}
            {isImageMessage && (
              <div className="image-container mt-2 relative">
                {message.imageUrl.map((url, index) => (
                  <div key={index} className="relative" onClick={() => openDialog(url)}>
                    {!isCurrentUser && !downloadedImages[url] && (
                      <div className="absolute cursor-pointer inset-0 flex items-center justify-center bg-black bg-opacity-50 text-cyan-400 text-lg font-mono rounded-lg z-50">
                        See Image
                      </div>
                    )}
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className={`message-image max-w-full max-h-60 rounded-lg cursor-pointer ${!isCurrentUser && !downloadedImages[url] ? "blur-sm" : "blur-none"}`}
                      style={{
                        boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          

          {/* Options for current user */}
          {isCurrentUser && (
            <div className="absolute top-1 right-1 text-white hover:text-black">
              {/* Edit, Delete, and Translate options */}
              <button onClick={() => toggleMenu(message.$id)} className="text-white hover:text-black">
                <FaEllipsisV size={12} />
              </button>

              {/* Menu Options */}
              {selectedMenu === message.$id && (
                <div className="absolute right-0 top-8 shadow-md bg-white rounded-lg p-4 z-30" style={{ minWidth: "120px" }}>
                  <button onClick={() => deleteMessage(message.$id)} className="block w-full text-xs text-red-500 hover:bg-red-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-red-600">
                    <FaTrash size={12} />
                    <span>Delete</span>
                  </button>

                  {/* Edit option only for text messages */}
                  {isTextMessage && (
                    <button onClick={() => editMessage(message.$id, message.PersonalMessage)} className="block w-full text-xs text-blue-500 hover:bg-blue-100 rounded-md flex items-center justify-center gap-1 py-1 px-2 hover:shadow-lg hover:border-b-2 border-blue-600">
                      <FaEdit size={12} />
                      <span>Edit</span>
                    </button>
                  )}

                  {/* Translate option */}
                  {isTextMessage && (
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
                  )}

                  {selectedLanguage && showOkButton && isTextMessage && (
                    <button
                      onClick={() => handleTranslateMessage(message.PersonalMessage, selectedLanguage)}
                      className="bg-blue-500 text-white px-4 w-full rounded-md mt-2 text-[12px]"
                    >
                      OK
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Options for other users */}
          {!isCurrentUser && isTextMessage && (
            <div className="absolute top-1 right-1">
              <button
                onClick={() => toggleMenu(message.$id)}
                className="text-gray-500 hover:text-black"
              >
                <FaEllipsisV size={11} />
              </button>

              {selectedMenu === message.$id && (
                <div className="absolute right-0 top-8 shadow-md bg-white rounded-lg p-4 z-30" style={{ minWidth: "120px" }}>
                  <select
                    onChange={(e) => {
                      handleLanguageSelect(e.target.value);
                      setShowOkButton(true);
                    }}
                    className="text-green-500 text-center text-sm"
                    value={selectedLanguage || ""}
                  >
                    <option value="" className="text-gray-400 text-sm">
                      Translate
                    </option>
                    <option value="Telugu" className="text-gray-400">
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

                  {selectedLanguage && showOkButton && (
                    <button
                      onClick={() => handleTranslateMessage(message.PersonalMessage, selectedLanguage)}
                      className="bg-blue-500 text-white px-4 w-full rounded-md mt-2 text-[12px]"
                    >
                      OK
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <Dialog open={dialogOpen}  className="dialog-background" >
              <DialogHeader className="text-2xl text-cyan-300 font-bold">
                {/*<p className="text-xl">✨ Image Shared by {dialogUsername} ✨</p>*/}
              </DialogHeader>
              <DialogBody className="flex justify-center items-center min-h-[65vh]">
              <div className="absolute top-2 right-2 text-xs text-cyan-500 font-semibold rounded-md z-10 p-2" style={{backgroundColor:'rgba(5, 9, 17, 0.39)'}}>
              <span>
                {new Date(message.timestamp).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}
              </span>,
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
                
              <div className="container3D  noselect">
            <div className="canvas">
              <div className="tracker tr-1"></div>
              <div className="tracker tr-2"></div>
              <div className="tracker tr-3"></div>
              <div className="tracker tr-4"></div>
              <div className="tracker tr-5"></div>
              <div className="tracker tr-6"></div>
              <div className="tracker tr-7"></div>
              <div className="tracker tr-8"></div>
              <div className="tracker tr-9"></div>
              <div id="card">
                
                <div className="card-content">
                  <div className="card-glare"></div>
                  <div className="cyber-lines">
                    <span></span><span></span><span></span><span></span>
                  </div>
                  
                  <img 
                    src={dialogImage} 
                    alt="Shared" 
                    className="w-full h-full object-center rounded-lg transform hover:scale-105 transition duration-300" 
                  />
                  <div className="subtitle bg-[#001529] py-1" style={{boxShadow:'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset'}}>
                    <span className='text-cyan-300'>Image Shared by</span>
                    <span className="highlight "> {message.senderName}</span>
                  </div>
                 
                  <div className="card-particles">
                    <span></span><span></span><span></span> <span></span><span></span
              ><span></span>
                  </div>
                  <div className="corner-elements">
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <div className="scan-line"></div>
                </div>
              </div>
            </div>
          </div>
          
          
              </DialogBody>
              <DialogFooter>
                <button onClick={closeDialog} className="bg-white text-red-600 px-4 py-1 rounded-lg font-semibold hover:bg-red-100" style={{ boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px' }}>Close</button>
                <button onClick={() => handleDownload(dialogImage)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ml-2" style={{ boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px' }}>
                  <FaDownload />
                </button>
              </DialogFooter>
            </Dialog>

          {/* Timestamp */}
          <small className={`text-[10px] ${isCurrentUser ? "text-white" : "text-black"}`}>
            {formatTime(new Date(message.timestamp))}
          </small>
          
        </div>
      </div>
    );
  })}
</div>

        

  )}
      </div>
      <form onSubmit={handleSubmit} className="message-input-form flex items-center gap-2 px-3 p-2 bg-[#001529] justify-center">
    <textarea
      type="text"
      value={messageBody}
      onFocus={() => setIsMessageFocused(true)}
      onBlur={() => setIsMessageFocused(false)}
      onChange={(e) => {setMessageBody(e.target.value); handleTyping(e)}}
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
    <div>
    {otherUserTyping && <p>Other user is typing...</p>}
  </div>
    {showPicker && (
      <div className="emoji-picker absolute bottom-16 right-4 z-50">
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </div>
    )}

    {/* Hidden File Input for Image Upload */}
    <input
      type="file"
      accept="image/*"
      id="image-upload"
      onChange={handleImageChange}
      className="hidden"
    />
    <label htmlFor="image-upload" className="cursor-pointer ">
      <FaImage size={18} className="text-white hover:text-[#5fc9f3]" />
    </label>

    {/* Conditionally Display Upload Button */}
    {isImageSelected && (
  <button
    onClick={handleUpload}
    disabled={uploading}
    className="text-white px-3 py-2 rounded flex items-center justify-center gap-2"
  >
    {uploading ? (
      <div className="loading-circle"></div> /* Spinner only when uploading */
    ) : (
      <FaUpload className="UploadMovement  py-1 rounded-sm" size={25} />
    )}
  </button>
)}



    <button
      type="submit"
      className="send-button bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center"
    >
      <FaLocationArrow size={18} />
    </button>
  </form>


     {/* Modal Section */}
     {isModalOpen && currentInfo && (
  <div
    className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2 bg-slate-900 bg-opacity-50 fixed inset-0 z-50"
    onClick={closeModal} // Close modal when clicking outside
  >
    <div
      className="bg-white w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 p-6 rounded-lg shadow-lg"
      onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
    >
      <div className="flex justify-center mb-4">
        <div
          className="w-32 h-32 flex items-center justify-center overflow-hidden rounded-md"
          style={{
            boxShadow: "rgb(32 100 204 / 70%) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
          }}
        >
          <img
            className="w-full h-full object-cover mb-3"
            src={currentInfo.ImgUrl}
            alt={currentInfo.title}
            aria-labelledby="modal-title"
          />
        </div>
      </div>
      <h2 id="modal-title" className="text-xl font-semibold mb-2 text-center">{currentInfo.title} Access</h2>
      <p className="mb-2 text-gray-600 text-center">{currentInfo.Para}</p>
      <div className="flex justify-center">
        <small className="text-red-500 text-xl mb-4 font-mono">Access Soon</small>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => alert(`${currentInfo.title} granted!`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Proceed
        </button>
      </div>
    </div>
  </div>
)}



      {/* Navigation buttons */}
      <div className="flex items-center lg:justify-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-1 bg-slate-900">
        {Info.map((info, index) => (
          <button
            key={index}
            onClick={() => openModal(info)}
            className={`cursor-pointer bg-white relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 ${
              index === 0
                ? "focus-visible:ring-[#FFB300] hover:text-[#41dce4]"
                : index === 1
                ? "focus-visible:ring-[#e46241] hover:text-[#e46241]"
                : index === 2
                ? "focus-visible:ring-[#42A5F5] hover:text-[#42A5F5]"
                : index === 3
                ? "focus-visible:ring-[#FB8C00] hover:text-[#FB8C00]"
                : index === 4
                ? "focus-visible:ring-[#AB47BC] hover:text-[#AB47BC]"
                : "focus-visible:ring-[#66BB6A] hover:text-[#66BB6A]"
            } h-9 px-3`}
          >
            {index === 0 && <FaCamera  className="text-[#41dce4]"  />}
            {index === 1 && <FaImage htmlFor="image-upload"  className="text-[#e46241] cursor-pointer" />}
            {index === 2 && <FaVideo className="text-[#42A5F5]" />}
            {index === 3 && <FaSearchLocation className="text-[#FB8C00]" />}
            {index === 4 && <FaFileAlt className="text-[#AB47BC]" />}
            {index === 5 && <FaDollarSign className="text-[#66BB6A]" />}
            {info.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestingPersonalChat;