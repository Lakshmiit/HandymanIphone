import React, { useState, useEffect, useCallback} from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'; 
import { v4 as uuidv4 } from 'uuid'; 
import axios from 'axios';
import { Dashboard as MoreVertIcon } from '@mui/icons-material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Header from './Header.js';
import Footer from './Footer.js';
import Sidebar from './Sidebar';
import {  useParams} from 'react-router-dom';
const AddressManager = () => { 
//   const navigate = useNavigate();
  const {selectedUserType} = useParams();
  const {userType} = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { userId } = useParams(); 
 const [addresses, setAddresses] = useState([]);
 const [ticketId, setTicketId] = useState('');
 const [newAddress, setNewAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [requestType, setRequestType] = useState('');
  const [loading, setLoading] = useState(false); 
  const [showAlert, setShowAlert] = useState(false);
  const [ticketPhotos, setTicketPhotos] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [specifications] = useState([{ material : "", Quantity : "" }]);
  const [showModal, setShowModal] = useState(false);
  const [commentsList] = useState([{updatedDate: new Date(), commentText: ""}]);
  const [formData, setFormData] = useState({
    subject: '',
    details: '',
    category: '',
  });
  const [response, setResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
const [mobileNumber, setMobileNumber] = useState('');
  const [state, setState] = useState('');
  const [districtList, setDistrictList] = useState([]);  
const [stateList, setStateList] = useState([]);
  const [district, setDistrict] = useState('');  
  const [districtId, setDistrictId] = useState('');    
  const [stateId, setStateId] = useState(null);          
  const [zipCode, setZipCode] = useState('');
  const [guestCustomerId, setGuestCustomerId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
const [addressData, setAddressData] = useState({
fullName  : '',
mobileNumber: '',
address: '',
zipCode: '',
state: '',
district: '',
});
// const [selectedFiles, setSelectedFiles] = useState([]);
const [shouldBlink,setShouldBlink] = useState(false);
const [serviceUnavailable, setServiceUnavailable] = useState(false);

  useEffect(() => {
    console.log(ticketId, response, editingAddressId);
  }, [ticketId, response, editingAddressId]);

  // const API_URL = 'https://handymanapiv2.azurewebsites.net/api/Address/GetAddressById/';
  // Fetch customer profile data
    const fetchCustomerData = useCallback(async () => {
      try {
        const response = await fetch(`https://handymanapiv2.azurewebsites.net/api/Address/GetAddressById/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer profile data');
        } 
        const data = await response.json();
        console.log(data);
        const addresses = Array.isArray(data) ? data : [data];
        const formattedAddresses = addresses.map((addr) => ({
          id: addr.addressId, 
          type: addr.isPrimaryAddress ? 'primary' : 'secondary',
          address: addr.address,
          state: addr.state,
          district: addr.district,
          zipCode: addr.zipCode, 
          emailAddress: addr.emailAddress,
          mobileNumber: addr.mobileNumber,
          fullName: addr.fullName,
        }));

        console.log("address1", addresses);
        setAddresses(formattedAddresses);
        const customerName = Array.isArray(data) ? data[0]?.fullName || '' : data.fullName || '';
        setFullName(customerName);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
  }, [userId]);
  
  useEffect(() => {
  const primary = addresses.find(addr => addr.type === "primary");
  const district = primary?.district?.toLowerCase();

  if (district && district !== "visakhapatnam") {
    setServiceUnavailable(true);  
  } else {
    setServiceUnavailable(false);
  }
}, [addresses]);



useEffect(() => {
  fetchCustomerData();
}, [fetchCustomerData]);

useEffect(() => {
  axios.get('https://handymanapiv2.azurewebsites.net/api/MasterData/getStates')
    .then(response => {
      const data = response.data;
      console.log("States API Response:", data); 
      setStateList(data);
      setStateId('');
    })
    .catch(error => {
      console.error('Error fetching states:', error);
    });
}, []);

 
 useEffect(() => {
  if (stateId) {
    axios.get(`https://handymanapiv2.azurewebsites.net/api/MasterData/getDistricts/${stateId}`)
      .then(response => {
        setDistrictList(response.data);
      })
      .catch(error => {
        console.error('Error fetching districts:', error);
      });
  } else {
    setDistrictList([]);
  }
}, [stateId]);

// Detect screen size for responsiveness
useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  handleResize(); 
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);

  // const states = ['Andhra Pradesh', 'Telangana'];
  // const districts = {
  //   'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur'],
  //   'Telangana': ['Hyderabad', 'Warangal', 'Khammam'],
  // };

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {

    const files = Array.from(e.target.files);
    const validFiles = [];
    for (const file of files) {
      // const fileSizeMB = file.size / (1024 * 1024);
      const isValidType = file.type === "image/jpeg" || file.type === "image/png";
      // const isValidSize = fileSizeMB <= 100; 
  
      if (!isValidType) {
        alert(`Only JPG and PNG formats are allowed: ${file.name}`);
        continue;
      }
  
      validFiles.push(file);
    }
  
    if (validFiles.length + ticketPhotos.length > 5) {
      alert("You can upload up to 5 files.");
      return;
    }
  
    setTicketPhotos([...ticketPhotos, ...validFiles]);
    setShowAlert(validFiles.length > 0);
    // setSelectedFiles(Array.from(e.target.files));
  };
  
  const handleUploadFiles = async () => {
    setLoading(true);
    setShowAlert(false);
    
    const uploadedFilesList=[];
    for (let i = 0; i < ticketPhotos.length; i++) {
      const file = ticketPhotos[i];
      const fileName = file.name;
      const mimetype = file.type;
      const byteArray = await getFileByteArray(file);
      const response = await uploadFile(byteArray, fileName, mimetype, file);
      if (response) {
        uploadedFilesList.push({
          src: response,
          alt: fileName
        });
      } else {
        alert("Failed Upload Image");
      }
    }
    setUploadedFiles(uploadedFilesList);
    setLoading(false);
  };

  // Convert the file to a byte array
  const getFileByteArray = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const byteArray = new Uint8Array(reader.result);
        resolve(byteArray);
      };
      reader.readAsArrayBuffer(file);
    });
  };
  const phoneNumber = '7989328864';  // Phone number
  // Generate ticket ID in the format VSKPAKP002
  // const ticketIdPrefix = "VSKPAPREFV";
  // const ticketIdSuffix = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  // const ticketIds = `${ticketIdPrefix}${ticketIdSuffix}`;

  // Generate WhatsApp link with the ticket ID
