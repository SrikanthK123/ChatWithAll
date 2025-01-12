/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GEMINI_API_KEY } from './SecretKeys';  // Assuming you store the API key here

const AITranslater = () => {
  // Initialize state for question and AI answer
  const [question, setQuestion] = useState("Translate 'Hello, how are you?' RRR movie Cast"); 
  const [aiAnswer, setAiAnswer] = useState(null);

  const generateAIAnswer = async () => {
    const API_KEY = GEMINI_API_KEY;  // Using API key from SecretKeys.js
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // The payload now uses the 'question' from the component state
    const payload = {
      contents: [{ parts: [{ text: question }] }]
    };

    try {
      const response = await axios.post(API_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Log the full response to inspect its structure
      console.log('API Response:', response.data);

      // Check the structure of the response and access the correct value
      if (
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0] &&
        response.data.candidates[0].content.parts[0].text
      ) {
        setAiAnswer(response.data.candidates[0].content.parts[0].text);
      } else {
        console.error('Unexpected response structure:', response.data);
        setAiAnswer('Could not get a valid answer from the AI.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
      setAiAnswer('Error occurred while fetching AI response.');
    }
  };

  // Trigger the API call on component mount
  useEffect(() => {
    generateAIAnswer();
  }, []);

  return (
    <div>
      <div>Check the console for the AI-generated answer.</div>
      <div>AI Answer: {aiAnswer}</div>  {/* Display the AI Answer */}
    </div>
  );
};

export default AITranslater;
