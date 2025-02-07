/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBackward } from "react-icons/fa";
import { useUser } from "../../UseContext";
import { useNavigate } from "react-router-dom";
import { account } from "../../lib/appwrite";

const NewsUpdates = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser(); // Access user context
  const [news, setNews] = useState([]);

  console.log("News Pages", user);

  const BackToChat = () => {
    // Ensure userData is available before navigating
    if (userData) {
      navigate(`/chat?${userData.$id}`);
      console.log("Navigating to Chat page with user ID:", userData.$id);
    } else {
      console.log("User data is not yet available");
    }
  };

  useEffect(() => {
    // Fetch top 5 tech news
    fetch("https://saurav.tech/NewsAPI/top-headlines/category/technology/in.json")
      .then((response) => response.json())
      .then((data) => setNews(data.articles.slice(0, 5))) // Get top 5 articles
      .catch((error) => console.error("Error fetching news:", error));
  }, []);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const userData = await account.get();
        setUserData(userData);
        console.log("Fetched user data:", userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const removeNews = (index) => {
    setNews((prevNews) => prevNews.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full min-h-screen bg-cyan-700 flex flex-col items-center p-4 relative">
      {/* Back Button */}
      <button onClick={BackToChat} className="absolute top-4 left-4 text-white flex items-center">
        <FaBackward size={24} className="mr-2" />
        <span className="text-lg font-semibold"></span>
      </button>

      <h1 className="text-black text-2xl font-semibold mb-4">Tech Updates</h1>
      <div className="w-full max-w-md">
        <AnimatePresence>
          {news.length > 0 ? (
            news.map((article, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-lg p-4 mb-4 flex items-start space-x-4 h-[200px] overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 200 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(event, info) => {
                  if (info.offset.x > 100) removeNews(index);
                }}
              >
                <img
                  src={article.urlToImage || "https://via.placeholder.com/150"}
                  alt={article.title}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold block text-[14px] leading-tight"
                  >
                    {article.title.length > 80 ? `${article.title.slice(0, 80)}...` : article.title}
                  </a>
                  <p className="text-gray-700 text-sm mt-1">
                    {article.description ? `${article.description.slice(0, 100)}...` : "No description available"}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex justify-center items-center flex-col space-y-6 p-6 bg-gradient-to-r from-[#4177b5] via-[#5693d9] to-[#4177b5] rounded-lg shadow-xl">
            <div className="flex justify-center items-center space-x-4 mt-10 mb-6">
              <img
                src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-536.jpg?t=st=1738937400~exp=1738941000~hmac=9270b21d2d819e0ac76a788ddbb8558a842b9e6fa6ed3d06e6580cab99bc4942&w=740"
                alt="Placeholder"
                className="w-72 h-72 sm:w-96 sm:h-96 object-cover rounded-md shadow-2xl"
              />
            </div>
          
            <p className="text-xl text-white font-semibold">
              🚨 <span className="text-yellow-400">Dear {userData?.name},</span> unfortunately, there are no updates available at the moment. 😔
            </p>
          
            <p className="text-lg text-white mt-4">
              Stay tuned! More news is on its way! 🚀✨
            </p>
          </div>
          

          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewsUpdates;
