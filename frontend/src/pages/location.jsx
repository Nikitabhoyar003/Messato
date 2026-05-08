import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./location.css";

const API = "http://localhost:5000";

const SelectLocation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const detectLocation = () => {
    setLoading(true);

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        let address = "Current Location";

        try {
          // ✅ USE YOUR BACKEND (not public nominatim)
          const res = await fetch(
            `${API}/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            const area =
              addr.suburb ||
              addr.neighbourhood ||
              addr.village ||
              "";

            const city =
              addr.city ||
              addr.town ||
              addr.state_district ||
              addr.state ||
              "";

            address = [area, city].filter(Boolean).join(", ");
          }
        } catch (e) {
          console.warn("Reverse geocode failed → using GPS only", e);
        }

       const locationData = {
  lat: latitude,
  lng: longitude,
  address,
  isDetected: true,
  timestamp: Date.now(),
};

localStorage.setItem("USER_LOCATION", JSON.stringify(locationData));
navigate("/user-dashboard", { replace: true });

        // ✅ UPDATE DB (non-blocking)
        const token = localStorage.getItem("token");

if (!token) {
  console.warn("No user token found → skipping DB update");
} else {
  fetch(`${API}/api/user/update-location`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ location: address }),
  })
    .then(res => {
      if (!res.ok) {
        console.error("Location update failed:", res.status);
      }
    })
    .catch(() => {});
}


        // ✅ notify whole app
        window.dispatchEvent(
          new CustomEvent("locationChanged", { detail: locationData })
        );

        // navigate("/user-dashboard", { replace: true });
        // ✅ Instead of navigate, reload dashboard cleanly
// window.location.href = "/user-dashboard";
navigate("/user-dashboard", { replace: true });
      },
      (error) => {
        console.error("GPS error", error);
        alert("Unable to access location");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="explore-wrapper">
      <section className="map-section sl-overlay">

        {/* ✅ OSM MAP PREVIEW (instead of Google iframe) */}
        <iframe
          title="map"
          className="dashboard-map"
          src="https://www.openstreetmap.org/export/embed.html?bbox=79.07,21.13,79.10,21.16&layer=mapnik"
          loading="lazy"
        />

        <div className="sl-card floating-location-card">
          <h2>Select your location</h2>

          <button
            className="sl-button"
            onClick={detectLocation}
            disabled={loading}
          >
            {loading ? "Detecting..." : "📍 Detect Location"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default SelectLocation;
