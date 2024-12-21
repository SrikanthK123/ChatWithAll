/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { FaCog, FaBell, FaUser, FaTimes, FaPen } from "react-icons/fa";
import { useUser } from "../UseContext";
import { Link, useNavigate } from "react-router-dom"; 
import PropTypes from "prop-types";

const Rightsidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 378,
    y: 0,
  });
  const [description, setDescription] = useState("Hey there! I am using Chat-app");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [originalDescription, setOriginalDescription] = useState(description);

  const buttonRef = useRef(null);
  const { user, logoutUser } = useUser();
  const navigate = useNavigate();

  // Load description from localStorage on mount
  useEffect(() => {
    if (user) {
      const storedDescription = localStorage.getItem(`description_${user.$id}`);
      if (storedDescription) {
        setDescription(storedDescription);
        setOriginalDescription(storedDescription);
      } else {
        localStorage.setItem(`description_${user.$id}`, description); // Store default if none exists
      }
    }
  }, [user]);

  // Save the description when changed
  useEffect(() => {
    if (user) {
      localStorage.setItem(`description_${user.$id}`, description);
    }
  }, [description, user]);

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
    setOriginalDescription(description); // Save the original description to revert if canceled
    setIsEditingDescription(true);
  };

  const saveDescription = () => {
    setIsEditingDescription(false);
  };

  const cancelDescriptionEdit = () => {
    setDescription(originalDescription); // Revert to the original description
    setIsEditingDescription(false);
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
            {user?.name || "Loading..."}
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
                <button
                  className="text-slate-400 hover:text-white"
                  onClick={cancelDescriptionEdit}
                  aria-label="Cancel Description Edit"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
        </div>
       
        

        <ul className="space-y-3 pt-3">
          <SidebarItem label="Notifications" icon={<FaBell />} />
          <Link to="/Profile">
            <SidebarItem label="Profile" icon={<FaUser />} />
          </Link>
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
