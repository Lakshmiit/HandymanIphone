import React, { useState, useEffect, useRef } from 'react';
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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const OffersProductCard = () => {
//   const navigate = useNavigate();
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
  // const [imageLoading, setImageLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const productScrollRef = useRef(null); 
// const [groupedProducts, setGroupedProducts] = useState({});
const [expandedCategories, setExpandedCategories] = useState({});
const [loadingStatus, setLoadingStatus] = useState({}); 
const [selectedProduct, setSelectedProduct] = useState(null);

useEffect(() => {
  console.log(products, selectedCategory);
}, [products, selectedCategory]);

// function to fetch images for ONE product
const fetchImagesForProduct = async (product) => {
  try {
    setLoadingStatus((prev) => ({ ...prev, [product.id]: true }));

    const photoPromises = product.productPhotos.map(async (photo) => {
      const res = await fetch(
        `https://handymanapiv2.azurewebsites.net/api/FileUpload/download?generatedfilename=${photo}`
      );
      const imgData = await res.json();
      return { imageData: imgData.imageData };
    });

    const allImages = await Promise.all(photoPromises);
    setImageUrls((prev) => ({ ...prev, [product.id]: allImages }));
  } catch (err) {
    console.error(`Failed to fetch images for product ${product.id}`, err);
  } finally {
    setLoadingStatus((prev) => ({ ...prev, [product.id]: false }));
  }
};

// fetch list of products
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `https://handymanapiv2.azurewebsites.net/api/Product/GetAllProductList`
      );
      const data = await response.json();
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date(a.createdDate || a.uploadedDate || a.updatedAt);
        const dateB = new Date(b.createdDate || b.uploadedDate || b.updatedAt);
        return dateB - dateA;
      });

      setProductData(sorted);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  fetchProducts();
}, []);

