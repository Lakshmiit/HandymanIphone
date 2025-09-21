import React, { useEffect, useState, useRef } from "react";
import {
  Divider,
  IconButton,
} from "@mui/material"; 
import { Modal } from 'react-bootstrap'; 
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import "./App.css"; 
import CartImg from './img/Cart.jpeg';
import {  useParams } from "react-router-dom";

const GroceryCartPage = () => {     
  // const navigate = useNavigate();
  const {userId} = useParams();
  const {userType} = useParams();
  const [cartItems, setCartItems] = useState([]);
  const removalTimers = useRef({});
  // const location = useLocation();
  // const encodedCategory = location.state?.encodedCategory || localStorage.getItem("encodedCategory");
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [grandSummary, setGrandSummary] = useState({ items: 0, total: 0 });
const [imageBlobMap, setImageBlobMap] = useState({}); 

//  useEffect(() => {
//     console.log();
//   }, []);
     
 // --- Image ---
const IMAGE_DOWNLOAD =
  "https://handymanapiv2.azurewebsites.net/api/FileUpload/download?generatedfilename=";
const getFilenameFromValue = (value) => {
  if (!value) return "";
  const v = String(value);
  const i = v.indexOf("generatedfilename=");
  if (i >= 0) return decodeURIComponent(v.slice(i + "generatedfilename=".length));
  if (/^https?:\/\//i.test(v)) return "";          
  return v.trim();                                   
};
const fileToUrl = (filenameOrUrl) => {
  if (!filenameOrUrl) return "";
  if (/^https?:\/\//i.test(String(filenameOrUrl))) return filenameOrUrl;  
  return `${IMAGE_DOWNLOAD}${encodeURIComponent(String(filenameOrUrl))}`;  
};

useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("allCategories") || "[]");
  const allItems = saved.flatMap((cat) =>
    (cat.products || []).map((p, idx) => {
      const persisted = p.image ?? p.productImage ?? "";
      const imageFilename = getFilenameFromValue(persisted);
      const imageUrl = imageFilename ? fileToUrl(imageFilename) : (typeof persisted === "string" ? persisted : "");

      return {
        id: `${cat.categoryName}-${p.productId ?? p.id ?? idx}`,
        productId: p.productId ?? p.id ?? idx,
        name: p.productName ?? p.name ?? "",
        category: cat.categoryName,
        qty: Number(p.qty || 0),
        mrp: Number(p.mrp || 0),
        discount: Number(p.discount || 0),
        price: Number(p.afterDiscountPrice || p.price || 0),
        stockLeft: Number(p.stockLeft || 0),
        imageFilename,       
        imageUrl,         
      };
    })
  );
  setCartItems(allItems.filter(it => it.qty > 0));
  setGrandSummary({
    items: allItems.reduce((s, it) => s + Number(it.qty || 0), 0),
    total: Math.round(allItems.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0)),
  });
}, []);

useEffect(() => {
  const filenames = Array.from(
    new Set(
      cartItems
        .map(i => i.imageFilename)
        .filter(Boolean)
        .filter(fn => !(fn in imageBlobMap))
    )
  );
  if (!filenames.length) return;

  let cancelled = false;
  (async () => {
    try {
      const results = await Promise.allSettled(
        filenames.map(async (fn) => {
          const res = await fetch(`${IMAGE_DOWNLOAD}${encodeURIComponent(fn)}`);
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json();         
            if (!data?.imageData) throw new Error("No imageData");
            const byte = atob(data.imageData);
            const arr = new Uint8Array(byte.length);
            for (let i = 0; i < byte.length; i++) arr[i] = byte.charCodeAt(i);
            const blob = new Blob([arr], { type: "image/*" });
            const blobUrl = URL.createObjectURL(blob);
            return { fn, url: blobUrl };
          } else {
            return { fn, url: `${IMAGE_DOWNLOAD}${encodeURIComponent(fn)}` };
          }
        })
      );
      if (cancelled) return;
      const mapUpdate = {};
      results.forEach(r => {
        if (r.status === "fulfilled" && r.value?.fn && r.value?.url) {
          mapUpdate[r.value.fn] = r.value.url;
        }
      });
      if (Object.keys(mapUpdate).length) {
        setImageBlobMap(prev => ({ ...prev, ...mapUpdate }));
      }
    } catch (e) {
      console.error("prefetch images failed", e);
    }
  })();
  return () => { cancelled = true; };
}, [cartItems, imageBlobMap]);

