import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'; 
import HandyManLogo from './HandymanLogo.js';
import LoginPage from './LoginPage.js';
import OTPVerificationPage from './OTPVerificationPage.js';
import ProfilePage from './ProfilePage.js';   
import UserIdLogin from './UserIdLogin.js';

const PreventBackNavigation = () => {

useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      window.location.reload(); 
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
};

function App() {
  return ( 
    <Router>   
       <PreventBackNavigation />   
      <div className="App"> 
        <main>
          <Routes>
            <Route path="/" element={<HandyManLogo />} /> 
            <Route path="/loginnew" element={<LoginPage />} />
            <Route path="/otpVerification" element={<OTPVerificationPage />} />
            <Route path="/profilePage/:userType/:userId" element={<ProfilePage />} />
            <Route path="/userIdLogin" element={<UserIdLogin />} />
            </Routes>
        </main>
      </div>
    </Router>
  ); 
}    

export default App; 
 