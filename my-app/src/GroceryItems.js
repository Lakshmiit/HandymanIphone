import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dashboard as MoreVertIcon } from "@mui/icons-material";
import { Button, Modal } from "react-bootstrap";
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from "@mui/icons-material/Favorite"; 
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"; 
import { CartStorage } from "./CartStorage";

// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
// import ArrowRightIcon from '@mui/icons-material/ArrowRight';
const GroceryCard = () => {
  // const navigate = useNavigate();
  // const location = useLocation();
  const { userType, userId, selectedUserType } = useParams();
  const location = useLocation();
const encodedCategory = location.state?.encodedCategory || localStorage.getItem("encodedCategory");
// const [selectedCategory, setSelectedCategory] = useState("");
const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [cart, setCart] = useState({});
 const [checked, setChecked] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [likedProducts, setLikedProducts] = useState({}); 
// const [totalItemsCount, setTotalItemsCount] = useState(0);
const [grandSummary, setGrandSummary] = useState({ items: 0, total: 0 });
// const [cartSummary, setCartSummary] = useState({
//   items: 0,
//   total: 0,
//   products: [],
// });

// const [groceryName, setGroceryName] = useState('');
 useEffect(() => {
console.log(checked, imageLoading, grandSummary);
}, [checked, imageLoading, grandSummary]);

useEffect(() => {
  const saved = CartStorage.getAll();
  const exist = saved.find(c => c.categoryName === selectedCategory);
  if (exist) {
    const restored = {};
    exist.products.forEach(p => {
      restored[String(p.productId)] = Number(p.qty);
    });
    setCart(restored);
  }
}, [selectedCategory]);
useEffect(() => {
  if (!selectedCategory) return;

  // Convert cart state → product list
  const current = Object.entries(cart).map(([productId, qty]) => {
  const product = products.find(p => String(p.id) === String(productId));
  return {
    productId,
    productName: product?.name || "",
    qty: Number(qty),
    mrp: Number(product?.mrp || 0),
    discount: Number(product?.discount || 0),
    afterDiscountPrice: Number(product?.afterDiscount || 0),
    stockLeft: Number(product?.stockLeft || 0),
    image: product?.images?.[0] || "", // filename only
  };
});

  CartStorage.upsertCategory(selectedCategory, current);

  setGrandSummary(CartStorage.grandSummary());
}, [cart, selectedCategory, products]);

const handleAdd = (productId) => setCart(prev => ({ ...prev, [productId]: 1 }));
const handleIncrement = (productId) =>
  setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
const handleDecrementClick = (productId) =>
  setCart(prev => {
    const next = (prev[productId] || 0) - 1;
    const copy = { ...prev };
    if (next <= 0) delete copy[productId];
    else copy[productId] = next;
    return copy;
  });

useEffect(() => {
  localStorage.setItem("cartData", JSON.stringify(cart));
}, [cart]);



// useEffect(() => {
//   const savedCategories = JSON.parse(localStorage.getItem("allCategories")) || [];
//   let items = 0, total = 0, products = [];
//   savedCategories.forEach((cat) => {
//     cat.products.forEach((p) => {
//       console.log("Product object:", p);

//       if (Number(p.qty) > 0) {
//         items += Number(p.qty);
//         const afterDiscountPrice = Number(p.afterDiscountPrice || p.price || p.finalPrice || 0);
//         total += afterDiscountPrice * Number(p.qty);

//         products.push({
//           id: p.productId || p.id,
//           productName: p.productName || p.name || "",
//           image: p.image || p.img || "",
//           mrp: Number(p.mrp) || Number(p.mrpPrice) || 0,
//           discount: Number(p.discount) || Number(p.discountPercent) || 0,
//           afterDiscountPrice,   
//           qty: Number(p.qty),
//           category: cat.categoryName,
//         });
//       }
//     });
//   });

//   setCartSummary({ items, total, products });
//   console.log("cartSummary:", { items, total, products });
// }, []);

// useEffect(() => {
//   if (!selectedCategory) return;
//   const savedCategories = JSON.parse(localStorage.getItem("allCategories")) || [];
//   const updatedCategories = savedCategories.filter(
//     (cat) => cat.categoryName !== selectedCategory
//   );
//   if (Object.keys(cart).length > 0) {
//     updatedCategories.push({
//       categoryName: selectedCategory,
//       products: Object.entries(cart).map(([productId, qty]) => {
//         const product = products.find((p) => String(p.id) === String(productId));
//         return {
//           productId,
//           productName: product?.name || "",
//           qty,
//           mrp: product?.mrp || 0,
//           discount: product?.discount || 0,
//           afterDiscountPrice: product?.afterDiscount || 0,
//           stockLeft: product?.stockLeft || 0,
//           image: product?.images?.[0] || "",
//           category: selectedCategory,
//         };
//       }),
//     });
//   }

//   localStorage.setItem("allCategories", JSON.stringify(updatedCategories));
//    let totalItems = 0;
//   let totalAmount = 0;

//   updatedCategories.forEach((cat) => {
//     cat.products.forEach((p) => {
//       totalItems += Number(p.qty);
//       totalAmount += Number(p.afterDiscountPrice) * Number(p.qty);
//     });
//   });

//   setGrandSummary({ items: totalItems, total: totalAmount });
// }, [cart, selectedCategory, products]);


// useEffect(() => {
//   const savedCategories = JSON.parse(localStorage.getItem("allCategories")) || [];
//   const currentCategory = decodeURIComponent(encodedCategory);

//   const existingCategory = savedCategories.find(c => c.categoryName === currentCategory);
//   if (existingCategory) {
//     const restoredCart = {};
//     existingCategory.products.forEach(p => {
//       restoredCart[p.productId] = p.qty;
//     });
//     setCart(restoredCart);
//   }
//   setSelectedCategory(currentCategory);
// }, [encodedCategory]);

const toggleLike = (productId) => {
  setLikedProducts((prev) => ({
    ...prev,
    [productId]: !prev[productId],
  }));
};

    const handleImageClick = (imageSrc) => {
    setZoomImage(imageSrc); 
    setShowZoomModal(true);
  };
  
//   const handleAdd = (productId) => {
//   setCart((prev) => ({
//     ...prev,
//     [productId]: 1,
//   }));
// };

  // const handleCheckboxChange = (e) => {
  //   setChecked(e.target.checked); 
  // };

const handleAddClick = (id) => {
    handleAdd(id);
    setChecked(true);
  };
// const handleIncrement = (productId) => {
//   setCart((prev) => ({
//     ...prev,
//     [productId]: (prev[productId] || 0) + 1,
//   }));
// };

// const handleDecrement = (productId) => {
//   setCart((prev) => {
//     const newQty = (prev[productId] || 0) - 1;
//     if (newQty <= 0) {
//       const updated = { ...prev };
//       delete updated[productId]; 
//       return updated;
//     }
//     return {
//       ...prev,
//       [productId]: newQty,
//     };
//   });
// };

//  const handleDecrementClick = (id) => {
//     handleDecrement(id);
//     if (cart[id] - 1 <= 0) {
//       setChecked(false); 
//     }
//   };

useEffect(() => {
  const fetchGroceryProducts = async () => {
    try {
      setSelectedCategory(encodedCategory);
      setImageLoading(true);

      // ✅ API call with properly encoded category
      const url = `https://handymanapiv2.azurewebsites.net/api/UploadGrocery/GetGroceryItemsBycategory?Category=${encodedCategory}`;
      const response = await axios.get(url);
      setProducts(response.data);
      const allImagePromises = response.data.flatMap((product) =>
        product.images?.map((photo) =>
          fetch(
            `https://handymanapiv2.azurewebsites.net/api/FileUpload/download?generatedfilename=${photo}`
          )
            .then((res) => res.json())
            .then((data) => {
              const byteCharacters = atob(data.imageData);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: "image/jpeg" });
              const imageUrl = URL.createObjectURL(blob);
              return { productId: product.id, imageUrl };
            })
            .catch(() => null)
        ) || []
      );

      const imageResults = await Promise.allSettled(allImagePromises);

      const imageMap = {};
      imageResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          const { productId, imageUrl } = result.value;
          if (!imageMap[productId]) {
            imageMap[productId] = [];
          }
          imageMap[productId].push(imageUrl);
        }
      });

      setImageUrls(imageMap);
      setImageLoading(false);
    } catch (error) {
      console.error("Error fetching grocery products:", error);
      setProducts([]);
      setImageLoading(false);
    }
  };

  if (encodedCategory) {
    fetchGroceryProducts();
  }
}, [encodedCategory]);

