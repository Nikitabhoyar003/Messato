import "./navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import { FaBoxOpen, FaShoppingCart, FaStore, FaSignOutAlt, FaMotorcycle, FaUtensils, FaEdit } from "react-icons/fa";
import { CiBellOn, CiLocationOn } from "react-icons/ci";
import { MdRestaurantMenu, MdDashboard, MdClose, MdSave } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { useCart } from "./useCart";
import CartDrawer from "./CartDrawer";

// import { io } from "socket.io-client";
// const socket = io("http://localhost:5000", { withCredentials: true });

import { useAuth } from "./AuthContext";

/* ─────────────────────────────────────────────────────
   ROOT NAVBAR — switches between User ↔ Vendor
   Re-checks on every route change (covers post-login redirect)
 ───────────────────────────────────────────────────── */
const Navbar = () => {
  const { user, vendor, role } = useAuth();

  if (role === "vendor") {
    return <VendorNavbar vendor={vendor} />;
  }

  return <UserNavbar user={user} />;
};

/* ═══════════════════════════════════════════════════
   USER NAVBAR — original code, zero logic changes
═══════════════════════════════════════════════════ */
const UserNavbar = ({ user }) => {
  const navigate     = useNavigate();
  const locationPath = useLocation().pathname;
  const { logout, isLoggedIn, token } = useAuth();

  const { cart }              = useCart();
  const { cartOpen, setCartOpen } = useCart();
  const cartCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);

  const ordersKey   = user ? `orders_${user.id}` : null;
  const ordersCount = useMemo(() => {
    if (!ordersKey) return 0;
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    return orders.length;
  }, [ordersKey]);

  const [notifications, setNotifications]         = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = useMemo(() => {
    if (!Array.isArray(notifications)) return 0;
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery]             = useState("");
  const [suggestions, setSuggestions]             = useState([]);
  const [showUserMenu, setShowUserMenu]           = useState(false);
  const [loggingOut, setLoggingOut]               = useState(false);

  const [location, setLocation] = useState(() => {
    const stored = localStorage.getItem("USER_LOCATION");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.address) return parsed.address;
      } catch {
        console.log("Failed to parse stored location");
      }
    }
    const u = JSON.parse(localStorage.getItem("user"));
    return u?.location || "Detect your location";
  });

  const userMenuRef     = useRef(null);
  const notificationRef = useRef(null);
  const userInitial     = user?.name?.charAt(0).toUpperCase() || "";

  const handleLogoClick = () => navigate(isLoggedIn ? "/user-dashboard" : "/");

  /* FETCH NOTIFICATIONS */
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    let alive = true;
    (async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (alive) setNotifications(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setNotifications([]);
      }
    })();
    return () => { alive = false; };
  }, [locationPath, isLoggedIn, token]);

  // socket.io — uncomment when ready
  // useEffect(() => {
  //   if (!user?.id) return;
  //   socket.emit("join", user.id);
  //   socket.on("new_notification", notification => setNotifications(prev => [notification, ...prev]));
  //   return () => { socket.off("new_notification"); };
  // }, [user?.id]);

  /* MARK ALL AS READ */
  const markAllAsRead = async () => {
    if (!notifications.length) return;
    await Promise.all(
      notifications
        .filter(n => !n.is_read)
        .map(n => fetch(`http://localhost:5000/api/notifications/${n.id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }))
    );
  };

  /* CLOSE ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = e => {
      if (notificationRef.current && !notificationRef.current.contains(e.target))
        setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* DETECT LOCATION */
  const detectLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        try {
          const res  = await fetch(`http://localhost:5000/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          if (!data || !data.address) { alert("Unable to fetch address"); return; }
          const area = data.address.suburb || data.address.neighbourhood || data.address.village || data.address.town || "";
          const city = data.address.city || data.address.town || data.address.state_district || "";
          const address = `${area || "Area"}, ${city}`;
          setLocation(address);
          const locationData = { address, lat, lng };
          localStorage.setItem("USER_LOCATION", JSON.stringify(locationData));
          window.dispatchEvent(new CustomEvent("locationChanged", { detail: locationData }));
          setShowLocationModal(false);
        } catch (err) { console.error(err); alert("Location fetch failed"); }
      },
      () => alert("Location permission denied"),
      { enableHighAccuracy: true }
    );
  };

  const searchAddress = async (query) => {
    if (!query.trim()) { setSuggestions([]); return; }
    try {
      const res  = await fetch(`http://localhost:5000/api/location/search-location?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const formatted = data.map(item => ({ display_name: item.display_name, lat: item.lat, lng: item.lon }));
      setSuggestions(formatted);
    } catch (err) { console.error("Search failed", err); setSuggestions([]); }
  };

  const handleSelectAddress = (place) => {
    const locationData = { address: place.display_name, lat: Number(place.lat), lng: Number(place.lng) };
    setLocation(place.display_name);
    setSuggestions([]);
    localStorage.setItem("USER_LOCATION", JSON.stringify(locationData));
    window.dispatchEvent(new CustomEvent("locationChanged", { detail: locationData }));
    setShowLocationModal(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => { if (searchQuery) searchAddress(searchQuery); }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  /* LOGOUT */
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
      navigate("/", { replace: true });
    }, 1200);
  };

  return (
    <>
      <nav className="navbar navbar--user">

        {/* LEFT */}
        <div className="nav-left">
          <div className="nav-logo" onClick={handleLogoClick}>Messato</div>
          <div className="delivery-section" onClick={() => setShowLocationModal(true)}>
            <span className="delivery-label">Delivery to</span>
            <div className="delivery-address">
              <span className="location-text">{location}</span>
              <span className="arrow">▼</span>
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="nav-center">
          <div className="search-bar">
            <input className="search-input-main" placeholder="Search for Tiffins" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="nav-right">
          {!isLoggedIn && (
            <button className="login-btn user-login" onClick={() => navigate("/user-login")}>Login</button>
          )}
          {isLoggedIn && (
            <div className="nav-icons-wrapper">
              <button
                className={`nav-icon ${showNotifications ? "active" : ""}`}
                onClick={() => { setShowNotifications(p => !p); markAllAsRead(); }}
              >
                <CiBellOn />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>

              <button className="nav-icon" onClick={() => navigate("/my-orders")}>
                <FaBoxOpen />
                {ordersCount > 0 && <span className="badge">{ordersCount}</span>}
              </button>

              <button className="nav-icon" onClick={() => setCartOpen(true)}>
                <FaShoppingCart />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </button>
              <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

              <div className="user-menu" ref={userMenuRef}>
                <button className="user-initial-btn" onClick={() => setShowUserMenu(p => !p)}>
                  {userInitial}
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div onClick={() => navigate("/Profile")}>Profile</div>
                    <div onClick={() => navigate("/user-dashboard")}>Dashboard</div>
                    <div className="logout" onClick={handleLogout}>Logout</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="location-overlay">
          <div className="location-modal">
            <div className="modal-header">
              <h3>Change Location</h3>
              <span onClick={() => setShowLocationModal(false)}>✕</span>
            </div>
            <div className="location-top">
              <button className="detect-btn" onClick={detectLocation}>Detect my location</button>
              <div className="or-divider">OR</div>
              <input type="text" placeholder="Search area..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            </div>
            {suggestions.length > 0 && (
              <div className="suggestion-list">
                {suggestions.map((item) => (
                  <div key={`${item.lat}-${item.lng}`} className="suggestion-item"
                    onClick={() => handleSelectAddress(item)}>
                    <div className="location-icon"><CiLocationOn /></div>
                    <div>
                      <strong>{item.display_name.split(",")[0]}</strong>
                      <p>{item.display_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {loggingOut && (
        <div className="logout-overlay">
          <div className="logout-box"><div className="spinner"></div><p>Logging out…</p></div>
        </div>
      )}

      {showNotifications && (
        <div className="notification-float" ref={notificationRef}>
          <div className="notification-header">Notifications</div>
          {!notifications.length ? (
            <p className="empty">No notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.is_read ? "" : "unread"}`}>
                <p>{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════
   VENDOR NAVBAR
   • No search bar, no delivery location panel
   • Same single "token" from localStorage
   • Left:   Logo + shop name chip
   • Center: Breakfast / Lunch / Dinner toggles
   • Right:  Open/Closed toggle · Bell · Menu · Dashboard · Settings · Avatar
   • Settings drawer: outlet info, location, delivery, tiffin availability
═══════════════════════════════════════════════════ */
const VendorNavbar = ({ vendor: initialVendor }) => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  const [vendor, setVendor]             = useState(initialVendor || {});
  const [isActive, setIsActive]         = useState(Boolean(initialVendor?.is_active));
  const [toggling, setToggling]         = useState(false);
  const [notifications, setNotifs]      = useState([]);
  const [showNotif, setShowNotif]       = useState(false);
  const [showMenu, setShowMenu]         = useState(false);
  const [loggingOut, setLoggingOut]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mealStatus, setMealStatus]     = useState({
    breakfast: Boolean(initialVendor?.breakfast),
    lunch:     Boolean(initialVendor?.lunch),
    dinner:    Boolean(initialVendor?.dinner),
  });

  const [settings, setSettings] = useState({
    shop_name:    initialVendor?.shop_name    || "",
    owner_name:   initialVendor?.owner_name   || "",
    phone:        initialVendor?.phone        || "",
    location:     initialVendor?.location     || "",
    city:         initialVendor?.city         || "",
    area:         initialVendor?.area         || "",
    food_type:    initialVendor?.food_type    || "veg",
    service_type: (() => {
      const st = initialVendor?.service_type;
      if (Array.isArray(st)) return st;
      if (typeof st === "string") { try { return JSON.parse(st); } catch { return []; } }
      return [];
    })(),
    distance: initialVendor?.distance || "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved,   setSettingsSaved] = useState(false);

  const notifRef = useRef(null);
  const menuRef  = useRef(null);

  const shopInitial = vendor?.shop_name?.charAt(0).toUpperCase() || "V";
  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/vendor/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (alive) setNotifs(Array.isArray(data) ? data : []);
      } catch { if (alive) setNotifs([]); }
    })();
    return () => { alive = false; };
  }, [token]);

  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (menuRef.current  && !menuRef.current.contains(e.target))  setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleAvailability = async () => {
    if (toggling) return;
    setToggling(true);
    const newVal = !isActive;
    try {
      const res = await fetch("http://localhost:5000/api/vendor/toggle-active", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: newVal ? 1 : 0 }),
      });
      if (res.ok) {
        setIsActive(newVal);
        const updated = { ...vendor, is_active: newVal ? 1 : 0 };
        setVendor(updated);
        localStorage.setItem("vendor", JSON.stringify(updated));
      }
    } catch { /* silent */ } finally { setToggling(false); }
  };

  const toggleMeal = async (meal) => {
    const newVal = !mealStatus[meal];
    try {
      const res = await fetch("http://localhost:5000/api/vendor/toggle-meal", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ meal, value: newVal ? 1 : 0 }),
      });
      if (res.ok) {
        setMealStatus(prev => ({ ...prev, [meal]: newVal }));
        const updated = { ...vendor, [meal]: newVal ? 1 : 0 };
        setVendor(updated);
        localStorage.setItem("vendor", JSON.stringify(updated));
      }
    } catch { /* silent */ }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("http://localhost:5000/api/vendor/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = { ...vendor, ...settings };
        setVendor(updated);
        localStorage.setItem("vendor", JSON.stringify(updated));
        setSettingsSaved(true);
        setTimeout(() => { setSettingsSaved(false); setShowSettings(false); }, 1500);
      }
    } catch { /* silent */ } finally { setSavingSettings(false); }
  };

  const handleLogout = () => {
    if (!window.confirm("Logout from vendor panel?")) return;
    setLoggingOut(true);
    setTimeout(() => {
      logout();

      setLoggingOut(false);
      navigate("/", { replace: true });
    }, 1200);
  };

  return (
    <>
      <nav className="navbar navbar--vendor">

        {/* LEFT */}
        <div className="nav-left">
          <div className="nav-logo vnd-logo" onClick={() => navigate("/vendor-dashboard")}>
            Messato
            <span className="vnd-badge">Vendor</span>
          </div>
          <div className="vnd-shop-pill">
            <FaStore className="vnd-shop-icon" />
            <div className="vnd-shop-text">
              <span className="vnd-shop-name">{vendor?.shop_name || "My Shop"}</span>
              <span className="vnd-owner-name">{vendor?.owner_name}</span>
            </div>
            <span className={`vnd-live-dot ${isActive ? "live" : "offline"}`} />
          </div>
        </div>

        {/* CENTER */}
        <div className="nav-center vnd-center">
          <div className="vnd-meal-toggles">
            {[
              { key: "breakfast", icon: "🌅", label: "Breakfast" },
              { key: "lunch",     icon: "☀️", label: "Lunch"     },
              { key: "dinner",    icon: "🌙", label: "Dinner"    },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                className={`vnd-meal-btn ${mealStatus[key] ? "on" : "off"}`}
                onClick={() => toggleMeal(key)}
              >
                <span>{icon}</span>
                <span className="vnd-meal-label">{label}</span>
                <span className={`vnd-meal-dot ${mealStatus[key] ? "on" : "off"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="nav-right">
          <div className="nav-icons-wrapper">

            <div className="vnd-avail-wrap">
              <span className={`vnd-avail-label ${isActive ? "open" : "closed"}`}>
                {isActive ? "Open" : "Closed"}
              </span>
              <button
                className={`vnd-toggle ${isActive ? "on" : "off"} ${toggling ? "busy" : ""}`}
                onClick={toggleAvailability}
                disabled={toggling}
              >
                <span className="vnd-toggle-knob" />
              </button>
            </div>

            <button className={`nav-icon vnd-icon ${showNotif ? "active" : ""}`}
              onClick={() => setShowNotif(p => !p)}>
              <CiBellOn />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            <button className="nav-icon vnd-icon" onClick={() => navigate("/vendor-menu")}>
              <MdRestaurantMenu />
            </button>

            <button className="nav-icon vnd-icon" onClick={() => navigate("/vendor-dashboard")}>
              <MdDashboard />
            </button>

            <button className={`nav-icon vnd-icon ${showSettings ? "active" : ""}`}
              onClick={() => setShowSettings(true)}>
              <IoSettingsSharp />
            </button>

            <div className="user-menu" ref={menuRef}>
              <button className="user-initial-btn vnd-avatar" onClick={() => setShowMenu(p => !p)}>
                {shopInitial}
              </button>
              {showMenu && (
                <div className="user-dropdown vnd-dropdown">
                  <div className="vnd-dropdown-top">
                    <span className="vnd-dropdown-name">{vendor?.shop_name}</span>
                    <span className={`vnd-status-pill ${isActive ? "on" : "off"}`}>
                      {isActive ? "● Open" : "● Closed"}
                    </span>
                  </div>
                  <div onClick={() => { navigate("/vendor-profile"); setShowMenu(false); }}>
                    <FaEdit style={{ marginRight: 9 }} />Edit Profile
                  </div>
                  <div onClick={() => { setShowSettings(true); setShowMenu(false); }}>
                    <IoSettingsSharp style={{ marginRight: 9 }} />Settings
                  </div>
                  <div onClick={() => { navigate("/vendor-dashboard"); setShowMenu(false); }}>
                    <MdDashboard style={{ marginRight: 9 }} />Dashboard
                  </div>
                  <div className="logout" onClick={handleLogout}>
                    <FaSignOutAlt style={{ marginRight: 9 }} />Logout
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* VENDOR NOTIFICATIONS */}
      {showNotif && (
        <div className="notification-float vnd-notif" ref={notifRef}>
          <div className="notification-header">
            <span>🔔 Notifications</span>
            {unreadCount > 0 && <span className="vnd-notif-badge">{unreadCount} new</span>}
          </div>
          {!notifications.length
            ? <p className="empty">No notifications yet</p>
            : notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.is_read ? "" : "unread"}`}>
                <p>{n.message}</p>
              </div>
            ))}
        </div>
      )}

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div className="vnd-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSettings(false); }}>
          <div className="vnd-drawer">

            <div className="vnd-drawer-header">
              <div>
                <h2>Outlet Settings</h2>
                <p>Manage your shop, tiffin &amp; delivery details</p>
              </div>
              <button className="vnd-drawer-close" onClick={() => setShowSettings(false)}>
                <MdClose />
              </button>
            </div>

            <div className="vnd-drawer-body">

              {/* Shop Info */}
              <div className="vnd-section">
                <h3><FaStore /> Shop Information</h3>
                <div className="vnd-grid">
                  <div className="vnd-field">
                    <label>Shop Name</label>
                    <input value={settings.shop_name}
                      onChange={e => setSettings(p => ({ ...p, shop_name: e.target.value }))}
                      placeholder="Your shop name" />
                  </div>
                  <div className="vnd-field">
                    <label>Owner Name</label>
                    <input value={settings.owner_name}
                      onChange={e => setSettings(p => ({ ...p, owner_name: e.target.value }))}
                      placeholder="Your full name" />
                  </div>
                  <div className="vnd-field">
                    <label>Phone</label>
                    <input value={settings.phone}
                      onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="vnd-field">
                    <label>Food Type</label>
                    <select value={settings.food_type}
                      onChange={e => setSettings(p => ({ ...p, food_type: e.target.value }))}>
                      <option value="veg">Veg Only</option>
                      <option value="nonveg">Non-Veg Only</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="vnd-section">
                <h3><CiLocationOn /> Location &amp; Area</h3>
                <div className="vnd-grid">
                  <div className="vnd-field vnd-field--full">
                    <label>Full Address</label>
                    <input value={settings.location}
                      onChange={e => setSettings(p => ({ ...p, location: e.target.value }))}
                      placeholder="Shop address" />
                  </div>
                  <div className="vnd-field">
                    <label>City</label>
                    <input value={settings.city}
                      onChange={e => setSettings(p => ({ ...p, city: e.target.value }))}
                      placeholder="City" />
                  </div>
                  <div className="vnd-field">
                    <label>Area / Locality</label>
                    <input value={settings.area}
                      onChange={e => setSettings(p => ({ ...p, area: e.target.value }))}
                      placeholder="Area" />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="vnd-section">
                <h3><FaMotorcycle /> Delivery Settings</h3>
                <div className="vnd-grid">
                  <div className="vnd-field">
                    <label>Delivery Radius (km)</label>
                    <input type="number" min="1" max="20" value={settings.distance}
                      onChange={e => setSettings(p => ({ ...p, distance: e.target.value }))}
                      placeholder="e.g. 5" />
                  </div>
                  <div className="vnd-field">
                    <label>Service Type</label>
                    <div className="vnd-checks">
                      {["delivery", "pickup", "both"].map(type => (
                        <label key={type} className="vnd-check">
                          <input type="checkbox"
                            checked={Array.isArray(settings.service_type) && settings.service_type.includes(type)}
                            onChange={e => {
                              const arr = Array.isArray(settings.service_type) ? [...settings.service_type] : [];
                              setSettings(p => ({
                                ...p,
                                service_type: e.target.checked
                                  ? [...arr, type]
                                  : arr.filter(t => t !== type),
                              }));
                            }}
                          />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiffin availability */}
              <div className="vnd-section">
                <h3><FaUtensils /> Tiffin Availability</h3>
                <div className="vnd-meal-cards">
                  {[
                    { key: "breakfast", icon: "🌅", label: "Breakfast" },
                    { key: "lunch",     icon: "☀️", label: "Lunch"     },
                    { key: "dinner",    icon: "🌙", label: "Dinner"    },
                  ].map(({ key, icon, label }) => (
                    <div key={key}
                      className={`vnd-meal-card ${mealStatus[key] ? "on" : "off"}`}
                      onClick={() => toggleMeal(key)}
                    >
                      <span className="vnd-meal-card-icon">{icon}</span>
                      <span className="vnd-meal-card-label">{label}</span>
                      <span className={`vnd-meal-card-tag ${mealStatus[key] ? "on" : "off"}`}>
                        {mealStatus[key] ? "Active" : "Off"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="vnd-drawer-footer">
              <button className="vnd-btn-cancel" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="vnd-btn-save" onClick={saveSettings} disabled={savingSettings}>
                {savingSettings ? <span className="vnd-spin" /> : <MdSave />}
                {settingsSaved ? "Saved ✓" : savingSettings ? "Saving…" : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {loggingOut && (
        <div className="logout-overlay">
          <div className="logout-box"><div className="spinner"></div><p>Logging out…</p></div>
        </div>
      )}
    </>
  );
};

export default Navbar;
