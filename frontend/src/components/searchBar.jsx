import {  useState } from "react";
import "./searchBar.css";

const SearchBar = () => {
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocoding using OpenStreetMap
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        setLocation(data.address.city || data.address.town || data.address.village);
      },
      () => alert("Location permission denied")
    );
  };

  const handleSearch = () => {
    console.log("Location:", location);
    console.log("Supplier:", supplier);
    // later → navigate to /vendors?location=...&supplier=...
  };

  return (
    <div className="search-container">
      

      <div className="search-box">
        {/* Location Input */}
        <div className="search-input">
          <span className="icon" onClick={getCurrentLocation}>📍</span>
          <input
            type="text"
            placeholder="Enter your location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="divider" />

        {/* Supplier Input */}
        <div className="search-input">
          <input
            type="text"
            placeholder="Search tiffin supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
          <span className="icon search" onClick={handleSearch}>🔍</span>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