//   const generateWhatsAppLink = (ticketId, phoneNumber) => {
//     const message = `Hello, I'd like to continue uploading my video for ticket: ${ticketId}`;
//  var url =`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
//     // alert(url);
//     //console.log(url);

//     return url;
//   };

  // const handleWhatsAppClick = () => {
  //   // handleSaveWhatsapp();
  //   const link = generateWhatsAppLink(ticketIds, phoneNumber);
  //   window.open(link, '_blank');
  // };
  const uploadFile = async (byteArray, fileName, mimeType, file) => {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([byteArray], { type: mimeType }), fileName);
      formData.append('fileName', fileName);

      const response = await fetch('https://handymanapiv2.azurewebsites.net/api/FileUpload/upload?filename=' + fileName, {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
        },
        body: formData,
      });

      const responseData = await response.text();
      return responseData || ''; 
    } catch (error) {
      console.error('Error uploading file:', error);
      return '';
    }
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
  
    if (
      !formData.subject ||
      !formData.details ||
      !formData.category ||
      // !assignedTo ||
      !requestType 
    ) {
      window.alert('Please fill in all mandatory fields.');
      return;
    }
  
    if (isSubmitting) return;
    setIsSubmitting(true);

    const primaryAddress = addresses.find((addr) => addr.type === "primary");
    const state = primaryAddress?.state || "";
    const district = primaryAddress?.district || "";
    const pincode = primaryAddress?.zipCode || primaryAddress?.pincode || "";
    // const emailAddress = primaryAddress?.emailAddress || primaryAddress?.emailAddress || "";
    const mobileNumber = primaryAddress?.mobileNumber || primaryAddress?.mobileNumber || "";

    const payload = {
      RaiseTicketId:"string",
      date: new Date(),
      address: addressData.address || primaryAddress?.address || "",
      subject: formData.subject,
      details: formData.details,
      category: formData.category,
      assignedTo: "Customer Care",
      state: addressData.state || state,
      district: addressData.district || district,
      zipcode: addressData.zipCode || pincode,
      requestType: requestType,
      status:'open',
      internalStatus:'Open',
      SupportTicketId: uuidv4(),
      id: uuidv4(),
      customerId: userId, 
      attachments: uploadedFiles.map((file) => file.src), 
      comments: commentsList.map((comment) => ({
        UpdatedDate : comment.updatedDate,
        CommentText: comment.commentText,
    })),
      Materials:specifications.map(spec => ({
        material : spec.material,
        Quantity : spec.Quantity ,
      })),
      LowestBidderTechnicainId: "",
      LowestBidderDealerId: "",
      ApprovedAmount: "",
      CustomerName: addressData.fullName || fullName, 
      CustomerEmail: "",
      Option1Day: "",
      Option1Time: "",
      Option2Day: "",
      Option2Time: "",
      TechnicianList: [],
      DealerList: [],
      Rating: "",
      RateQuotedBy: "",
      OrderId: "",
      OrderDate: "",
      PaidAmount: "",
      TransactionStatus: "",
      TransactionType: "",
      InvoiceId: "",
      InvoiceURL: "", 
      CustomerPhoneNumber: addressData.mobileNumber || mobileNumber,
      PaymentMode: "",
      UTRTransactionNumber: "",
    };

  try {
    const response = await fetch('https://handymanapiv2.azurewebsites.net/api/RaiseTicket/CreateRaiseTicket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      throw new Error('Failed to create a ticket.');
    } 
  
    const data = await response.json(); 
    setTicketId(data.ticketId); 
    // Show alert message with the correct ticketId
    window.alert(`Ticket has been submitted successfully! Your reference number is ${data.ticketId}. Get Quote will contact you shortly.`);
    const whatsappapiurl = `https://app-server.wati.io/api/v1/sendSessionMessage/918498892222?messageText=Dear Customer Care a New Ticket Requested by Customer ${data.ticketId}`;
        const headers = {
          'accept': '/',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYjI0Y2E3Yi03MjA5LTQ4Y2QtYjY0Yi04NzkyMmY0ZmI4N2EiLCJ1bmlxdWVfbmFtZSI6ImxzY29tcHV0ZXJjb2FjaGluZ2NlbnRlckBnbWFpbC5jb20iLCJuYW1laWQiOiJsc2NvbXB1dGVyY29hY2hpbmdjZW50ZXJAZ21haWwuY29tIiwiZW1haWwiOiJsc2NvbXB1dGVyY29hY2hpbmdjZW50ZXJAZ21haWwuY29tIiwiYXV0aF90aW1lIjoiMDMvMjYvMjAyNSAwNjoxODowNiIsInRlbmFudF9pZCI6IjQyMjg5NCIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.KmlDJ4K30RfxiEfMGJFmGj6w0iRtzariun0oD04JWlY',
        };
        try {
          const res = await fetch(whatsappapiurl, {
            method: 'POST',
            headers: headers,
          });
          const data = await res.json();
          setResponse(data);
        } catch (error) { 
          console.error('Error sending message:', error);
        }
      window.location.href = `/profilePage/${userType}/${userId}`;
  
  } catch (error) {
    console.error('Error:', error);
    window.alert('Failed to create the ticket. Please try again later.');
    setIsSubmitting(false);
  }
  };

