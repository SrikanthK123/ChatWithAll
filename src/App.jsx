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
      </Routes>
    </Router>
  );
}

export default App;
