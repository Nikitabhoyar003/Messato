import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import socket from "../socket";
import API from "../utils/api";
import "./VendorLiveTrackingPage.css";

export default function AddressTracking() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [eta, setEta] = useState(null);
  const [distanceLeft, setDistanceLeft] = useState(null);

  const mapRef = useRef(null);
  const vendorMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

  const truckIcon = L.divIcon({
  className: "truck-icon",
  html: `<img src="https://cdn-icons-png.flaticon.com/512/1995/1995528.png" class="truck-img" />`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});


const calculateBearing = (startLat, startLng, endLat, endLng) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const dLng = toRad(endLng - startLng);

  const y = Math.sin(dLng) * Math.cos(toRad(endLat));
  const x =
    Math.cos(toRad(startLat)) * Math.sin(toRad(endLat)) -
    Math.sin(toRad(startLat)) *
      Math.cos(toRad(endLat)) *
      Math.cos(dLng);

  const brng = Math.atan2(y, x);

  return (toDeg(brng) + 360) % 360;
};

  /* ================= FIX LEAFLET ICON ================= */
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  /* ================= INIT MAP ================= */
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([21.1458, 79.0882], 13);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "&copy; OpenStreetMap contributors" }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await API.get("/vendor/orders");

      const activeOrders = res.data.filter(
        (o) => o.order_status === "Out for Delivery"
      );

      setOrders(activeOrders);
    } catch (err) {
      console.error("FETCH ORDER ERROR:", err.response?.data || err);
    }
  };

  fetchOrders();

  // 🔥 Auto refresh when order status changes
  socket.on("orderStatusUpdated", fetchOrders);

  return () => {
    socket.off("orderStatusUpdated", fetchOrders);
  };
}, []);

  /* ================= GOOGLE-LIKE ROAD ROUTING ================= */
  const drawRoute = async (vLat, vLng, uLat, uLng) => {
    
  try {
    
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${vLng},${vLat};${uLng},${uLat}?overview=full&geometries=geojson`
    );

    const data = await res.json();
    if (!data.routes?.length) return;

    const route = data.routes[0];

    const distanceMeters = route.distance;
    const km = (distanceMeters / 1000).toFixed(2);
    const minutes = Math.ceil(route.duration / 60);

    setDistanceLeft(km);
    setEta(minutes);

    // Remove old route
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    // Draw new polyline
    routeLayerRef.current = L.geoJSON(route.geometry, {
      style: {
        color: "#2563eb",
        weight: 5,
        opacity: 0.8,
      },
    }).addTo(mapRef.current);

    // Fit map to route
   if (!mapRef.current._routeFitted) {
  mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
    padding: [50, 50],
  });
  mapRef.current._routeFitted = true;
}

  } catch (err) {
    console.error("Route error:", err);
  }
};

  /* ================= WHEN ORDER SELECTED ================= */
  useEffect(() => {
    if (!selectedOrder || !mapRef.current) return;

   const uLat = Number(selectedOrder.latitude);
const uLng = Number(selectedOrder.longitude);

if (
  selectedOrder.latitude === null ||
  selectedOrder.longitude === null ||
  isNaN(uLat) ||
  isNaN(uLng)
) {
  alert("User location not available in database");
  return;
}

    mapRef.current.setView([uLat, uLng], 15);

    if (userMarkerRef.current)
      mapRef.current.removeLayer(userMarkerRef.current);
    if (vendorMarkerRef.current)
      mapRef.current.removeLayer(vendorMarkerRef.current);

    userMarkerRef.current = L.marker([uLat, uLng])
      .addTo(mapRef.current)
      .bindPopup("📍 Customer Location")
      .openPopup();

    socket.emit("joinOrderRoom", selectedOrder.id);

    socket.off("locationUpdated");

   socket.on("locationUpdated", (data) => {
  if (!data.latitude || !data.longitude) return;

  const vLat = parseFloat(data.latitude);
  const vLng = parseFloat(data.longitude);

  if (!vendorMarkerRef.current) {
    vendorMarkerRef.current = L.marker([vLat, vLng], {
      icon: truckIcon,
    }).addTo(mapRef.current);
  } else {
    const marker = vendorMarkerRef.current;
    const currentLatLng = marker.getLatLng();

    const bearing = calculateBearing(
      currentLatLng.lat,
      currentLatLng.lng,
      vLat,
      vLng
    );

    const iconElement = marker.getElement().querySelector(".truck-img");
    if (iconElement) {
      iconElement.style.transform = `rotate(${bearing}deg)`;
    }

    marker.setLatLng([vLat, vLng]);
  }

  drawRoute(vLat, vLng, uLat, uLng);
});

    return () => {
      socket.off("locationUpdated");
    };
  }, [selectedOrder]);

  return (
    <div className="vendor-layout">
      <div className="left-panel">
        <h2>🚚 Active Deliveries</h2>

        {orders.length === 0 && (
          <div className="no-orders">No active deliveries</div>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className={`order-card ${
              selectedOrder?.id === order.id ? "active" : ""
            }`}
          >
           <div className="order-top1">
  <span className="order-id">Order #{order.id}</span>
  <span className="price-badge">₹{order.amount}</span>
</div>
            <div className="order-user">{order.user_name}</div>
            <div className="order-address">{order.address}</div>
          </div>
        ))}
      </div>

      <div className="map-panel">
        {eta && (
          <div className="eta-box">
            ⏱ {eta} mins • 📏 {distanceLeft} km left
          </div>
        )}
        <div id="map" className="map-container"></div>
      </div>
    </div>
  );
}