//   const handleSendSMSCustomerCare = async (e) => {
//    e.preventDefault();
  
//   try { 
//     const response = await fetch(``, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     if (!response.ok) {
//       throw new Error('Failed to send SMS to Customer Care');
//     }   
//     alert('SMS to Customer Care sent Successfully!');

//     window.location.href = `/profilePage/${userType}/${userId}`;

//   } catch (error) {
//     console.error('Error sending SMS to Customer Care:', error);
//     window.alert('Failed to sending SMS to Customer Care. Please try again later.');
//   }
// };
  // const handleBothActions =  (e) => {
  //   e.preventDefault();
  //   handleSaveTicket(e);
  //   handleSendSMSCustomerCare(e);
  // };
  
  // const handleSaveWhatsapp = async (e) => {
  //   e.preventDefault();
  
  //   const payload = {
  //     RaiseTicketId:"string",
  //     raiseTicketIdVideoRef: "string",
  //     date: new Date(),
  //     address: addresses.find((addr) => addr.type === 'primary')?.address || '',
  //     subject: formData.subject,
  //     details: formData.details,
  //     category: formData.category,
  //     assignedTo: assignedTo,
  //     state:state,
  //     district:district,
  //     zipcode:pincode,
  //     requestType: requestType,
  //     status:'open',
  //     internalStatus:'Open',
  //     id: uuidv4(),// Unique identifier for the API call
  //     customerId: customerId, // Replace with actual customer ID logic
  //     attachments: uploadedFiles.map((file) => file.src), 
  //     comments: commentsList.map((comment) => ({
  //       UpdatedDate : comment.updatedDate,
  //       CommentText: comment.commentText,
  //   })),
  //     Materials:specifications.map(spec => ({
  //       material : spec.material,
  //       Quantity : spec.Quantity ,
  //     })),
  //     LowestBidderTechnicainId: "",
  //     LowestBidderDealerId: "",
  //     ApprovedAmount: "",
  //     CustomerName: fullName, 
  //     Option1Day: "",
  //     Option1Time: "",
  //     Option2Day: "",
  //     Option2Time: "",
  //     TechnicianList: [],
  //     DealerList: [],
  //     Rating: "",
  //     isMaterialType: 0,
  //   };

  // try {
  //   const response = await fetch('https://handymanapiv2.azurewebsites.net/api/RaiseTicketExtention/CreateRaiseTicketExtension', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(payload),
  //   });
  
  //   if (!response.ok) {
  //     throw new Error('Failed to create a ticket.');
  //   }
  //   // const videoData = await response.json();
  //   // setVideoRefId(videoData.videoRefId);
  //   // alert(videoRefId);

  // } catch (error) {
  //   console.error('Error:', error);
  //   window.alert('Failed to create the ticket. Please try again later.');
  // }
  // };
  // Handle secondary address selection
  // const handleSecondaryAddressSelect = (id) => {
  //   const updatedAddresses = addresses.map((address) =>
  //     address.id === id
  //       ? { ...address, type: 'primary' }
  //       : address.type === 'primary'
  //       ? { ...address, type: 'secondary' }
  //       : address
  //   );
  //   setAddresses(updatedAddresses);
  //   setShowSecondaryAddresses(false); // Collapse secondary addresses view
  // };

  // // Handle address deletion
  // const handleAddressDelete = (id) => {
  //   const updatedAddresses = addresses.filter((address) => address.id !== id);
  //   setAddresses(updatedAddresses);
  // };

