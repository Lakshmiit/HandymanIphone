import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from './Header';
import Footer from './Footer';
export default function HandymanTrackingMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBzi82we6uzhXFjsiJ6hXVJhhx9wg_qykc", // replace with your key
  });

  // ✅ Static destination (customer’s location)
  const {id} = useParams();
  const [position, setPosition] = useState({ lat: 0, lng: 0 });
  const [distance, setDistance] = useState(null);
  const mapRef = useRef(null);
  const [groceryData, setGroceryData] = useState([]);
 const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(loading, groceryData);
  }, [loading, groceryData]);
useEffect(() => {
  const fetchGroceryData = async () => {
    try {
      const response = await fetch(
        `https://handymanapiv2.azurewebsites.net/api/Mart/GetProductDetails?id=${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch ticket data");
      const data = await response.json();

      const tickets = Array.isArray(data)
        ? data
        : data && typeof data === "object"
        ? [data] 
        : [];

      setGroceryData(tickets);

      const first = tickets[0] || {};
      setLatitude(first.latitude ? parseFloat(first.latitude) : null);
      setLongitude(first.longitude ? parseFloat(first.longitude) : null);
      // console.log("latitude: ", latitude);
      // console.log("longitude: ", longitude);
    } catch (error) {
      console.error("Error fetching ticket data:", error);
      setGroceryData([]);
    } finally {
      setLoading(false);
    }
  };
  fetchGroceryData();
}, [id]);


const destination = useMemo(() => {
  const lat = typeof latitude === "number" ? latitude : parseFloat(latitude);
  const lng = typeof longitude === "number" ? longitude : parseFloat(longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }
  return null; // not ready yet
}, [latitude, longitude]);

  // ✅ Haversine formula for distance in KM
  const calculateDistance = (pos1, pos2) => {
  if (
    !pos1 || !pos2 ||
    !Number.isFinite(pos1.lat) || !Number.isFinite(pos1.lng) ||
    !Number.isFinite(pos2.lat) || !Number.isFinite(pos2.lng)
  ) {
    return null; // guard: not computable yet
  }
  const R = 6371;
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

//   useEffect(() => {
//   if (!navigator.geolocation) return;

//   const watchId = navigator.geolocation.watchPosition(
//     (pos) => {
//       const newPos = {
//         lat: pos.coords.latitude,
//         lng: pos.coords.longitude,
//       };
//       setPosition(newPos);

//       // ✅ Only compute when destination exists
//       if (destination) {
//         const d = calculateDistance(newPos, destination);
//         if (d !== null) setDistance(d);
//       }

//       if (mapRef.current) mapRef.current.panTo(newPos);
//     },
//     (err) => console.error("Error watching position:", err),
//     { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
//   );

//   return () => navigator.geolocation.clearWatch(watchId);
// }, [destination]); 

useEffect(() => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    },
    (err) => console.error("Error getting current position:", err),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
  );
}, []);

useEffect(() => {
  if (
    destination &&
    Number.isFinite(position?.lat) &&
    Number.isFinite(position?.lng)
  ) {
    const d = calculateDistance(position, destination);
    if (d !== null) setDistance(d);
  }
}, [destination, position]);


  if (!isLoaded) return <p>Loading map...</p>;

  return (     
    <>
      <Header />
    <div className="container m-1">
    <div style={{ position: "relative", marginTop: "130px" }}>
      {/* ✅ Distance Display */}
      {distance && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 999,
            background: "white",
            padding: "8px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontWeight: "bold",
          }}
        >
          Distance to destination: {distance} km
        </div>
      )}            
     <GoogleMap
  center={position}
  zoom={15}
  mapContainerStyle={{ height: "100vh", width: "100%" }}
  onLoad={(map) => (mapRef.current = map)}
>
  {/* Handyman live location */}
  <Marker
    position={position}
    icon={{
      url: "https://static.thenounproject.com/png/motorcycle-icon-4303177-512.png",
      scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null,
    }}
  />

  {/* ✅ Destination marker only if we got coords */}
  {destination && (
  <>
    <Marker position={destination} label="🏠" />
    <Polyline
      path={[position, destination]}
      options={{ strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 4 }}
    />
  </>
)}
</GoogleMap>
    </div>
    </div>
    <Footer />
    </>
  );
}