useEffect(() => {
  if (encodedCategory) {
    setSelectedCategory(decodeURIComponent(encodedCategory)); 
  }
}, [encodedCategory]);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  const savedCategories = JSON.parse(localStorage.getItem("allCategories")) || [];
  const currentCategory = decodeURIComponent(encodedCategory);

  const existingCategory = savedCategories.find(c => c.categoryName === currentCategory);
  if (existingCategory) {
    const restoredCart = {};
    existingCategory.products.forEach(p => {
      restoredCart[p.productId] = p.qty;
    });
    setCart(restoredCart);
  }
}, [encodedCategory]);

  return (
    <>
      <div>
        <div>
          <h1
            style={{
              background: "green",
              color: "white", 
              fontFamily: "'Baloo 2'",
              fontSize: "25px",
              padding: "10px",
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              letterSpacing: "1px",
              marginBottom: "3px",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 1000,
            }}
          >
            Lakshmi Mart
            <br />
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                display: "block",
                marginTop: "2px",
                textAlign: "center",
                fontFamily: "Roboto",
              }}
            >
              FSSAI LIC Number - 20125051001066
            </span>
          </h1>
        </div>

        <div className="wrapper d-flex" style={{ marginTop: "65px" }}>
          {/* Sidebar */}
          {!isMobile ? (
            <div className="ml-0 p-0 sde_mnu">
              <Sidebar userType={selectedUserType} />
            </div>
          ) : (
            <div className="groceryfloating-menu">
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

         <div className={`container ${isMobile ? "w-100" : "w-75"} `}>
          <div className="position-relative flex-grow-1 ms-5">
                    <input
                      type="text"
                      className="form-control w-60 mt-2 ps-5 "
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
    <>
      <h4 className="font-bold ">{selectedCategory}</h4>
  <div className="d-flex justify-content-end">
  <span className="text-success text-xs">
    Selected Qty:{" "}
    <span className="text-danger fw-bold">
      {Object.values(cart).reduce((sum, qty) => sum + qty, 0)}
    </span>
  </span>

 <span className="text-success text-xs ms-2">
  Total Price: Rs{" "}
  <span className="text-danger fw-bold">
    {Math.round(
      Object.entries(cart).reduce((sum, [productId, qty]) => {
        const product = products.find(
          (p) => String(p.id) === String(productId)
        );
        return (
          sum + (product ? Number(product.afterDiscount) * qty : 0)
        );
      }, 0)
    )}
  </span>
  /-
</span>
</div>
    
      <div className="grocery-row flex flex-wrap gap-1">
        {products
  .filter(
    (p) =>
      p.category?.toLowerCase() === selectedCategory.toLowerCase() &&
      p.status === "Approved" &&
      (searchQuery === "" ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  .map((product) => {
    const stock = Number(product.stockLeft || 0);
    const isOutOfStock = stock <= 0;

    return (
      <div
        key={product.id}
        className="w-[200px] flex flex-col p-2 bg-white rounded shadow-sm border position-relative"
        style={{ minHeight: "200px", opacity: isOutOfStock ? 0.6 : 1 }}
      >
        {/* Discount & Checkbox */}
        <div className="d-flex flex-row justify-content-between absolute top-0 left-0 w-full">
          {product.discount && (
            <span className="discount-badge">
              {Math.round(Number(product.discount))}%
            </span>
          )}
          {/* Like Icon */}
           {!isOutOfStock && (
          <span
            style={{
              cursor: "pointer",
              marginRight: "6px",
              marginTop: "2px",
              zIndex: 3,
            }}
            onClick={() => toggleLike(product.id)}
          >
            {likedProducts[product.id] ? (
              <FavoriteIcon style={{ color: "red" }} />
            ) : (
              <FavoriteBorderIcon style={{ color: "grey" }} />
            )}
          </span>
        )}
        </div>

        {/* Product Image */}
          <div
            className="d-flex justify-content-center align-items-center position-relative"
            style={{ height: "80px" }}
          >
            {imageUrls[product.id]?.[0] ? (
              <img
                src={imageUrls[product.id][0]}
                alt={product.name}
                style={{
                  maxHeight: "80px",
                  maxWidth: "100%",
                  objectFit: "contain", 
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  borderRadius: "6px",
                }}   
                onClick={() =>
                  !isOutOfStock && handleImageClick(imageUrls[product.id][0])
                }
              />
            ) : (
              <span className="text-muted small">Loading Image</span>
            )}

            {/*Out of Stock only on image*/}
            {isOutOfStock && (
              <div
                className="position-absolute d-flex justify-content-center align-items-center"
                style={{
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(255,255,255,0.75)", 
                  borderRadius: "6px",
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontWeight: "500",
                    backgroundColor: "grey",
                    color: "white", 
                    fontSize: "10px",
                    borderRadius: "6px",
                    margin: "2px",
                    padding: "3px",
                  }}
                >
                  Out of Stock
                </span>      
              </div>
            )}
          </div>

        {/* Product Info */}
        <h6 className="text-start fw-bold m-0" style={{ fontSize: "12px" }}>
          {product.name?.split(" ").slice(0, 2).join(" ")}
          {product.name?.split(" ").length > 2 ? "..." : ""}
        </h6>

        <div className="text-start m-0" style={{ fontSize: "12px" }}>
          <b className="text-success me-2">₹{product.afterDiscount}</b>
          <s className="text-muted">₹{product.mrp}</s>
        </div>

        {/* Checkbox */}
         {!isOutOfStock && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
            }}
          >
            <input
              type="checkbox"
              className="border-dark"
              checked={cart[product.id] > 0}
              readOnly
            />
          </div>
        )}
                
        {/* ✅ Show ADD/Counter only if in stock */}
      {!isOutOfStock && (
        <div style={{ position: "absolute", bottom: "8px", right: "8px" }}>
          {cart[product.id] ? (
            <div
              className="d-flex align-items-center justify-content-between"
              style={{
                backgroundColor: "green",
                color: "white",
                borderRadius: "8px",
                padding: "2px 8px",
                minWidth: "70px",
              }}
            >
              <button
                className="btn btn-sm p-0 text-white"
                style={{ fontWeight: "bold", width: "24px", height: "24px" }}
                onClick={() => handleDecrementClick(product.id)}
              >
                –
              </button>
              <span className="fw-bold">{cart[product.id]}</span>
              <button
                className="btn btn-sm p-0 text-white"
                style={{ fontWeight: "bold", width: "24px", height: "24px" }}
                onClick={() => handleIncrement(product.id)}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="btn fw-bold"
              style={{
                border: "1px solid green",
                color: "green",
                backgroundColor: "#f6fff6",
                borderRadius: "8px",
                padding: "2px 12px",
                fontSize: "13px",
              }}
              onClick={() => handleAddClick(product.id)}
            >
              ADD
            </button>
          )}
        </div>
      )}
      </div>
    );
  })}

{/* Cart Bar */}
{(() => {
  const allCategories = JSON.parse(localStorage.getItem("allCategories") || "[]");

  const items = allCategories.reduce(
    (sum, cat) => sum + cat.products.reduce((s, p) => s + Number(p.qty || 0), 0),
    0
  );

  const total = allCategories.reduce(
    (sum, cat) =>
      sum +
      cat.products.reduce(
        (s, p) => s + Number(p.afterDiscountPrice || p.price || 0) * Number(p.qty || 0),
        0
      ),
    0
  );

  return items > 0 ? (
    <div
      style={{
        position: "fixed",
        bottom: "0px",
        left: 0,
        width: "100%",
        backgroundColor: "green",
        color: "white",
        padding: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "bold",
        zIndex: 2000,
        borderRadius: "20px",
        marginTop: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        🛒
        <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
          <span style={{ fontSize: "12px" }}>{items} items</span>
          <span style={{ fontSize: "12px" }}>₹{Math.round(total)}</span>
        </div>
      </div>

<button
  type="button"
        className="text-white fw-bold d-flex align-items-center gap-1"
        style={{
          fontSize: "12px",
          cursor: "pointer",
          background: "transparent",
          border: "none",
        }}
        onClick={() => window.location.href = `/groceryCart/${userType}/${userId}`}
      >
  View Cart →
  {/* ({grandSummary.items}) – ₹{Math.round(grandSummary.total)} */}
</button>
</div>
  ) : null;
})()}
      </div>
      </>
  )}
   {/* Back Button */}
      <div className="text-start">
        <button
          className="mt-1 mb-5" style={{background: "green", borderRadius: "15px", padding: "6px"}}
          onClick={() => window.location.href = `/profilePage/${userType}/${userId}`}
        >
          Back
        </button>
      </div>
</div>
    </div>     
      </div>
       <Modal show={showZoomModal} onHide={() => setShowZoomModal(false)} centered>
                <button className="close-button text-end mt-0" onClick={() => setShowZoomModal(false)}>
                    &times; </button>
                      <Modal.Body className="text-center">
                        <div className="zoom-container">
                          <img src={zoomImage} alt="Zoomed Product" className="zoom-image" />
                        </div>
                      </Modal.Body>
                    </Modal>
    </>
  );
};
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
      top: 4px;  
      right: 5px;  
      background: red;
      border: none;
      font-size: 24px;
      color: white;
      padding: 5px;
      border-radius: 50%;
      cursor: pointer;
      transition: 0.3s;
    }
    .close-button:hover {
      background: darkred;
    }
         .zoom-image {
        max-width: 80%;
        height: auto;
        border-radius: 5px;
        }
      `}</style>

export default GroceryCard;
