import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'; 
import HandyManLogo from './HandymanLogo.js';
import LoginPage from './LoginPage.js';
import OTPVerificationPage from './OTPVerificationPage.js';
import ProfilePage from './ProfilePage.js';   
import UserIdLogin from './UserIdLogin.js';
import RaiseTicket from './RaiseTicket';
import Sidebar from './Sidebar'; 
import BookTechnician from './BookTechnician.js';
import ChatPage from './ChatPage.js';
import BookTechnicianPaymentPage from './BookTechnicianPaymentPage.js';
import BuyProduct from './BuyProduct.js';
import ApartmentRaiseTicket from './ApartmentRaiseTicket.js';
import AboutApartmentRaiseTicket from './AboutApartmentRaiseTicket.js';
import IconsOffersProducts from './IconsOffersProducts.js'; 
import Offers from './Offers.js';
import BuyProductPaymentPage from './BuyProductPaymentPage.js';
import BuyProductView from './BuyProductView';
import OffersBuyProductPage from './OffersBuyProductPage.js';
import ViewOffersBuyProductPage from './ViewOffersBuyProductPage.js';
import BuyProductOnlinePaymentPage from './BuyProductOnlinePaymentPage.js';
import BuyProductPaymentSuccess from './BuyProductPaymentSuccess.js';
import BookTechnicianOnlinePayment from './BookTechnicianOnlinePayment.js'
import BookTechnicianPaymentSuccess from './BookTechnicianPaymentSuccess.js';

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
            <Route path="/raiseTicket/:userType/:userId" element={<RaiseTicket />} />
            <Route path="/sidebar/:userType" element={<Sidebar />} />
            <Route path="/bookTechnician/:userType/:userId" element={<BookTechnician />} />
            <Route path="/chatPage/:userType/:userId" element={<ChatPage />} />
            <Route path="/bookTechnicianPaymentPage/:userType/:userId/:raiseTicketId" element={<BookTechnicianPaymentPage />} />
            <Route path="/buyProducts/:userType/:userId" element={<BuyProduct />} />
            <Route path='/buyProductPaymentPage/:userType/:userId/:buyProductId' element={<BuyProductPaymentPage />} />
             <Route path="/offersIcons/:userType/:userId" element={<IconsOffersProducts />} />
            <Route path="/offers/:userType/:userId" element={<Offers />} />
             <Route path="/apartmentRaiseTicket/:userType/:userId" element={<ApartmentRaiseTicket />} />
            <Route path="/aboutApartmentRaiseTicket/:userType/:userId" element={<AboutApartmentRaiseTicket />} />
            <Route path="/buyproduct-view/:userType/:userId/:id" element={<BuyProductView />} />
            <Route path="/offersBuyProduct/:userType/:userId/:id" element={<OffersBuyProductPage />} />
            <Route path="/viewOffersBuyProduct/:userType/:userId/:id" element={<ViewOffersBuyProductPage />} />
            <Route path="/buyProductOnlinePaymentPage/:id" element={<BuyProductOnlinePaymentPage />} />
            <Route path="/BuyProductPaymentSuccess" element={<BuyProductPaymentSuccess />} />
            <Route path="/bookTechnicianOnlinePayment/:id" element={<BookTechnicianOnlinePayment />} />
            <Route path="/BookTechnicianPaymentSuccess" element={<BookTechnicianPaymentSuccess />} />
            </Routes>
        </main>
      </div>
    </Router>
  ); 
}    

export default App; 
 