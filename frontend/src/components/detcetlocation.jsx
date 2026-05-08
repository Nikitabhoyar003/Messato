import {
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { useRef, useState } from "react";

const DEFAULT_CENTER = { lat: 21.1458, lng: 79.0882 };

const DetectLocationModal = ({ onClose }) => {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");

  const autocompleteRef = useRef(null);

  // ✅ Reverse Geocode function
  const getAddress = (latlng) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        let area = "";
        let city = "";

        results[0].address_components.forEach((comp) => {
          if (
            comp.types.includes("sublocality") ||
            comp.types.includes("neighborhood")
          ) {
            area = comp.long_name;
          }
          if (comp.types.includes("locality")) {
            city = comp.long_name;
          }
        });

        const finalAddress = `${area || "Area"}, ${city}`;
        setAddress(finalAddress);

        localStorage.setItem(
          "USER_LOCATION",
          JSON.stringify({
            lat: latlng.lat,
            lng: latlng.lng,
            address: finalAddress,
            timestamp: Date.now(),
          })
        );
      }
    });
  };

  // ✅ Detect current location
  const detectLocation = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setCenter(latlng);
        getAddress(latlng);
        setLoading(false);
      },
      () => {
        alert("Permission denied");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // ✅ When place selected from search
  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();

    if (!place.geometry) return;

    const latlng = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setCenter(latlng);
    getAddress(latlng);
  };

  // ✅ Save & close
  const confirmLocation = () => {
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h3>Select your location</h3>

        {/* 🔍 Search box */}
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search your area..."
            style={styles.search}
          />
        </Autocomplete>

        {/* 🗺 Map */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={styles.map}
        >
          <Marker
            position={center}
            draggable={true}
            onDragEnd={(e) => {
              const latlng = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              };

              setCenter(latlng);
              getAddress(latlng);
            }}
          />
        </GoogleMap>

        {/* 📍 Address */}
        <p style={{ marginTop: "10px", fontWeight: "500" }}>
          {address}
        </p>

        <button style={styles.detectBtn} onClick={detectLocation}>
          {loading ? "Detecting..." : "📍 Use Current Location"}
        </button>

        <button style={styles.confirmBtn} onClick={confirmLocation}>
          Confirm Location
        </button>
      </div>
    </div>
  );
};

export default DetectLocationModal;

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  card: {
    background: "#fff",
    padding: "20px",
    width: "380px",
    borderRadius: "16px",
    textAlign: "center",
  },
  map: {
    width: "100%",
    height: "220px",
    borderRadius: "12px",
    marginTop: "10px",
  },
  search: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  detectBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
  confirmBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
};
