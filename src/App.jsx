/* eslint-disable no-unused-vars */
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Login from './pages/Login/Login';
import Chat from './pages/Chat/Chat';
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate';
import PrivateRoutes from './components/PrivateRoutes';
import PersonalChat from './components/ChatBox/PersonalChat';
import TestingPersonalChat from './components/ChatBox/TestingPersonalChat';
import { useUser } from './UseContext';
import FinalTest from './components/ChatBox/FinalTest';
import Leftsidebar from './components/LeftSideBar/Leftsidebar';
import BucketTest from './components/BucketTest';
import AIChat from './components/AIChat';
import ImageSent from './components/ChatBox/ImageSent';
import AITranslater from './components/AITranslater';
import NewsUpdates from './components/ChatBox/NewsUpdates';

function App() {
  const user = useUser();
  return (
    <Router>
      
      <Routes>
        
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<ProfileUpdate />} />
         {/* <Route path="/chat/:userId/:username" element={<PersonalChat user={user}/>} />*/}
          <Route path="/chat/:userId/:username" element={<TestingPersonalChat />} />
          {/*<Route path="/chat/:userId/:username" element={<FinalTest />} />*/}
        </Route>
        <Route path='/BucketTest' element={<BucketTest/>} />
        <Route path='/AiChat' element={<AIChat/>} />
        <Route path='/ImageSent' element={<ImageSent/>} />
        <Route path='/AITranslater' element={<AITranslater/>} />
        <Route path='/TechNews' element={<NewsUpdates/>} />
      </Routes>
    </Router>
  );
}

export default App;
