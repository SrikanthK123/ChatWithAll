/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { FaCog, FaBell, FaUser, FaTimes, FaPen } from "react-icons/fa";
import { useUser } from "../../UseContext";
import { Link, useNavigate } from "react-router-dom";
import { account, storage, databases,client } from "../../lib/appwrite";
import PropTypes from "prop-types";
import { ID, Permission, Role,Query } from "appwrite";
import toast from "react-hot-toast";


const Rightsidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 378,
    y: 0,
  });
  const [description, setDescription] = useState("Hey there! I am using Chat-app");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [userData, setUserData] = useState(null);
  const [images, setImages] = useState([]);
  const [showAllImages, setShowAllImages] = useState(false);


  const buttonRef = useRef(null);
  const { user,loginUser, logoutUser } = useUser();
  const navigate = useNavigate();
  const UserContext = createContext()
  const ProfileDetail = () => useContext(UserContext);

  const MediaImages = [
    {
      Medimage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGRpZ2l0YWwlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    },
    {
      Medimage: "https://img.freepik.com/free-photo/modern-stationary-collection-arrangement_23-2149309625.jpg?t=st=1734773138~exp=1734776738~hmac=e70012bdd6890a76732722601fb8c1446dccff8444fbab39685066600eb73478&w=1060",
    },
    {
      Medimage: "https://img.freepik.com/free-vector/reporter-interviewing-celebrities-successful-people_74855-6633.jpg?t=st=1734792490~exp=1734796090~hmac=38856a93738b6d19fe980077353a69b486a02939d70057873716fb1cbe89a10e&w=1380",
    },
    {
      Medimage: "https://img.freepik.com/free-photo/cascade-boat-clean-china-natural-rural_1417-1356.jpg?t=st=1734773059~exp=1734776659~hmac=625dc4debb78d29f39c7ca8cb428ba4c835c4f9f020c44e600ff62b7a63c72db&w=1060",
    },
  ];

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await account.get();
        if (currentUser) {
          setUserData(currentUser);

          // Fetch stored description and profile picture
          const storedDescription = localStorage.getItem(`description_${currentUser.$id}`);
          const profilePicture = currentUser.prefs?.profilePicture || null;

          if (storedDescription) setDescription(storedDescription);
          if (profilePicture) setUserData((prev) => ({ ...prev, profilePicture }));
        } else {
          console.log("User not logged in.");
          setUserData(null);
        }
      } catch (error) {
        console.error("User session fetch error:", error);
        setUserData(null);
      }
    };

    checkSession();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const onMouseDown = (e) => {
    setIsDragging(true);
    const offsetX = e.clientX - position.x;
    const offsetY = e.clientY - position.y;

    const onMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - offsetX,
          y: e.clientY - offsetY,
        });
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleDescriptionEdit = () => setIsEditingDescription(true);

  const saveDescription = () => {
    setIsEditingDescription(false);
    if (userData) {
      localStorage.setItem(`description_${userData.$id}`, description);
    }
  };

  const handleUploadClick = async () => {
    try {
      const currentUser = await account.get();
      if (!currentUser) {
        alert("User is not logged in. Please log in first.");
        return;
      }
  
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
  
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          alert("No file selected. Please try again.");
          return;
        }
  
        try {
          const bucketId = import.meta.env.VITE_SECOND_ACCOUNT_BUCKET_2;
  
          if (!bucketId) {
            throw new Error("Bucket ID is missing");
          }
  
          const uniqueFileId = ID.unique();
          const permissions = [
            Permission.read(Role.any()),
            Permission.update(Role.user(currentUser.$id)),
            Permission.delete(Role.user(currentUser.$id)),
          ];
  
          const response = await storage.createFile(bucketId, uniqueFileId, file, permissions, currentUser.$id, currentUser.name);
  
          const imageUrl = storage.getFileView(bucketId, uniqueFileId);
  
          // Update user data locally
          setUserData((prev) => ({ ...prev, profilePicture: imageUrl }));
  
          // Update user preferences with the new profile picture URL
          await account.updatePrefs({ profilePicture: imageUrl });
  
          // Create the full response object
          const fullResponse = {
            ...response,
            username: currentUser.name,
            userId: currentUser.$id,
            profilePicture: imageUrl,
          };
  
          // Update global context with fullResponse
          loginUser(fullResponse);
  
          toast.success("Profile picture updated successfully.");
  
          console.log("Full Response with User Info:", JSON.stringify(fullResponse, null, 2));
        } catch (error) {
          console.error("File upload failed:", error.message);
        }
      };
  
      fileInput.click();
    } catch (error) {
      console.error("User not authenticated:", error.message);
      alert("You must be logged in to upload files.");
    }
  };
  
  
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
// Function to fetch initial images
const fetchImages = async () => {
  try {
    const pageSize = 10;
    let allImages = [];
    let offset = 0;

    while (true) {
      const response = await databases.listDocuments(
        import.meta.env.VITE_DATABASE_ID_2, // Database ID
        import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2, // Collection ID
        [
          Query.limit(pageSize), // Limit number of images per request
          Query.offset(offset), // Set the offset for pagination
        ]
      );

      if (response.documents.length === 0) break; // Exit if no more images are found

      const fetchedImages = response.documents.flatMap(doc => doc.imageUrl || []);
      allImages = [...allImages, ...fetchedImages]; // Add to the existing list of images

      offset += pageSize; // Increase the offset for the next page
    }

    setImages(allImages); // Update state with all fetched images
  } catch (error) {
    console.error("Error fetching images:", error);
  }
};

