import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'; 
import HandyManLogo from './HandymanLogo.js';

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
            </Routes>
        </main>
      </div>
    </Router>
  ); 
}    

export default App; 
 