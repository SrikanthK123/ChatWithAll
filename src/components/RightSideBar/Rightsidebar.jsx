/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { FaCog, FaBell, FaUser, FaTimes, FaPen } from "react-icons/fa";
import { useUser } from "../../UseContext"; 
import { Link, useNavigate } from "react-router-dom"; 
import { account } from "../../lib/appwrite";
import PropTypes from "prop-types";

const Rightsidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 378,
    y: 0,
  });
  const [userData, setUserData] = useState(null);
  const [description, setDescription] = useState("Hey there! I am using Chat-app");
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const buttonRef = useRef(null);
  const { user, logoutUser } = useUser();
  const navigate = useNavigate();

 useEffect(() => {
    if (user) {
      // Load description from local storage
      const storedDescription = localStorage.getItem(`description_${user.$id}`);
      if (storedDescription) {
        setDescription(storedDescription); 
      } else {
        // Set default description in localStorage if not already set
        localStorage.setItem(`description_${user.$id}`, description); 
      }
    }
  }, [user]);
  

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

  const handleDescriptionEdit = () => {
    setIsEditingDescription(true);
  };

  const saveDescription = () => {
    setIsEditingDescription(false);
    localStorage.setItem(`description_${user.$id}`, description); 
  };
  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await logoutUser(); // Ensure this function is correctly implemented in your context
      console.log("Logout successful.");
      navigate("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const MediaImages = [
    {
      Medimage:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGRpZ2l0YWwlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    },
    {
      Medimage:
        "https://img.freepik.com/free-photo/cascade-boat-clean-china-natural-rural_1417-1356.jpg?t=st=1734773059~exp=1734776659~hmac=625dc4debb78d29f39c7ca8cb428ba4c835c4f9f020c44e600ff62b7a63c72db&w=1060",
    },
    {
      Medimage:
        "https://img.freepik.com/free-vector/group-young-people_23-2148454220.jpg?t=st=1734773098~exp=1734776698~hmac=8466aaf0cd7b87d8033656bda6382628fe66d7a6129bd9ef35bf3edf897ff301&w=1060",
    },
    {
      Medimage:
        "https://img.freepik.com/free-photo/modern-stationary-collection-arrangement_23-2149309625.jpg?t=st=1734773138~exp=1734776738~hmac=e70012bdd6890a76732722601fb8c1446dccff8444fbab39685066600eb73478&w=1060",
    },
  ];

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
              src="https://img.freepik.com/free-photo/photo-handsome-unshaven-guy-looks-with-pleasant-expression-directly-camera_176532-8164.jpg"
              alt="Profile"
              className="rounded-full w-full h-full object-cover shadow-md"
            />
          </div>
          <p className="font-mono text-center text-xl text-[#0066ff] font-semibold mt-2">
            {userData?.name || "Loading..."}
          </p>
          <div className="flex items-center gap-2">
            {!isEditingDescription ? (
              <>
                <p className="font-sans text-center text-sm text-slate-400">
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
        </div>

        <ul className="space-y-3 pt-3 pl-2">
          
          <Link to="/Profile">
            <SidebarItem label="Profile" icon={<FaUser />} />
          </Link>
          <SidebarItem label="Notifications" icon={<FaBell />} />
          <SidebarItem label="Settings" icon={<FaCog />} />
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
