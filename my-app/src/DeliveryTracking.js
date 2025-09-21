import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect, useRef, useMemo } from "react";
import './toast.js';

export default function HandymanTrackingMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBzi82we6uzhXFjsiJ6hXVJhhx9wg_qykc", // 🔑 replace with your API key
  });

  // ✅ Static destination (customer’s location)
 const destination = useMemo(
    () => ({ lat: 17.785, lng: 83.365 }),
    []
  );
  const [position, setPosition] = useState({ lat: 17.7773421, lng: 83.3670126 });
  const [distance, setDistance] = useState(null);
  const mapRef = useRef(null);

  // ✅ Haversine formula for distance in KM
  const calculateDistance = (pos1, pos2) => {
    const R = 6371; // Radius of earth in km
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1.lat * Math.PI) / 180) *
        Math.cos((pos2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(newPos);

          // Update distance to destination
          setDistance(calculateDistance(newPos, destination));

          // Keep map centered on user
          if (mapRef.current) {
            mapRef.current.panTo(newPos);
          }
        },
        (err) => console.error("Error watching position:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [destination]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div style={{ position: "relative" }}>
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
        {/* ✅ Handyman live location with bike icon */}
        <Marker
          position={position}
          icon={{
            url: "https://cdn-icons-png.flaticon.com/512/888/888857.png", // 🏍️ bike icon
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />

        {/* ✅ Destination marker */}
        <Marker
          position={destination}
          label="🏠"
        />

        {/* ✅ Line between source and destination */}
        <Polyline
          path={[position, destination]}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      </GoogleMap>
      
    </div>
  );
}