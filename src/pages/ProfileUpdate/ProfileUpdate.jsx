/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import ProfileUpdateImage from '../../assets/Images/ProfileUpdateImage.png';

const ProfileUpdate = () => {
  const [profileImage, setProfileImage] = useState(
    "https://img.freepik.com/free-photo/portrait-man-cartoon-style_23-2151133977.jpg?t=st=1731683004~exp=1731686604~hmac=bf540d2539a09417a8cf7b442e279637892a5a461d58537d15119bdc65fe45b9&w=900"
  ); // Placeholder profile image

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result); // Update profile image
      };
      reader.readAsDataURL(file);
    }
  };
  const [image,setImage] = useState(false)

  return (
    <div className="bg-[#007DFE] w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={image ? URL.createObjectURL(image) : profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover shadow-md"
              />
              <label
                htmlFor="uploadImage"
                className="absolute bottom-2 right-1 hover:text-[#005ce6]  hover:bg-slate-300 p-1 rounded-md bg-[#005ce6] text-white cursor-pointer transition duration-150"
                title="Edit Image"
                style={{ fontSize: "15px" }}
              >
                ✎
              </label>
              <input
                id="uploadImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e)=>setImage(e.target.files[0])}
              />
            </div>
          </div>

          {/* Form */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Update Profile
          </h2>
          <div className="flex justify-center items-center">
            <form className="flex flex-col w-full max-w-sm space-y-4">
              <input
                type="text"
                className="bg-gray-100 text-gray-900 min-w-[300px] border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
                placeholder="Your Name"
              />
              <input
                type="email"
                className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
                placeholder="Email"
              />
              <input
                type="text"
                className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
                placeholder="Phone Number"
              />
              <textarea
                name="cover_letter"
                className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
                placeholder="Description...."
              ></textarea>

              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Image for larger screens */}
      <div className="hidden sm:block sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[650px]">
        <img src={ProfileUpdateImage} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default ProfileUpdate;
