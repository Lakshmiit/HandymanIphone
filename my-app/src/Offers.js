import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import './App.css';
import Sidebar from './Sidebar.js';
import Footer from './Footer.js';
import Header from './Header.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dashboard as MoreVertIcon,} from '@mui/icons-material';
import { Button, Carousel, Modal } from 'react-bootstrap';
import SearchIcon from '@mui/icons-material/Search';

const OffersProductCard = () => {
  // const navigate = useNavigate();
   const location = useLocation();
   const encodedCategory = location.state?.encodedCategory || localStorage.getItem('encodedCategory');
   const {userType} = useParams();
  const {userId} = useParams(); 
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { selectedUserType } = useParams();
  const [productData, setProductData] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
 const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');

useEffect(() => {
  const fetchProductsAndAllImages = async () => {
    try {
      // const start = performance.now();

      const productRes = await fetch('https://handymanapiv2.azurewebsites.net/api/Product/GetAllProductList');
      const productList = await productRes.json();
      setProductData(productList);

      const allImagePromises = productList.flatMap(product => 
        product.productPhotos?.map(photo => 
          fetch(`https://handymanapiv2.azurewebsites.net/api/FileUpload/download?generatedfilename=${photo}`)
            .then(res => res.json())
            .then(data => {
              const byteCharacters = atob(data.imageData);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'image/jpeg' });
              const imageUrl = URL.createObjectURL(blob);
              return { productId: product.id, imageUrl };
            })
            .catch(() => null)
        ) || []
      );

      const imageResults = await Promise.allSettled(allImagePromises);
      const imageMap = {};
      imageResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          const { productId, imageUrl } = result.value;
          if (!imageMap[productId]) {
            imageMap[productId] = [];
          }
          imageMap[productId].push(imageUrl);
        }
      });

      setImageUrls(imageMap);
      setImageLoading(false);

      // const duration = performance.now() - start;
      // console.log(`All images loaded in ${duration.toFixed(1)} ms`);
    } catch (error) {
      console.error("Error loading all images fast:", error);
    }
  };

  fetchProductsAndAllImages();
}, []);

  
  const handleImageClick = (imageSrc) => {
    setZoomImage(imageSrc);
    setShowZoomModal(true);
  };
  