const writeBackToStorage = (items) => {
  const grouped = items.reduce((acc, it) => {
    (acc[it.category] ||= []).push({
      productId: it.productId,
      productName: it.name,
      qty: it.qty,
      mrp: it.mrp,
      discount: it.discount,
      afterDiscountPrice: it.price,
      stockLeft: it.stockLeft,
      image: it.imageFilename || getFilenameFromValue(it.imageUrl) || it.imageUrl || null,
    });
    return acc;
  }, {});
  const allCategories = Object.entries(grouped).map(([categoryName, products]) => ({
    categoryName,
    products: products.filter(p => Number(p.qty) > 0),
  }));
  localStorage.setItem("allCategories", JSON.stringify(allCategories));
};

const handleQtyChange = (rowId, delta) => {
  setCartItems(prev => {
    const next = prev
      .map(it => it.id === rowId ? { ...it, qty: Math.max(0, (it.qty || 0) + delta) } : it)
      .filter(it => it.qty > 0);
    writeBackToStorage(next);
    setGrandSummary(computeTotals(next));
    return next;
  });
};

const computeTotals = (items) => ({
  items: items.reduce((s, it) => s + Number(it.qty || 0), 0),
  total: Math.round(items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0)),
});


const handleGroceryProceed = async (event) => {
  event.preventDefault();
  const allCategories = JSON.parse(localStorage.getItem("allCategories")) || [];
  const payload = { 
    id: "string",
    martId: "string",
    date: "string",
    customerId: userId,
    status: "Draft",
    paymentMode: "",
    utrTransactionNumber: "",
    transactionNumber: "",
    transactionStatus: "",
    TransactionType: "",
    paidAmount: "",
    customerName: "",
    address: "", 
    state: "",
    district: "",
    zipCode: "",
    customerPhoneNumber: "",
    GrandTotal: (roundedGrandTotal).toString(),
    TotalItemsSelected: (grandSummary.items).toString(),
    categories: allCategories.map((cat) => {
  const products = (cat.products || []).map((p) => {
    const persisted = p.image ?? p.productImage ?? "";
    const filename = getFilenameFromValue(persisted);
    const safeImage = filename || (typeof persisted === "string" ? persisted : "");
    return {
      productName: p.productName || p.name || "",
      noOfQuantity: String(p.qty),
      productImage: safeImage, 
      mrp: String(p.mrp || 0),
      discount: String(p.discount || 0),
      afterDiscountPrice: String(p.afterDiscountPrice || p.price || 0),
      stockLeft: String(p.stockLeft - p.qty),
    };
  });
  return {
    categoryName: cat.categoryName,
    numberOfItemsSelected: products.reduce((sum, p) => sum + Number(p.noOfQuantity), 0),
    totalAmount: Math.round(
      products.reduce((sum, p) => sum + Number(p.afterDiscountPrice) * Number(p.noOfQuantity), 0)
    ),
    products,
  };
}),
  };

  try {
    const response = await fetch(
      `https://handymanapiv2.azurewebsites.net/api/Mart/UploadProductDetails`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
if (response.ok) {
  const data = await response.json();
  const extractedId = data.id;
  if (extractedId) {
    localStorage.setItem("orderId", extractedId);
    console.log("extractedId:", extractedId);
    localStorage.removeItem("allCategories");
    alert("Items Updated Successfully! You can see selected items in View Cart!");
    window.location.href = `/groceryPaymentMethod/${userType}/${userId}/${extractedId}`;
  }
    } else {
      const errorText = await response.text();
      alert("Failed to upload order: " + errorText);
    }
  } catch (error) {
    console.error("API Error:", error);
    alert("An error occurred while uploading the order.");
  }
};

const handleImageClick = (imageSrc) => {
    setZoomImage(imageSrc); 
    setShowZoomModal(true);
  };

const handleRestore = (id) => {
  clearTimeout(removalTimers.current[id]);
  delete removalTimers.current[id];
  setCartItems((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, qty: 1, removing: false } : item
    )
  );
};

  const itemsTotal = Math.round(cartItems.reduce((s, it) => s + it.mrp   * it.qty, 0));