// const handleSaveAddress = () => {
//     if (
//       !fullName?.trim() ||
//       !mobileNumber?.trim() ||
//       !newAddress?.trim() ||
//       !zipCode?.trim()
//     ) {
//       alert('Please fill in all the fields.');
//       return;
//     }

//   setAddressData({
//     fullName  ,
//   mobileNumber,
//   address: newAddress,
//   zipCode,
// });

//     if (isEditing) {
//       setNewAddress(newAddress);
//       setFullName(fullName);
//       setMobileNumber(mobileNumber);
//       setZipCode(zipCode);
//       setIsEditing(null); 
//       setShowModal(false); 
//       resetAddressForm(); 
//     }
//      else {
//         if (addresses.length >= 1) {
//           alert('You can only add up to 1 address.');
//           return;
//         }
   
//       const newAddr = {
//         id: uuidv4(),
//         fullName,
//         mobileNumber,
//         address: newAddress,
//         zipCode, 
//       };
    
//       setAddresses(prev => [...prev, newAddr]);
//   }    
//       resetAddressForm();
//       setIsEditing(false);
//       setShowModal(false);
//     };

  const resetAddressForm = () => {
    setFullName('');
    setMobileNumber('');
    setNewAddress('');
    setState('');
    setDistrict(''); 
    setZipCode('');
  };
  
  const handleAddressEdit = async () => {

  if (!newAddress || !zipCode || !mobileNumber || !state || !district) {
    alert("Please fill in all required fields.");
    return; 
  }
  if (fullName.trim().toLowerCase() === 'guest') {
    alert("Please Change Your Full Name.");
    return;
  }  

  if (!/^\d{6}$/.test(zipCode)) {
    alert("Pincode must be exactly 6 digits.");
    return;
  }

    const updatedAddress = {
      id: guestCustomerId,
      fullName,
      mobileNumber,
      address: newAddress,
      zipCode,
      state,
      district
    };
  
    const payload3 = {
      id: guestCustomerId,
      profileType: "profileType",
      addressId: guestCustomerId,
      isPrimaryAddress: true,
      address: newAddress,
      state: state,
      district: district,
      StateId: stateId,
      DistrictId: districtId,
      zipCode: zipCode,
      mobileNumber: mobileNumber,
      emailAddress: "emailAddress",
      userId: userId,
      firstName: fullName,
      lastName: "lastName",
      fullName: fullName,
    };
  
    try {
      const response = await fetch(`https://handymanapiv2.azurewebsites.net/api/Customer/CustomerAddressEdit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload3),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response:", errorText);
        throw new Error("Failed to edit address.");
      }
  
      setAddresses(prev =>
        prev.map(addr => addr.id === guestCustomerId ? updatedAddress : addr)
      );
  
      setAddressData(updatedAddress);
      await fetchCustomerData();
      alert("Address Updated Successfully!");
      setShowModal(false);
      resetAddressForm();
      setIsEditing(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error("Error editing address:", error);
      alert("Failed to edit address. Please try again later.");
    }
  };
  
  useEffect(() => {
    return () => {  
      uploadedFiles.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [uploadedFiles]);

const primaryAddress = addresses.find(addr => addr.type === 'primary');
const isAddressInvalid = !primaryAddress || !primaryAddress.address || !primaryAddress.zipCode;
useEffect(() => {
    if (isAddressInvalid) {
      setShouldBlink(true);
    } else {
      setShouldBlink(false);
    }
  }, [isAddressInvalid]);

  return (
    <div>
      <Header />
    <div className="d-flex flex-row justify-content-start align-items-start">
       {/* Sidebar for larger screens */}
       {!isMobile && (
        <div className=" ml-0 m-4 p-0 sde_mnu">
          <Sidebar userType={selectedUserType} />
        </div>
      )}
      {/* Floating menu for mobile */}
      {isMobile && (
        <div className="floating-menu">
          <Button
            variant="primary"
            className="rounded-circle shadow"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertIcon />
          </Button>

          {showMenu && (
              <div className="sidebar-container">
                <Sidebar userType={selectedUserType} />
              </div>
          )}
        </div>
      )} 

      {/* Main Content */}
      <div className={`container m-1 ${isMobile ? 'w-100' : 'w-75'}`}>
      <h1 className="text-center mb-1 mt-mob-100">Raise a Ticket</h1>
      {/* Ticket Form */}
      {/* <Form > */}
        {/* Display primary address with "Change Address" link */}
         <div className="d-flex justify-content-between align-items-center">
                        <label className='mt-2'>Address <span className="req_star">*</span></label>
                        {/* <Button variant="success m-1 text-white" onClick={() => setShowModal(true)}>
                          Add Address
                        </Button> */}
        
              {/* Modal */}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Address' : 'Add Address'}</Modal.Title>
                  </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name <span className="req_star">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter Full name"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Mobile Number <span className="req_star">*</span></Form.Label>
                      <Form.Control
                        name="MobileNumber"
                        className="form-control"
                        placeholder="Enter Mobile Number"
                        maxLength="10"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        
                      />
                      </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="hidden"
                        name="UserId"
                        className="form-control"
                        placeholder="UserId"
                        value={guestCustomerId}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Address <span className="req_star">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter address"
                        required
                      />
                    </Form.Group>
                     <Form.Group className="mb-3">
                      <Form.Label>State <span className="req_star">*</span></Form.Label>
                      <Form.Select
                        value={stateId || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setStateId(selectedId);
                          const selectedState = stateList.find(
                            (s) => s?.StateId?.toString() === selectedId
                          );
                          if (selectedState) {
                            setState(selectedState.StateName);
                          }
                        }}
                        required
                      >
                        <option value="">Select State</option>
                        {Array.isArray(stateList) &&
                          stateList
                            .filter((s) => s && s.StateId && s.StateName)
                            .map((s) => (
                              <option key={s.StateId} value={s.StateId.toString()}>
                                {s.StateName}
                              </option>
                            ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>District <span className="req_star">*</span></Form.Label>
                     <Form.Select
                        value={districtId || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setDistrictId(selectedId);
                          const selectedDistrict = districtList.find(d => d.districtId.toString() === selectedId);
                          if (selectedDistrict) {
                            setDistrict(selectedDistrict.districtName);
                          }
                        }}
                        required
                      >
                        <option value="">Select District</option>
                        {districtList.map((d) => (
                          <option key={d.districtId} value={d.districtId.toString()}>
                            {d.districtName}
                          </option>
                        ))}
                      </Form.Select>
                       </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Pincode <span className="req_star">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={zipCode}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, ""); 
                          if (numericValue.length <= 6) {
                            setZipCode(numericValue);
                          }
                        }}              
                         placeholder="Enter pincode"
                         required
                      />
                    </Form.Group>
                    <Button type="button" variant="primary" onClick={handleAddressEdit}>
                      {isEditing ? 'Edit Address' : 'Add Address'}
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
                      </div>

                  <div className="p-3 border rounded bg-light">
                  {addresses
                      .map((address) => (
                        <div 
                          key={address.id}
                          className="list-group-item d-flex justify-content-between align-items-center bg-white text-dark"
                        >
                          <div>
                            {/* <span className="m1-2">{address.id}</span>
                            <br /> */}
                            <span className="ml-2">{address.fullName}</span>
                            <br />
                            <span className="ml-2">{address.mobileNumber}</span>
                            <br />
                            <span className="ml-2">{address.address}</span>
                            <br />
                            <span className="ml-2">{address.state}</span> 
                            <br />
                            <span className="ml-2">{address.district}</span> 
                            <br />
                            <span className="ml-2">{address.zipCode}</span> 
                            <br />
                            {/* <hr /> */}
                          </div>
                          <div className="text-end">
                          {addresses.map((address) => (
                            <Button
                              key={address.id}
                              variant={isAddressInvalid ? "primary" : "warning"}
                              className={`text-white mx-1 ${
                  shouldBlink ? "blinking-button" : ""
                }`}
                              onClick={() => {
                                setGuestCustomerId(address.id);
                                setFullName(address.fullName);
                                setMobileNumber(address.mobileNumber);
                                setNewAddress(address.address);
                                setState(address.state);
                                setDistrict(address.district);
                                setZipCode(address.zipCode);
                                setIsEditing(true);
                                setShowModal(true);
                              }}
                            >
                              {address.address === "" ? "Add Address" : "Edit Address"}
                            </Button>
                          ))}
                      </div> 
                        </div>
                      ))}   
                      </div>
                      {fullName.trim().toLowerCase() === "guest" && (
                <p className="text-danger">
                  Note: Please enter your address to Raise A Ticket
                </p>
              )}
                      {serviceUnavailable && (
                        <div className="alert alert-danger">
                          <strong>Note:</strong> Currently, the options to raise a ticket or book technician services are unavailable in your district.
                            You can still purchase products through the "Buy Product" section.
                            For further assistance, please contact our customer support at 62811 98953.
                        </div>
                      )} 
                      {/* <p className='text-danger'>Note: Please enter your address to Raise A Ticket</p>    */}
        {/* Subject */}
        <Row>
          <Col md={12}>
            <Form.Group>
              <label>Subject <span className="req_star">*</span></label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter subject"
                disabled={isAddressInvalid || serviceUnavailable}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Details */}
        <Form.Group>
          <label>Details <span className="req_star">*</span></label>
          <Form.Control
            as="textarea"
            name="details"
            value={formData.details}
            onChange={handleChange}
            rows="4"
            placeholder="Enter details"
            disabled={isAddressInvalid || serviceUnavailable}
            required
          />
        </Form.Group>

        {/* Category */}
        <Row>
          <Col md={6}>
            <Form.Group>
              <label>Category <span className="req_star">*</span></label>
              <Form.Control
                as="select"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isAddressInvalid || serviceUnavailable}
                required
              >
                <option value="">Select Category</option>
                <option>Plumbing and Sanitary</option>
                <option>Electrical</option>
                <option>Painting</option>
                <option>Interior</option>
                <option>Carpentry</option>
                <option>Pest Control</option>
                <option>Electronics Appliance Repairs</option>
                <option>Tiles Repairs</option>
                <option>Civil Works</option>
                <option>Water Proofing Works</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* <Row>
        <Col md={6}>
            <Form.Group>
              <label>Assigned To <span className="req_star">*</span></label>
              <Form.Control
                as="select"
                name="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="Customer Care">Customer Care</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row> */}

        {/* File Upload */}
        <div className="form-group">
          <label className="text-danger m-2">Upload your Query Photos </label>
          <input
                type="file"
                className="form-control"
                multiple
                onChange={handleFileChange}
                disabled={isAddressInvalid || serviceUnavailable}
                required
              />
              {showAlert && (
                <div className="alert alert-danger  mt-2">
                  Please click the <strong>Upload Files</strong> button to upload the selected images.
                </div>
              )}
          
    <label className="text-danger m-2 fs-5">
      If any Videos Forward to Whatsapp Number
      <br />
      <span className="text-success" 
      // onClick={handleWhatsAppClick} 
      style={{ cursor: 'pointer' }}>
        <WhatsAppIcon />
        <strong className="m-2" style={{textDecoration: 'underline'}}>{phoneNumber}</strong>
      </span>
    </label>
  
              <div className="mt-2">
                {ticketPhotos.map((file, index) => (
                <p key={index}>{file.name}</p>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={handleUploadFiles}
                disabled={loading || ticketPhotos.length === 0 || isAddressInvalid || serviceUnavailable}
              >
                {loading ? 'Uploading...' : 'Upload Files'}
              </button>
          </div>

        <div className="radio">
      <label className="m-1">
        <input
          className="form-check-input m-2 border-dark"
          type="radio"
          name="RequestType"
          value="With Material" 
          checked={requestType === "With Material"} 
          onChange={(e) => setRequestType(e.target.value)} 
          disabled={isAddressInvalid || serviceUnavailable}
          required
        />
        With Material
      </label>

      <label className="m-1">
        <input
          className="form-check-input m-2 border-dark"
          type="radio"
          name="RequestType"
          value="Without Material" 
          checked={requestType === "Without Material"} 
          onChange={(e) => setRequestType(e.target.value)} 
          required
          disabled={isAddressInvalid || serviceUnavailable}
        />
        Without Material
      </label>
    </div>
<div className="d-flex justify-content-between mt-3">
        {/* Get Quote Button */}
        <Button 
          variant="success" 
          type="submit" 
          onClick={handleSaveTicket}
          disabled={isSubmitting || isAddressInvalid || serviceUnavailable}
        >
          {isSubmitting ? 'Submitting...' : 'Get Quote'}
        </Button>
        <Button
          type="button"
          className="back-btn"
          onClick={() => window.location.href = `/profilePage/${userType}/${userId}`}
        >
          Back
        </Button>
     </div>
      </div>
    </div>
    <Footer /> 

{/* Styles for floating menu */}
<style jsx>{`
        .menu-popup {
          position: absolute;
          top: 50px; /* Keeps the popup aligned below the floating menu */
          left: 0; /* Aligns the popup to the left */
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 200px;
        }
        .menu-item {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        .menu-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default AddressManager;