import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔧 Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapView = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [radiusUsed, setRadiusUsed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     1️⃣ READ LOCATION (ONLY)
  ========================== */
  useEffect(() => {
    const stored = localStorage.getItem("USER_LOCATION");

    if (!stored) {
      setError("Location not selected");
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUserLocation({ lat: parsed.lat, lng: parsed.lng });
    } catch {
      setError("Invalid location data");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     2️⃣ FETCH SERVICES (1 KM → 2 KM)
  ========================== */
  useEffect(() => {
    if (!userLocation) return;

    const fetchServices = async () => {
      try {
        let res = await axios.get(
          `http://localhost:5000/api/tiffin/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=1`
        );

        if (!res.data.services || res.data.services.length === 0) {
          res = await axios.get(
            `http://localhost:5000/api/tiffin/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=2`
          );
          setRadiusUsed(2);
        } else {
          setRadiusUsed(1);
        }

        setServices(res.data.services || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load nearby tiffin services");
      }
    };

    fetchServices();
  }, [userLocation]);

  /* =========================
     UI STATES
  ========================== */
  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Loading map…</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        {error}
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================== */
  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "6px" }}>Nearby Tiffin Services</h2>
      <p style={{ color: "#555", marginBottom: "14px" }}>
        Showing vendors within <strong>{radiusUsed} km</strong> of your location
      </p>

      <div style={{ borderRadius: "12px", overflow: "hidden" }}>
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={14}
          style={{ height: "380px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* USER MARKER */}
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>

          {/* VENDOR MARKERS */}
          {services.map((s) => (
            <Marker
              key={s.id}
              position={[Number(s.latitude), Number(s.longitude)]}
            >
              <Popup>
                <strong>{s.name}</strong>
                <br />
                {Number(s.distance).toFixed(2)} km away
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
