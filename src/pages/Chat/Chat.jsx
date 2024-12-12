/* eslint-disable no-unused-vars */
import React from 'react';
import { useUser } from '../../UseContext'; // Ensure you import the context
import Leftsidebar from '../../components/LeftSideBar/Leftsidebar';
import Chatbox from '../../components/ChatBox/Chatbox';
import Rightsidebar from '../../components/RightSideBar/Rightsidebar';
import IndividualChat from '../../components/ChatBox/IndividualChat';

const Chat = () => {
  const { user } = useUser(); // Destructure user from the context

  return (
    <div className="w-screen h-screen bg-[#005ce6]">
      <div className="flex h-full">
        {/* Left Sidebar */}
        <div className="md:w-64">
        <Leftsidebar />
        </div>

        {/* Chatbox */}
        <div className="flex-1 overflow-auto">
          {/*<Chatbox />*/}
          {<IndividualChat/>}
        </div>

        {/* Right Sidebar */}
        <div className="md:w-64">
          <Rightsidebar />
        </div> 
      </div>

      {/* User Info Display */}
      {/*{user && (
        <div className="user-info">
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      )}*/}
    </div>
  );
};

export default Chat;