// FETCH CATEGORY 
useEffect(() => {
  const handleCategoryClick = async () => {
    try {
      setSelectedCategory(encodedCategory);
      setProducts([]);

      const url = `https://handymanapiv2.azurewebsites.net/api/Product/GetProductsByCategory?Category=${encodedCategory}`;
      const response = await axios.get(url);

      const sorted = response.data.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );

      setProducts(sorted);

      // fetch all images immediately
      if (sorted.length > 0) {
        fetchImagesForProduct(sorted);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  if (encodedCategory) {  
    handleCategoryClick();
  }
}, [encodedCategory]);

useEffect(() => {
  if (!products || products.length === 0) return;

  products.forEach((product) => {
    if (!imageUrls[product.id] && product.productPhotos?.length) {
      fetchImagesForProduct(product);  
    }
  });
}, [products, imageUrls]);   

// Filter only products of the selected category
const filteredProducts = products.filter((product) => {
  const productName = product.productName?.toLowerCase().trim();
  const query = searchQuery.toLowerCase().trim();
  const normalize = (str) => (str.endsWith("s") ? str.slice(0, -1) : str);
  return (
    productName.includes(query) ||
    normalize(productName).includes(normalize(query))
  );
});

// Sort by latest date
const sortedProducts = [...filteredProducts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

// Show only 9 latest if not expanded
const isExpanded = expandedCategories[selectedCategory || "all"];
const visibleProducts = isExpanded
  ? sortedProducts
  : sortedProducts.slice(0, 6);

useEffect(() => {
  if (!visibleProducts || visibleProducts.length === 0) return;

  visibleProducts.forEach((product) => {
    if (!imageUrls[product.id] && product.productPhotos?.length) {
      fetchImagesForProduct(product);
    }
  });
}, [visibleProducts, imageUrls]);

  const handleImageClick = (imageSrc) => {
    setZoomImage(imageSrc); 
    setShowZoomModal(true);
  };
  
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
      <div className="wrapper d-flex ">
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
        {/* {selectedCategory && (
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
        )} */}
</div>
            {/* <div className="row g-4">
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
                <div key={product.id} className="col-md-4">
                  {!isMobile ? (
                  <div className="card w-100 border-light rounded-4">
                  {imageLoading ? (
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ height: '250px', background: '#f8f9fa' }}
                    >
                      <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : imageUrls[product.id]?.length > 0 ? (
                        <Carousel>
                        {imageUrls[product.id]?.map((img, index) => (
                          <Carousel.Item key={index}>
                            <img
                              loading="eager"
                              src={img}
                              className="card-img-top rounded-top zoomable-image"
                              style={{ height: "250px", width: 'auto', objectFit: "cover", cursor: "pointer" }}
                              alt={`product-image-${index}`}
                              onClick={() => handleImageClick(img)}
                            />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                  ) : (
                    <div 
                      className="d-flex justify-content-center align-items-center"
                      style={{ height: '250px', background: '#f8f9fa' }}
                    >
                      Loading 
                    </div> 
                  )}  
                      <div className="card-body p-1">
                        <h5 className="card-title">{product.productName}</h5>
                        <h5 className="card-title text-primary">{product.catalogue}</h5>
                        <div className="card-text fw-bold text-primary fs-5 no-break"> After Discount Price: Rs {discountedPrice}</div>
                            <div className="card-text fw-bold text-muted fs-6" style={{ textDecoration: 'line-through' }}>MRP: Rs {product.rate}</div>
                            <div className="card-text fw-bold text-danger fs-6">Discount: {product.discount}%</div>
                            <div className="card-text fw-bold text-success fs-5">Free Delivery and Installation</div>
                      <Button
                        className="btn btn-warning w-50 fw-bold mt-1"
                        onClick={() => {
                          if (userId === "guest") {
                            window.location.href = "https://handymanserviceproviders.com/";
                          } else {
                            navigate(`/offersBuyProduct/${userType}/${userId}/${product.id}`);
                          }
                        }}
                      >
                        Buy Now
                      </Button>
                      </div>
                    </div>
                    ) : (
                      <div className="card w-100 border-light rounded-4 d-md-none">
                      <div className="d-flex">
                        <div style={{ flex: '0 0 55%' }}>
                        {imageLoading ? (
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{ height: '250px', background: '#f8f9fa' }}
                        >
                          <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : imageUrls[product.id]?.length > 0 ? (
                        <Carousel>
                          {imageUrls[product.id].map((img, index) => (
                            <Carousel.Item key={index}>
                              <img
                                loading="eager"
                                src={img}
                                className="card-img-top rounded-top zoomable-image"
                                style={{ height: "250px", objectFit: "cover", cursor: "pointer" }}
                                alt={`product-image-${index}`}
                                onClick={() => handleImageClick(img)}/>
                            </Carousel.Item>
                          ))}
                        </Carousel>
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{ height: '250px', background: '#f8f9fa' }}
                        >
                          No Image
                        </div>
                      )}
                        </div>
                        <div >
                          <h6 className="mb-1">{product.productName}</h6>
                          <div className="small text-primary fw-bold">Rs {discountedPrice}</div>
                          <div className="small text-muted fw-bold" style={{ textDecoration: 'line-through' }}>MRP: Rs {product.rate}</div>
                          <div className="small text-danger fw-bold">Discount: {product.discount}%</div>
                          <div className="small text-success fw-bold">Free Delivery and Installation</div>
                          <button
                            className="btn btn-warning btn-sm fw-bold mt-1"
                            onClick={() => {
                              navigate(`/offersBuyProduct/${userType}/${userId}/${product.id}`);
                            }}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                     )}
      </div>
    );
  })}
</div> */}

{/* <h4 style={{ color: '#ff5722', fontFamily: 'Poppins, sans-serif', fontWeight: 700,fontSize: '22px', textTransform: 'uppercase',
    letterSpacing: '1px', textAlign: 'center', marginBottom: '1px'}}>
   🎉 Top Deals For You! 🎉
</h4> */}
{/* Products Display */}
{/* <div className="product-scroll-wrapper " ref={productScrollRef}>
  {Object.entries(groupedProducts)
    .sort(([a], [b]) => (a === "Home Decors" ? -1 : b === "Home Decors" ? 1 : 0)) 
    .map(([categoryName, products]) => {
      const isExpanded = expandedCategories[categoryName];
      const filteredProducts = products.filter((product) => {
        const productName = product.productName?.toLowerCase().trim();
        const query = searchQuery.toLowerCase().trim();
        const normalize = (str) => (str.endsWith('s') ? str.slice(0, -1) : str);
        return (
          productName.includes(query) ||
          normalize(productName).includes(normalize(query))
        );
      });
      const sortedProducts = [...filteredProducts].sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );
      const visibleProducts = isExpanded ? sortedProducts : sortedProducts.slice(0, 9);
      if (filteredProducts.length === 0) return null;

      return (
        <div key={categoryName} className="mt-0">
          {/* <h5 className="mb-1 ">{categoryName.toUpperCase()}</h5> 
          <div className="product-row">
            {visibleProducts.map((product) => {
              const discountedPrice =
                product.rate && product.discount
                  ? (product.rate - (product.rate * product.discount) / 100).toFixed(0)
                  : product.rate;

              return (
                <>
                <div
                  key={product.id}
                  className="product-card me-2 mb-3"
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* {product.discount && (
                    <div className="discount-badge-wrapper">
                      <span className="discount-badge">
                        {Math.round(product.discount)}%
                      </span>
                    </div>
                  )} 

                 <div className="image-container">
                  {product.discount && (
                    <div className="discount-badge-wrapper">
                      <span className="discount-badge">{Math.round(product.discount)}%</span>
                    </div>
                  )}
                  {loadingStatus[product.id] ? (
                    <div className="image-placeholder m-1">Loading...</div>
                  ) : imageUrls[product.id]?.length > 0 ? (
                    <img
                      src={`data:image/jpeg;base64,${imageUrls[product.id][0].imageData}`}
                      className="product-image"
                      alt="product"
                    />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}
                </div>

                  <div className="product-info">
                    <h6 className="product-name">{product.productName.toUpperCase()}</h6>
                    <div className="product-price">Rs {discountedPrice} /-</div>                   
                    </div>
                     {/* <p className="text-danger">Limited deal</p> 
                </div>
           </>
              );
            })}
          </div>

          {filteredProducts.length > 9 && (
  <div className="text-end">
    <Button
      variant="outline-primary"
      size="sm"
      onClick={() =>
        setExpandedCategories((prev) => ({
          ...prev, 
          [categoryName]: !prev[categoryName],
        }))
      }
    >
      {isExpanded ? 'Less' : 'More'}
    </Button>
  </div>
)}
        </div>
      );
    })}
</div> */}

{/* Products Display */}
<div className="product-scroll-wrapper" ref={productScrollRef}>
  <div className="mt-0">
    <div className="product-row">
      {visibleProducts.map(
        (product) => {
          const discountedPrice =
            product.rate && product.discount
              ? (
                  product.rate -
                  (product.rate * product.discount) / 100
                ).toFixed(0)
              : product.rate;

          return (
            <div
              key={product.id}
              className="product-card me-2 mb-3"
              onClick={() => setSelectedProduct(product)}
              style={{ cursor: "pointer" }}
            >
              <div className="image-container">
                {product.discount && (
                  <div className="discount-badge-wrapper">
                    <span className="discount-badge">
                      {Math.round(product.discount)}%
                    </span>
                  </div>
                )}
                {loadingStatus[product.id] ? (
                  <div className="image-placeholder m-1">Loading...</div>
                ) : imageUrls[product.id]?.length > 0 ? (
                  <img
                    src={`data:image/jpeg;base64,${imageUrls[product.id][0].imageData}`}
                    className="product-image"
                    alt={product.productName}
                  />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
              </div>

              <div className="product-info">
                <h6 className="product-name">
                  {product.productName?.toUpperCase()}
                </h6>
                <div className="product-price">Rs {discountedPrice} /-</div>
              </div>
            </div>
          );
        }
      )}
    </div>  

    {filteredProducts.length > 6 && (
      <div className="text-end">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() =>
            setExpandedCategories((prev) => ({
              ...prev,
              [selectedCategory]: !prev[selectedCategory],
            }))
          }
        >
          {isExpanded ? "Less" : "More"}
        </Button>
      </div>
    )}
  </div>            
</div>

 {/* Selected Product Display */}
{selectedProduct && (
  <div className="custom-modal-backdrop" onClick={() => setSelectedProduct(null)}>
     <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
       <button className="close-button" onClick={() => setSelectedProduct(null)}>&times;</button>
  <div className="d-flex flex-column align-items-center">
  <div style={{ width: '100%', maxWidth: '300px' }}>
    {loadingStatus[selectedProduct.id] ? (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '250px', background: '#f8f9fa' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>  
    ) : imageUrls[selectedProduct.id]?.length > 0 ? (
      <Carousel>
        {imageUrls[selectedProduct.id].map((img, index) => (
          <Carousel.Item key={index}>
            <img
  src={`data:image/jpeg;base64,${img.imageData}`}
  className="card-img-top"
  style={{
    height: '230px',
    width: '100%',
    objectFit: 'contain',
  }}
  alt={`product-image-${index}`}
  onClick={() => handleImageClick(`data:image/jpeg;base64,${img.imageData}`)}
/>
          </Carousel.Item>
        ))}
      </Carousel>
    ) : (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '150px', background: '#f8f9fa' }}>
        No Image
      </div>
    )}
  </div>

  <div className="text-center mt-3">
    <h6 className=" fw-bold" style={{ fontFamily: "Rubik" }}>
      {selectedProduct.productName.toUpperCase()}
    </h6>
    <div className="small text-primary fw-bold">
      Rs {(selectedProduct.rate - (selectedProduct.rate * selectedProduct.discount) / 100).toFixed(0)} /-
    </div>
    <div className="small text-muted fw-bold" style={{ textDecoration: 'line-through' }}>
      MRP: Rs {selectedProduct.rate} /-
    </div>
    <div className="small text-danger fw-bold">
      Discount: {selectedProduct.discount}%
    </div>
   <div
  className="small fw-bold fs-6 text-start d-flex align-items-center"
  style={{
    color: '#7851a9',
    fontFamily: 'Italianno, cursive',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
>
  <LocalShippingIcon style={{ color: '#f88379', fontSize: '1rem' }} />
  <span className="ms-1">Free Delivery and Free Installation</span>
</div>
    <div className="fs-5">
      <span className="badge text-primary">✔️ Genuine Product</span>
      <span className="badge text-secondary">↩️ Easy Returns</span>
      <span className="badge text-success">💳 COD Available</span>
      <span className="badge text-danger">📦 Stock Left : {selectedProduct.numberOfStockAvailable} </span>
    </div>
    <button
      className="buy-now-btn"
      onClick={() => window.location.href =  `/offersBuyProduct/${userType}/${userId}/${selectedProduct.id}`}
    >
      Buy Now
    </button>
  </div>
</div>
</div>
</div>
)}
 <div className="text-start">
  <button 
    className="btn btn-warning m-2" 
    onClick={() => window.location.href = `/profilePage/${userType}/${userId}`}
  >
    Back
  </button> 
</div>
</div>
</div>
 <Modal show={showZoomModal} onHide={() => setShowZoomModal(false)} centered>
          <button className="close-button text-end mt-0" onClick={() => setShowZoomModal(false)}>
              &times; </button>
                <Modal.Body className="text-center position-relative">
                  <div className="zoom-container">
                    <img src={zoomImage} alt="Zoomed Product" className="zoom-image" />
                  </div>
                </Modal.Body>
              </Modal>
{/* Zoom Modal
<Modal show={showZoomModal} onHide={() => setShowZoomModal(false)} centered>
        <Modal.Body className="text-center position-relative">
          <div className="zoom-container">
              Close Button (X)   
    <button
      className="close-button text-end"
      onClick={() => setShowZoomModal(false)}
    >
      &times;
    </button>
            <img src={zoomImage} alt="Zoomed Product" className="zoom-image" />
          </div>
        </Modal.Body>
      </Modal> */}
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
