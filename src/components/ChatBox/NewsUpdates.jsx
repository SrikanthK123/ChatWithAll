/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBackward, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { useUser } from "../../UseContext";
import { useNavigate } from "react-router-dom";
import { account } from "../../lib/appwrite";

const NewsUpdates = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [news, setNews] = useState([]);

  const BackToChat = () => {
    if (userData) {
      navigate(`/chat?${userData.$id}`);
    }
  };

  useEffect(() => {
    fetch("https://saurav.tech/NewsAPI/top-headlines/category/technology/in.json")
      .then((response) => response.json())
      .then((data) => {
        if (data.articles.length > 5) {
          const shuffled = data.articles.sort(() => 0.5 - Math.random());
          setNews(shuffled.slice(0, 5));
        } else {
          setNews(data.articles);
        }
      })
      .catch((error) => console.error("Error fetching news:", error));
  }, []);

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

  const removeNews = (index) => {
    setNews((prevNews) => prevNews.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full min-h-screen bg-cyan-700 flex flex-col items-center p-4 relative">
      <button onClick={BackToChat} className="absolute top-4 left-4 text-white flex items-center">
        <FaBackward size={24} className="mr-2" />
      </button>

      <h1 className="text-white text-2xl font-semibold mb-4">Tech Updates</h1>

      <div className="w-full max-w-md">
        <AnimatePresence>
          {news.length > 0 ? (
            news.map((article, index) => (
              <motion.div
                key={index}
                className="modern-success-message relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }} // Slide the card 300px to the right when removed
                layout
              >
                {/* Close Button */}
                <button
                  className="absolute top-2 right-3 text-white text-xl opacity-75 hover:opacity-100 transition-opacity z-10"
                  onClick={() => removeNews(index)} // Trigger removeNews on click
                >
                  <FaTimes size={20} />
                </button>

                {/* News Content */}
                <div className="icon-wrapper">
                  <img
                    src={article.urlToImage || "https://img.freepik.com/free-vector/flat-design-image-upload-landing-page_23-2148271993.jpg"}
                    alt={article.title}
                    className="w-[50px] h-[50px] object-cover rounded-md"
                  />
                </div>

                <div className="text-wrapper">
                  <p
                    target="_blank"
                    rel="noopener noreferrer"
                    className="title text-cyan-100 font-semibold block text-[14px] leading-tight overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    {article.title.length > 80 ? `${article.title.slice(0, 80)}...` : article.title}
                  </p>
                  <h3 className="text-cyan-500">{article.source.name}</h3>
                  <p className="message text-gray-200 text-sm mt-1">
                    {article.description ? `${article.description.slice(0, 100)}...` : "No description available 😖😞"}
                  </p>

                  {/* Visit Page Button */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-black bg-cyan-400 hover:bg-cyan-500 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg"
                  >
                    Visit Page <FaExternalLinkAlt className="ml-2" />
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex justify-center items-center flex-col space-y-6 p-6 bg-gradient-to-r from-[#001529] via-[#223952] to-[#020406] rounded-lg shadow-xl">
              <div className="flex justify-center items-center space-x-4 mt-10 mb-6">
                <img
                  src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-536.jpg"
                  alt="Placeholder"
                  className="w-72 h-72 sm:w-96 sm:h-96 object-cover rounded-md shadow-2xl"
                />
              </div>
              <p className="text-xl text-white font-semibold">
                🚨 Dear<span className="text-blue-400"> {userData?.name},</span> no updates available right now. 😔
              </p>
              <p className="text-lg text-white mt-2">Stay tuned! More news is on its way! 🚀✨</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewsUpdates;
