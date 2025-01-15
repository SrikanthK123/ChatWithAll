/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaTimes, FaUsers,FaEnvelope } from 'react-icons/fa';
import { account, databases } from '../../lib/appwrite';
import { AlluseUsers } from '../../hook/AllUserData';
import EmailIcon from "../../assets/Images/EmailIcon.png";
import toast from 'react-hot-toast';
import { useUser } from '../../UseContext';
import { LoginUsers } from '../../hook/LoginUsers';
import { Query } from 'appwrite';
import { Link, useNavigate } from 'react-router-dom';

const Leftsidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State to manage sidebar visibility
  const [isDragging, setIsDragging] = useState(false); // State to handle dragging status
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Position of the button
  const [user, setUser] = useState(null); // State to store user data
  const buttonRef = useRef(null); // Ref for the button element
  const { users, error } = AlluseUsers(); // Fetch all users
  const [userData, setUserData] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(""); // State to store search query



  const formatTimestamp = (isoString) => {
    if (!isoString) return "N/A"; // Handle undefined or null timestamps
    const date = new Date(isoString); // Parse the ISO string
    const options = {
      year: 'numeric',
      month: 'short', // e.g., "Jan"
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Optional: For 12-hour format with AM/PM
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Fetch authenticated user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await account.get();
        setUser(userData); // Store the user data
        console.log("Logged-in user:", userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserData();
  }, []);

  // Fetch additional user data (list of users)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await databases.listDocuments(
          import.meta.env.VITE_DATABASE_ID_2, // Database ID
          import.meta.env.VITE_COLLECTION_ID_GROUP_MESSAGE_2, // Collection ID
          [Query.orderDesc('$createdAt')]
        );
        setUserData(response.documents);
        console.log('Fetched user data Left:', response.documents);
      } catch (error) {
        console.error('Error fetching user documents:', error);
      }
    };

    fetchUserData();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    console.log(isOpen);
  };

  // Handle mouse down event to start dragging
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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleUserClick = (username, userId) => {
    navigate(`/chat/${userId}/${username}`);
  };
   // Handle search input change
   const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
   // Filter users based on the search query
   const filteredUsers = userData?.filter((userItem) =>
    userItem.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={toggleSidebar}
        onMouseDown={onMouseDown}
        className="fixed p-2 m-1 bg-slate-800 text-white rounded-full md:hidden z-50 "
        aria-label="Toggle Sidebar"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          borderRadius: '50%',
          transition: 'left 0.1s, top 0.1s', // smooth transition for dragging
        }}
        ref={buttonRef}
      >
        {isOpen ? <FaTimes size={20} /> : <FaUsers size={20} />}
      </button>

      {/* Sidebar */}
      <div
  className={`fixed top-0 left-0 h-screen w-64 z-40 bg-slate-800 text-white shadow-lg transition-transform duration-300 ease-in-out transform ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0`} // Always visible on larger screens
