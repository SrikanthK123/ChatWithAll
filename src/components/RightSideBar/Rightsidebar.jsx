/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { FaCog, FaBell, FaUser, FaTimes, FaPen } from "react-icons/fa";
import { useUser } from "../../UseContext"; 
import { Link, useNavigate } from "react-router-dom"; 
import { account, storage } from "../../lib/appwrite";
import PropTypes from 'prop-types';

const Rightsidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 378,
    y: 0,
  });
  const [userData, setUserData] = useState(null);

  const buttonRef = useRef(null);

  const { user, logoutUser } = useUser();
  const navigate = useNavigate();

  const MediaImages = [
    {
      Medimage:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGRpZ2l0YWwlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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

  const handleLogout = async () => {
    try {
      await logoutUser(); // Log the user out
      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userData = await account.get();
          setUserData(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]); // Fetch user data when `user` changes

  const handleUploadClick = async () => {
    if (!user) {
      alert("User is not logged in or data is not loaded.");
      return;
    }
  
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
  
    fileInput.onchange = async (e) => {
      const file = e.target.files[0]; // Get the selected file
  
      // Debugging: Check if file is selected
      console.log("File selected:", file);
      if (!file) {
        console.error("No file selected");
        alert("No file selected. Please try again.");
        return;
      }
  
      try {
        // Debugging: Check the properties of the file object
        console.log("Uploading file:", file);
  
        // Ensure the bucket ID is correct
        const bucketId = "6745c7af000a499a05f5"; // Replace with your actual bucket ID
  
        // Upload the file
        const fileId = await storage.createFile(bucketId, file);
        
        // Debugging: Check file upload result
        console.log("File uploaded successfully", fileId);
      } catch (error) {
        console.error("File upload failed:", error);
        alert("File upload failed. Please try again.");
      }
    };
  
    fileInput.click(); // Trigger file input
  };
  

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
              src="https://img.freepik.com/free-photo/photo-handsome-unshaven-guy-looks-with-pleasant-expression-directly-camera_176532-8164.jpg?t=st=1731593422~exp=1731597022~hmac=659010eb8aa252af7acbd40a3197318652431ee610e73b75806921b04583cf81&w=1060"
              alt="Profile"
              className="rounded-full w-full h-full object-cover shadow-md"
            />
            <button
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              onClick={handleUploadClick}
              aria-label="Upload Profile Picture"
            >
              <FaPen />
            </button>
          </div>
          <p className="font-mono text-center text-xl text-[#0066ff] font-semibold mt-2">
            {userData?.name || "Loading..."}
          </p>
          <p className="font-sans text-center text-sm text-slate-400">
            Hey there! I am using Chat-app
          </p>
        </div>

        <div className="p-2">
          <h1>Media</h1>
          <hr className="my-1" />
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 py-2">
            {MediaImages.map((MItem, index) => (
              <img
                key={index}
                src={MItem.Medimage}
                className="w-24 h-14 object-cover rounded-md flex-shrink-0 cursor-pointer hover:opacity-50"
                alt="media"
              />
            ))}
          </div>

          <ul className="space-y-3 pt-3">
            <SidebarItem label="Notifications" icon={<FaBell />} />
            <Link to="/Profile">
              <SidebarItem label="Profile" icon={<FaUser />} />
            </Link>
            <SidebarItem label="Settings" icon={<FaCog />} />
          </ul>
        </div>

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

// SidebarItem component with PropTypes validation
const SidebarItem = ({ label, icon }) => (
  <li className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 p-2 rounded-md">
    <span>{icon}</span>
    <span className="text-lg">{label}</span>
  </li>
);

// PropTypes validation for SidebarItem
SidebarItem.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};

export default Rightsidebar;