useEffect(() => {
  const handleCategoryClick = async () => {
    try {
      setSelectedCategory(encodedCategory);
      setProducts([]); 
      const url = `https://handymanapiv2.azurewebsites.net/api/Product/GetProductsByCategory?Category=${encodedCategory}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); 
    }
  };
  handleCategoryClick();
}, [encodedCategory]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!productData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Header />
      <div className="wrapper d-flex mt-100">
        {!isMobile && (
          <div className="ml-0 m-4 p-0 sde_mnu">
            <Sidebar userType={selectedUserType} />
          </div>
        )}

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

        <div className={`container m-1 ${isMobile ? 'w-100' : 'w-75'}`}>
          <div className='d-flex justify-content-center'>
        <div className="position-relative flex-grow-1 ms-4">
          <input
            type="text"
            className="form-control w-60 m-2 ps-5 "
            placeholder="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.trimStart())}
            />
            <SearchIcon
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              style={{ pointerEvents: 'none' }}
            />
          </div>
        {selectedCategory && (
          <div className="m-1 d-flex align-items-center position-relative" style={{ gap: '10px' }}>
          
          <Button
            variant="warning"
            size="sm"
            className="ms-2"
            onClick={() => setSelectedCategory(null)}
          >
            Show All Products
          </Button>
        </div>
        )}
</div>
            <div className="row">
            {(selectedCategory ? products : productData)
  ?.filter(product => {
    const productName = product.productName?.toLowerCase().trim();
    const query = searchQuery.toLowerCase().trim();

    const normalize = str => str.endsWith('s') ? str.slice(0, -1) : str;

    return (
      productName.includes(query) ||
      normalize(productName).includes(normalize(query))
    );
  })
  .slice()
  .reverse()
  .map((product) => {
              const discountedPrice = product.rate && product.discount 
                ? ((product.rate - (product.rate * product.discount) / 100).toFixed(0)) 
                : product.rate;
              return (
                 <div key={product.id} className="col-12 col-md-4 d-flex">
      {isMobile ? (
       <div className="d-flex w-100 border rounded-2 shadow-sm p-2 align-items-center">
  {/* Image */}
  <div className="flex-shrink-0" style={{ width: "45%", maxWidth: "150px" }}>
    {imageLoading ? (
      <div className="d-flex justify-content-center align-items-center h-100 bg-light">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    ) : imageUrls[product.id]?.length > 0 ? (
      <img
        src={imageUrls[product.id][0]}
        alt={product.productName}
        className="img-fluid w-100 h-100 rounded"
        style={{ objectFit: "contain", cursor: "pointer" }}
        onClick={() => handleImageClick(imageUrls[product.id][0])}
      />
    ) : (
      <div className="d-flex justify-content-center align-items-center h-100 bg-light">
        No Image
      </div>
    )}
  </div>

  {/* Details */}
  <div className="flex-grow-1 d-flex flex-column text-center px-2">
    <h6 className="fw-semibold two-line-text" style={{fontSize: "13px"}}>{product.productName}</h6>
    <small className="text-primary" style={{fontSize: "12px"}}>{product.catalogue}</small>
    <div className="fw-bold text-primary" style={{fontSize: "13px"}}>Rs {discountedPrice} /-</div>
    <div className="text-muted small" style={{ textDecoration: "line-through", fontSize: "10px" }}>
      MRP: {product.rate}
    </div>
    <div className="text-danger small fw-bold" style={{fontSize: "12px"}}>Discount: {product.discount}%</div>
    <div className="text-success small fw-semibold" style={{fontSize: "12px"}}>Free Delivery & Installation</div>

    <button
      className="btn btn-warning fw-bold mt-auto btn-sm" style={{fontSize: "12px"}}
      onClick={() => {
        if (userId === "guest") {
          window.location.href = "https://handymanserviceproviders.com/";
        } else {
          window.location.href = `/offersBuyProduct/${userType}/${userId}/${product.id}`;
        }
      }}
    >
      Buy Now
    </button>
  </div>
</div>
      ) : (
        /* ----------- Desktop Layout (Image Top, Details Below) ----------- */
        <div className="card w-100 h-100 border-light rounded-4 d-flex flex-column">
          {/* Image Section */}
          {imageLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "250px", background: "#f8f9fa" }}>
              <div className="spinner-border text-secondary" role="status" />
            </div>
          ) : imageUrls[product.id]?.length > 0 ? (
            <Carousel>
              {imageUrls[product.id].map((img, index) => (
                <Carousel.Item key={index}>
                  <img
                  loading="eager"
                  src={imageUrls[product.id][0]}
                  className="card-img-top rounded-top zoomable-image"
                  style={{
                    height: "150px",
                    width: "100%",      
                    objectFit: "cover",
                    cursor: "pointer"
                  }}
                  alt={product.productName}
                  onClick={() => handleImageClick(imageUrls[product.id][0])}
                />

                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "250px", background: "#f8f9fa" }}>
              No Image
            </div>
          )}

          {/* Details Section */}
          <div className="card-body p-2 d-flex flex-column">
            <h5 className="card-title two-line-text" style={{fontSize: "15px"}}>{product.productName}</h5>
            <h6 className="text-primary">{product.catalogue}</h6>
            <div className="fw-bold text-primary" style={{fontSize: "14px"}}>Discount Price: Rs {discountedPrice}/-</div>
            <div className="fw-bold text-muted" style={{ textDecoration: "line-through", fontSize: "12px" }}>MRP: {product.rate}</div>
            <div className="fw-bold text-danger fs-6" style={{fontSize: "12px"}}>Discount: {product.discount}%</div>
            <div className="fw-bold text-success" style={{fontSize: "14px"}}>Free Delivery and Installation</div>

            <div className="mt-auto">
              <Button
                className="btn btn-warning w-100 fw-bold mt-2" style={{fontSize: "12px"}}
                onClick={() => {
                  if (userId === "guest") {
                    window.location.href = "https://handymanserviceproviders.com/";
                  } else {
                    window.location.href = `/offersBuyProduct/${userType}/${userId}/${product.id}`;
                  }
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  })}
</div>
</div>
</div>

{/* Zoom Modal */}
<Modal show={showZoomModal} onHide={() => setShowZoomModal(false)} centered>
        <Modal.Body className="text-center position-relative">
          <div className="zoom-container">
             {/* Close Button (X) */}    
    <button
      className="close-button text-end"
      onClick={() => setShowZoomModal(false)}
    >
      &times;
    </button>
            <img src={zoomImage} alt="Zoomed Product" className="zoom-image" />
          </div>
        </Modal.Body>
      </Modal>

      <div className="text-start">
  <button 
    className="btn btn-warning m-2" 
    onClick={() => window.location.href = `/offersIcons/${userType}/${userId}`}
  >
    Back
  </button>
</div>
      <style jsx>{`
       .zoomable-image {
          transition: transform 0.3s ease-in-out;
        }
        .zoomable-image:hover {
          transform: scale(1.1);
        }
        .zoom-container {
          position: relative;
          display: inline-block;
        }
    .close-button {
      position: absolute;
      top: 8px;  
      right: 10px;  
      background: red;
      border: none;
      font-size: 24px;
      color: white;
      padding: 5px 10px;
      border-radius: 50%;
      cursor: pointer;
      transition: 0.3s;
    }
    .close-button:hover {
      background: darkred;
    }
         .zoom-image {
        max-width: 100%;
        height: auto;
        border-radius: 5px;
        }
        .offer-banner {
          background: linear-gradient(90deg, #ff9800, #ff5722);
          font-size: 1.3rem;
          font-weight: bold;
          animation: pulse 1.5s infinite alternate;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease-in-out;
        }
        .carousel-control-prev-icon,
        .carousel-control-next-icon {
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
        }
        .btn-warning {
          background: linear-gradient(45deg, #ff9800, #ff5722);
          border: none;
          transition: all 0.3s ease-in-out;
        }
        .btn-warning:hover {
          background: linear-gradient(45deg, #ff5722, #ff9800);
          transform: scale(1.05);
        }
      `}</style>
      <Footer />
    </>
  );
};

export default OffersProductCard;