// useEffect for fetching images initially and subscribing to real-time updates
useEffect(() => {
  fetchImages();

  const unsubscribe = client.subscribe(
    `databases.${import.meta.env.VITE_DATABASE_ID_2}.collections.${import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2}.documents`,
    (response) => {
      if (response.events.includes('databases.documents.create')) {
        // Handle new images created
        setImages((prevImages) => {
          const newImage = response.payload.imageUrl;
          return prevImages.some(image => image === newImage) ? prevImages : [...prevImages, newImage];
        });
      }

      if (response.events.includes('databases.documents.delete')) {
        // Handle image deletions
        const deletedImageUrl = response.payload.imageUrl;
        
        // Immediately remove the deleted image from the state to reflect it in UI
        setImages((prevImages) => prevImages.filter(image => image !== deletedImageUrl));
      }

      if (response.events.includes('databases.documents.update')) {
        // Handle image updates (e.g., changing the imageUrl)
        const updatedImageUrl = response.payload.imageUrl;
        setImages((prevImages) => prevImages.map(image => image === updatedImageUrl ? updatedImageUrl : image));
      }
    }
  );

  return () => unsubscribe(); // Cleanup the subscription when the component is unmounted
}, []); // Empty dependency array to run only once on mount

  
  

  return (
    <>
      <button
        onClick={toggleSidebar}
        onMouseDown={onMouseDown}
        className="fixed p-2 m-2 bg-[#368ddd] text-white rounded-full md:hidden z-50"
        aria-label="Toggle Sidebar"
        style={{
          right: `${position.x + 10}px`,
          top: `${position.y}px`,
          borderRadius: "50%",
          transition: "left 0.1s, top 0.1s",
        }}
        ref={buttonRef}
      >
        {isOpen ? <FaTimes size={20} /> : <FaUser size={20} />}
      </button>

      <div
        className={`fixed top-0 right-0 h-screen w-72 z-40 bg-slate-800 text-white shadow-lg transition-transform duration-300 ease-in-out overflow-y-auto transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col items-center justify-center p-4 mt-12 relative">
          <div className="relative group w-32 h-32">
            <img
              src={userData?.profilePicture || "https://img.freepik.com/free-vector/young-man-orange-hoodie_1308-175788.jpg?t=st=1735471549~exp=1735475149~hmac=e474627388c1219724fb217d7d9c9ae4391189a4b27ed65018ae352fb144fa39&w=360"}
              alt="Profile"
              className="rounded-full w-full h-full object-cover shadow-md"
              style={{boxShadow:'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px'}}
            />
            <button
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              onClick={handleUploadClick}
              aria-label="Upload Profile Picture"
            >
              <FaPen />
            </button>
          </div>
          <p 
  className="font-mono text-center text-[17px] text-[#0066ff] font-semibold mt-2 break-words flex-wrap"
  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
>
  {userData?.name  || "Loading..."} 
</p>

          <div className="flex items-center gap-2">
            {!isEditingDescription ? (
              <>
                <p className="font-sans text-center text-[13px] text-slate-400">
                  {description}
                </p>
                <button
                  className="text-slate-400 hover:text-white"
                  onClick={handleDescriptionEdit}
                  aria-label="Edit Description"
                >
                  <FaPen />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-700 text-white border-b border-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  className="text-slate-400 hover:text-white"
                  onClick={saveDescription}
                  aria-label="Save Description"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

{/* Shared Images Section */}
<div className="px-4 mt-4">
  <h2 className="text-lg font-semibold mb-2 text-cyan-300">Shared Images</h2>

  {/* Container for shared images with scroll */}
  <div
    className={`grid grid-cols-2 gap-2 transition-all duration-300 overflow-y-auto right-sidebar`}
    style={{
      maxHeight: showAllImages ? "auto" : "12rem", // Adjust height based on 'showAllImages'
    }}
  >
    {images.length > 0 ? (
      images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Shared ${index + 1}`}
          className="w-full h-24 object-cover rounded-lg shadow-md cursor-pointer"
        />
      ))
    ) : (
      <p className="text-[#f70776] text-center mt-4 font-semibold">No images</p>
    )}
  </div>
  

</div>
<ul className="space-y-3 pt-3">
            <SidebarItem label="Notifications" icon={<FaBell />} />
            <Link to="/Profile">
              <SidebarItem label="Profile" icon={<FaUser />} />
            </Link>
            {/*<SidebarItem label="Settings" icon={<FaCog />} />*/}
          </ul>


        <div className="absolute bottom-4 left-0 w-full flex justify-center">
          <button
            className="py-2 text-center bg-[#0066ff] text-white px-8 rounded-md"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

const SidebarItem = ({ label, icon }) => (
  <li className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 p-2 rounded-md">
    <span>{icon}</span>
    <span className="text-lg">{label}</span>
  </li>
);

SidebarItem.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};

export default Rightsidebar;