const grandTotal = Math.round(cartItems.reduce((s, it) => s + it.price * it.qty, 0));
const roundedItemsTotal = Math.round(itemsTotal);
const roundedGrandTotal = Math.round(grandTotal);

  return (
  <div
    className="cart-container d-flex flex-column"
    style={{
      maxWidth: "600px",
      margin: "5px",
      padding: "5px",
      borderRadius: "8px",
      height: "100vh",
    }}
  >
    {/* Header */}
    <div className="cart-header d-flex justify-content-between">
      <div className="d-flex align-items-center">
        <img src={CartImg} alt="Cart" className="cart-icon" />
        <h3 className="ms-1" style={{ fontSize: "18px" }}>
          My Cart
        </h3>
      </div>
      <IconButton>
        <CloseIcon
        onClick={() => window.location.href = `/profilePage/${userType}/${userId}`}
        style={{
          cursor: "pointer",
          fontSize: "30px",
          color: "tomato",
        }}
      />
      </IconButton>
    </div>
    <Divider />

    {/* Cart Items */}
    <div
      className="cart-items flex-grow-1"
      style={{
        overflowY: "auto",
        padding: "8px",
        marginTop: "48px",
      }}
    >
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="cart-item d-flex align-items-start justify-content-between mb-2"
        >
          {/* Product Image */}
            <img
              src={ (item.imageFilename && imageBlobMap[item.imageFilename]) ||
                 (item.imageFilename && fileToUrl(item.imageFilename)) ||
                 item.imageUrl || "/placeholder.png" }
              alt={item.name}
              onClick={() => handleImageClick(
                (item.imageFilename && imageBlobMap[item.imageFilename]) ||
                (item.imageFilename && fileToUrl(item.imageFilename)) ||
                item.imageUrl ||
                "/placeholder.png"
              )}
              style={{ height: 50, width: 50, cursor: "pointer", borderRadius: 6 }}
              onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
            />

          {/* Product Details */}
          <div style={{ flex: 1, marginLeft: "8px" }}>
            <div style={{ fontWeight: "500", fontSize: "12px" }}>{item.name}</div>
            <div style={{ fontSize: '10px', color: '#888' }}>{item.category}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              MRP: <s>₹{item.mrp}</s> &nbsp;
              <span style={{ color: "red" }}>{item.discount}% off</span>
            </div>
            <div style={{ fontWeight: "600", fontSize: "12px" }}>₹{item.price}</div>
          </div>

          {/* Quantity Box */}
          {item.removing ? (
            <button
              onClick={() => handleRestore(item.id)}
              style={{
                backgroundColor: "white",
                color: "green",
                border: "1px solid green",
                borderRadius: "6px",
                fontSize: "14px",
                padding: "8px",
              }} 
            >
              Add
            </button>
          ) : (
            <div
              className="qty-box d-flex align-items-center justify-content-between"
              style={{
                backgroundColor: "#2e7d32",
                borderRadius: "6px",
                color: "white",
                minWidth: "60px",
                height: "25px",
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleQtyChange(item.id, -1)}
                style={{ color: "white", padding: "2px" }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <span style={{ fontWeight: "bold", fontSize: "12px" }}>{item.qty}</span>
              <IconButton
                size="small"
                onClick={() => handleQtyChange(item.id, 1)}
                style={{ color: "white", padding: "2px" }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Bill Details */}
    <div className="bill-details p-1">
      <p className="fs-6 fw-bold">Bill details</p>
      <div className="d-flex justify-content-between align-items-center">
        <span>📋 Items total</span>
        <span>
          <s className="text-muted">₹{roundedItemsTotal}</s> ₹{roundedGrandTotal}
        </span>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <span>🚲 Delivery charge <InfoIcon fontSize="small" /></span>
        <span className="text-danger fw-bold" style={{ fontSize: "10px" }}>
          FREE
        </span>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <span>👜 Handling charge <InfoIcon fontSize="small" /></span>
        <span className="text-danger fw-bold" style={{ fontSize: "10px" }}>
          FREE
        </span>
      </div>
      <hr className="my-2" />
      <div className="d-flex justify-content-between align-items-center fw-bold">
        <span>Grand total</span>
        <span>₹{roundedGrandTotal}</span>
      </div>
    </div>
    <Divider />
    {/* Footer */}
    <div
      className="cart-footer d-flex justify-content-between align-items-center mt-2 px-3 py-2"
      style={{
        backgroundColor: "#008000",
        color: "white",
        borderRadius: "8px",
        width: "100%",
      }}
    >
      <div>
        <span style={{ fontSize: "12px" }}>{grandSummary.items} items</span>
        <div style={{ fontWeight: "500", fontSize: "15px" }}>₹{roundedGrandTotal}</div>
      </div>
  
      <div style={{ fontWeight: "500", fontSize: "15px" }} onClick={handleGroceryProceed}>
        {roundedGrandTotal < 1 ? "Add More Items" : "Proceed →"}
      </div>
    </div>
    <div className="text-start">
        <button
          className="btn btn-warning mt-1 mb-5"
          onClick={() => window.location.href = `/profilePage/${userType}/${userId}`}
        >
          Back         
        </button> 
      </div>
    {/* Zoom Modal */}
    <Modal show={showZoomModal} onHide={() => setShowZoomModal(false)} centered>
      <button
        className="close-button text-end mt-0"
        onClick={() => setShowZoomModal(false)}
      >
        &times;
      </button>
      <Modal.Body className="text-center">
        <div className="zoom-container">
          <img src={zoomImage} alt="Zoomed Product" className="zoom-image" />
        </div>
      </Modal.Body>
    </Modal>
  </div>
);
};

export default GroceryCartPage;