>
  <div className="flex items-center justify-between p-4 mt-12">
    <h3 className="text-lg flex items-center gap-2" style={{ fontFamily: 'monospace' }}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/8377/8377294.png"
        className="w-8 h-8"
        alt="Sidebar Icon"
      />
      Chit-Chat
    </h3>
  </div>

  <div className="p-2">
    {/* User Info Display */}
    {user ? (
      <div className="text-xs text-white flex p-1 pl-3 bg-[#303749a5] relative group cursor-pointer my-2">
      <FaEnvelope size={20} className="mt-2 text-[#0066ff]" />
      <span
        className="p-2 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap"
        style={{ maxWidth: "12rem", display: "block" }}
      >
        {user.email}
      </span>
      {/* Tooltip */}
      <div className="absolute hidden group-hover:flex bg-cyan-800 text-white text-xs rounded-md p-2 shadow-lg z-10">
        {user.email}
      </div>
    </div>
    
    
    ) : (
      <p className="text-white text-sm">Loading user...</p>
    )}

    {/* Search Bar */}
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
        value={searchQuery}
        onChange={handleSearchChange}
        list="userList" // Link input to datalist
      />
      <datalist id="userList">
        {filteredUsers?.map((userItem) => (
          <option key={userItem.$id} value={userItem.username} />
        ))}
      </datalist>
    </div>

    <h3 className="text-lg font-bold mt-2">Group Members</h3>
    <hr />
    <ul className="space-y-3 p-1 overflow-y-auto h-[calc(100vh-180px)] scrollbar-hidden pb-10 pt-2 "> {/* Added overflow-y-auto here */}
      {userData && userData.length > 0 ? (
        <>
          {/* Include current user */}
          {user && (
            <SidebarItem
              key={user.$id}
              userId={user.$id}
              label={`${user.name} (You)`}
              imageUrl="https://randomuser.me/api/portraits/lego/1.jpg" // Placeholder image for current user https://img.freepik.com/free-vector/robotic-artificial-intelligence-technology-smart-lerning-from-bigdata_1150-48136.jpg?t=st=1734702821~exp=1734706421~hmac=ae290813fa3cae9ca912cfa71ca3a1aee25d98e2c90250b4b6471aba132a3013&w=900
              style={{ backgroundColor:'#0066ff',color:'white' }} // Custom background color for current user https://img.freepik.com/free-vector/ai-technology-microchip-background-vector-digital-transformation-concept_53876-112222.jpg?t=st=1734702333~exp=1734705933~hmac=dba4e2f955532d862555b5f9887b5dad4229fd2e584da90474be3c3aabe46c53&w=740
              //activeUpdate="Online"
            />
          )}
           
         <Link to="/AiChat"> <p className='my-2 AIChat'> <SidebarItem 
             
              
             label={`Chat With AI`}
             imageUrl="https://thumbs.dreamstime.com/b/concept-man-interacting-ai-technology-future-305771501.jpg" // Placeholder image for current user Image ----> https://emiwebs.com/wp-content/uploads/AI-business-optimizatios.jpg 
             style={{ backgroundColor:'#0891b2 ',color:'white'}} // Custom background color for current user https://img.freepik.com/free-vector/ai-technology-robot-cyborg-illustrations_24640-134419.jpg?t=st=1734702399~exp=1734705999~hmac=3bc66e499d031a323aaa3b638938861b6052d8fd9287cb8edac28e0bab9cd6ec&w=740
             //activeUpdate="Online"
           /></p></Link>

          {/* Map through other users */}
          {/* Map through other users */}
{Array.from(new Map(userData.map((user) => [user.username, user]))).map(
  ([_, user]) => (
    <SidebarItem
      key={user.$id}
      userId={user.$id}
      label={user.username}
      personalMessage="Online"
      imageUrl={`https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 4)}.jpg`}
      onClick={() => handleUserClick(user.username, user.$id)}
      activeUpdate={formatTimestamp(user.$updatedAt)} // Use updatedAt here
    />
  )
)}

        </>
      ) : error ? (
        <p className="text-red-500">Failed to fetch users</p>
      ) : (
        <p className="text-gray-400">Loading users...</p>
      )}
    </ul>
  </div>
</div>

    </>
  );
};

// Reusable Sidebar Item Component with image and name
const SidebarItem = ({ label, imageUrl, personalMessage, userId, onClick,style,activeUpdate, }) => (
  <div
  className="flex items-center gap-3 hover:bg-slate-600 p-2 rounded-md transition-all cursor-pointer"
  onClick={onClick}
  style={style}
>
  <img src={imageUrl} alt={label} className="w-10 h-10 rounded-full" />
  <div className="flex flex-col">
    <p className="font-medium text-sm text-white">{label}</p>
    <p className="text-xs text-gray-400">
    {personalMessage || "Online"} {/*{activeUpdate ? activeUpdate : "Offline"}*/}
    </p>
  </div>
  {userId && onClick && (
    <button className="ml-auto text-blue-400 text-xs">
      Chat
    </button>
  )}
</div>
);

export default Leftsidebar; 