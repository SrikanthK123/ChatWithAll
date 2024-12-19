/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { account, ID, storage } from '../../lib/appwrite';
import ProfileImage from '../../assets/Images/ProfileImage.png';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '../../UseContext';
import { Query } from 'appwrite';

const Login = () => {
  const { user, loginUser, logoutUser } = useUser(); // Access user context
  const [currState, setCurrState] = useState('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [avatar, setAvatar] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    console.log('VITE_PROJECT_ID', import.meta.env.VITE_PROJECT_ID);
    console.log('VITE_ENDPOINT', import.meta.env.VITE_ENDPOINT);
    console.log(import.meta.env);
  }, []);

  // Check if the email is already registered
  const checkIfUserExists = async (email) => {
    try {
      const response = await account.listUsers([Query.equal('email', email)]);
      return response.total > 0;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  };

  // Check if the username is already taken
  const checkIfUserNameExists = async (name) => {
    try {
      const response = await account.listUsers([Query.equal('name', name)]);
      return response.total > 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      // Ensure no active session exists before logging in
      await account.deleteSession('current').catch(() => {});

      // Attempt to create a session
      const session = await account.createEmailPasswordSession(email, password);

      // Get user info after session creation
      const user = await account.get();

      loginUser(user); // Update user context with logged-in user

      // Navigate to user chat page or home page
      navigate(`/chat?${user.$id}`);

      // Display a success message
      toast.success(`Welcome back, ${user.name}!`);

      // Clear input fields
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);

      if (error.message?.includes('Invalid credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error('An unexpected error occurred during login.');
      }
    }
  };

  // Register function
  const register = async (email, password, name) => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    const userExists = await checkIfUserExists(email);
    if (userExists) {
      toast.error('A user with this email already exists.');
      return;
    }

    const userNameExists = await checkIfUserNameExists(name);
    if (userNameExists) {
      toast.error('A user with this name already exists.');
      return;
    }

    try {
      // Ensure no active session exists before creating a new user
      await account.deleteSession('current').catch(() => {});

      // Create user account
      const user = await account.create(ID.unique(), email, password, name);

      // Log in the user immediately after registration
      const session = await account.createEmailPasswordSession(email, password);

      // Upload avatar if file is selected
      let avatarURL = '';
      if (avatar) {
        const file = await storage.createFile('unique()', avatar);
        avatarURL = storage.getFilePreview(file.$id);
      }

      // Save avatar URL to user preferences or database
      await account.updatePrefs({ avatar: avatarURL });

      toast.success('Account created successfully! You can now log in.');
      setCurrState('Login');
      setEmail('');
      setPassword('');
      setName('');
      setAvatar(null);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await account.deleteSession('current');
      logoutUser(); // Clear user context on logout
      toast.success('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out.');
    }
  };

  return (
    <div className="LoginPage flex items-center justify-end w-screen h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="form-box relative right-[15%]">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            currState === 'Sign Up'
              ? register(email, password, name)
              : login(email, password);
          }}
        >
          <span className="title">{currState}</span>
          <div className="flex justify-center">
            <img className="w-24 h-24" src={ProfileImage} alt="Profile" />
          </div>
          <div className="form-container">
            {currState === 'Sign Up' && (
              <input
                type="text"
                className="input"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              type="email"
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
            />
            {passwordError && <span className="text-red-500">{passwordError}</span>}
          </div>
          <button type="submit" className="btn">
            {currState === 'Sign Up' ? 'Create Account' : 'Login Here'}
          </button>
        </form>
        <div className="form-section">
          {currState === 'Sign Up' ? (
            <p>
              Have an account?{' '}
              <a href="#" onClick={() => setCurrState('Login')}>
                Log in
              </a>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={() => setCurrState('Sign Up')}>
                Sign Up
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
