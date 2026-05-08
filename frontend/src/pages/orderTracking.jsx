// import { useEffect, useState } from "react";
// import { GoogleMap, Marker } from "@react-google-maps/api";
// import socket from "../socket";

// const OrderTracking = ({ orderId, vendorLat, vendorLng }) => {
//   const [location, setLocation] = useState(
//     vendorLat && vendorLng
//       ? { lat: Number(vendorLat), lng: Number(vendorLng) }
//       : null
//   );

//   useEffect(() => {
//     if (!orderId) return;

//     socket.emit("joinOrderRoom", orderId);

//     const handleTracking = (data) => {
//       setLocation({
//         lat: data.lat,
//         lng: data.lng,
//       });
//     };

//     socket.on(`track_${orderId}`, handleTracking);

//     return () => {
//       socket.off(`track_${orderId}`, handleTracking);
//     };
//   }, [orderId]);

//   if (!location) {
//   return (
//     <p className="info">
//       📡 Waiting for vendor to start delivery…
//     </p>
//   );
// }


//   return (
//     <GoogleMap
//       center={location}
//       zoom={15}
//       mapContainerStyle={{
//         width: "100%",
//         height: "300px",
//         borderRadius: "10px",
//       }}
//     >
//       <Marker position={location} />
//     </GoogleMap>
//   );
// };

// export default OrderTracking;

import { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useLoadScript,
} from "@react-google-maps/api";
import io from "socket.io-client";
import axios from "../utils/api";
import socket from "../socket"; // existing socket

const localSocket = io("http://localhost:5000"); // second socket preserved

const mapContainerStyle = {
  width: "100%",
  height: "450px",
};

export default function OrderTracking({
  orderId,
  vendorLat,
  vendorLng,
}) {
  /* =========================
     STATE
  ========================= */
  const [vendorLocation, setVendorLocation] = useState(
    vendorLat && vendorLng
      ? { lat: Number(vendorLat), lng: Number(vendorLng) }
      : null
  );

  const [userLocation, setUserLocation] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [routePath, setRoutePath] = useState([]);
  const [eta, setEta] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  /* =========================
     GET USER LOCATION
  ========================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  /* =========================
     SOCKET + TRACKING
  ========================= */
  useEffect(() => {
    if (!orderId) return;

    const token = localStorage.getItem("token");

    // Secure join
    socket.emit("joinOrderRoom", { orderId, token });
    localSocket.emit("joinOrderRoom", { orderId, token });

    /* 🔹 LOCATION HANDLER (OLD + NEW SUPPORT) */
    const handleTracking = (data) => {
      const lat = Number(data.lat || data.latitude);
      const lng = Number(data.lng || data.longitude);

      const newVendorLoc = { lat, lng };

      setVendorLocation(newVendorLoc);
      setEta("10-15 mins"); // Preserved fake ETA

      if (userLocation) {
        setRoutePath([newVendorLoc, userLocation]);
        checkArrival(newVendorLoc, userLocation);
      }
    };

    // OLD dynamic event
    socket.on(`track_${orderId}`, handleTracking);
    localSocket.on(`track_${orderId}`, handleTracking);

    // NEW event
    socket.on("locationUpdated", handleTracking);
    localSocket.on("locationUpdated", handleTracking);

    /* 🔹 STATUS AUTO REFRESH */
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);

    return () => {
      socket.off(`track_${orderId}`, handleTracking);
      socket.off("locationUpdated", handleTracking);

      localSocket.off(`track_${orderId}`, handleTracking);
      localSocket.off("locationUpdated", handleTracking);

      clearInterval(interval);
    };
  }, [orderId, userLocation]);

  /* =========================
     FETCH ORDER
  ========================= */
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/orders/${orderId}`);
      setOrderStatus(res.data.status);
    } catch (error) {
      console.error("Order fetch error:", error);
    }
  };

  /* =========================
     ARRIVAL DETECTION
  ========================= */
  const checkArrival = (vendor, user) => {
    const distance = getDistanceFromLatLonInKm(
      vendor.lat,
      vendor.lng,
      user.lat,
      user.lng
    );

    if (distance < 0.15) {
      setOrderStatus("Arriving");
    }
  };

  /* =========================
     DISTANCE CALCULATION
  ========================= */
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🍱 Live Order Tracking</h2>

      {!vendorLocation && (
        <p style={{ color: "#666" }}>
          📡 Waiting for vendor to start delivery…
        </p>
      )}

      {vendorLocation && userLocation && (
        <>
          <GoogleMap
            zoom={15}
            center={vendorLocation}
            mapContainerStyle={mapContainerStyle}
          >
            {/* Vendor Marker */}
            <Marker position={vendorLocation} label="🍱 Vendor" />

            {/* User Marker */}
            <Marker position={userLocation} label="🏠 You" />

            {/* Route Line */}
            <Polyline
              path={routePath}
              options={{
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }}
            />
          </GoogleMap>

          {eta && (
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              🚚 Estimated Arrival: {eta}
            </p>
          )}
        </>
      )}

      <OrderTimeline currentStatus={orderStatus} />
    </div>
  );
}

/* =========================
   🔹 TIMELINE (PRESERVED + ARRIVING)
========================= */
function OrderTimeline({ currentStatus }) {
  const steps = [
    "Pending",
    "Accepted",
    "Preparing",
    "Out for Delivery",
    "Arriving",
    "Delivered",
  ];

  return (
    <div style={{ marginTop: "25px" }}>
      {steps.map((step, index) => {
        const active = steps.indexOf(currentStatus) >= index;

        return (
          <div
            key={index}
            style={{
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "8px",
              background: active ? "#16a34a" : "#e5e7eb",
              color: active ? "white" : "#444",
            }}
          >
            {active ? "✅ " : "⏳ "}
            {step}
          </div>
        );
      })}
    </div>
  );
}