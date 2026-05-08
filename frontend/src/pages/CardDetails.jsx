import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useCart } from "../components/useCart";
import Navbar from "../components/navbar";
import "./CardDetails.css";

const CardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, updateQty } = useCart();

  const [item, setItem] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [toast, setToast] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailRef = useRef(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/menu/item/${id}`)
      .then((res) => setItem(res.data))
      .catch(() => setItem(null));
  }, [id]);

  useEffect(() => {
    if (!item?.id) return;
    axios
      .get(`http://localhost:5000/api/menu/suggestions/${item.id}`)
      .then((res) => setSuggestions(res.data || []))
      .catch(() => setSuggestions([]));
  }, [item]);

  // AUTO SLIDE
// Replace your auto-slide useEffect with this:
useEffect(() => {
  if (!item) return;

  const imgs = (() => {
    try {
      const parsed = JSON.parse(item.image);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [item.image];
    } catch {
      return item.image
        ? item.image.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }
  })();

  if (imgs.length <= 1) return;

  const timer = setInterval(() => {
    setActiveIndex((prev) => (prev + 1) % imgs.length);
  }, 3000);

  return () => clearInterval(timer);
}, [item]); // ✅ only depends on item

  if (!item) return <div className="pdp-loading">Loading...</div>;

  // Parse images
  const images = (() => {
    try {
      const parsed = JSON.parse(item.image);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [item.image];
    } catch {
      return item.image
        ? item.image.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }
  })();

  const cartItem = cart.find((c) => c.id === item.id);
  const vendorName = item.shop_name || item.restaurant_name || "Tiffin Service";
  const mealTime = item.meal_type || item.time || "Anytime";
  const isVeg = item.food_type?.toLowerCase().includes("veg") &&
    !item.food_type?.toLowerCase().includes("non");

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      vendor_id: Number(item.vendor_id),
      name: item.name,
      price: Number(item.price),
      image: images[0],
      meal_time: item.meal_type || item.time,
    });
    window.dispatchEvent(new CustomEvent("show-cart-popup", {
      detail: { name: item.name, price: item.price, image: images[0] },
    }));
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handleThumbClick = (i) => {
    setActiveIndex(i);
    thumbnailRef.current?.children[i]?.scrollIntoView({
      behavior: "smooth", block: "nearest", inline: "center",
    });
  };

  return (
    <>
    <div className="page-with-navbar">
      <Navbar />

      <div className="pdp-wrapper">
        <div className="pdp-breadcrumb">
          Home / {item.cuisine} / {vendorName}
        </div>

        <div className="pdp-container">

          {/* ── LEFT: IMAGE SLIDER ── */}
          <div className="pdp-left">

            {/* MAIN IMAGE */}
            <div className="pdp-main-image">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={item.name}
                  className={`main-img ${i === activeIndex ? "active" : ""}`}
                />
              ))}

              {/* BADGES ON IMAGE */}
              {item.food_type && (
                <span className={`pdp-food-badge ${isVeg ? "veg" : "nonveg"}`}>
                  <span className="badge-dot" />
                  {isVeg ? "Veg" : "Non-Veg"}
                </span>
              )}

              {/* PREV/NEXT */}
              {images.length > 1 && (
                <>
                  <button
                    className="img-nav left"
                    onClick={() =>
                      setActiveIndex((activeIndex - 1 + images.length) % images.length)
                    }
                  >‹</button>
                  <button
                    className="img-nav right"
                    onClick={() =>
                      setActiveIndex((activeIndex + 1) % images.length)
                    }
                  >›</button>
                </>
              )}
            </div>

            {/* THUMBNAIL STRIP */}
            {images.length > 1 && (
              <div className="pdp-thumbnails" ref={thumbnailRef}>
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`thumb-${i}`}
                    className={`thumb ${i === activeIndex ? "active" : ""}`}
                    onClick={() => handleThumbClick(i)}
                  />
                ))}
              </div>
            )}

            {/* ADD / QTY */}
            {!cartItem ? (
              <button className="pdp-add-btn" onClick={handleAddToCart}>
                + Add to Cart
              </button>
            ) : (
              <div className="pdp-qty-control">
                <button onClick={() => updateQty(item.id, "dec")}>−</button>
                <span>{cartItem.quantity}</span>
                <button onClick={() => updateQty(item.id, "inc")}>+</button>
              </div>
            )}

            {/* VENDOR CARD */}
            <div className="vendor-card">
              <div className="vendor-avatar">{vendorName.charAt(0)}</div>
              <div className="vendor-info">
                <h4>{vendorName}</h4>
                <p className="vendor-type">Home-style tiffin service</p>
                {item.location && (
                  <span className="vendor-loc">📍 {item.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: DETAILS ── */}
          <div className="pdp-right">

            <h1 className="pdp-title">{item.name}</h1>

            <div className="pdp-meta-row">
              <span className="pdp-vendor">{vendorName}</span>
              {item.location && <span className="pdp-location">📍 {item.location}</span>}
            </div>

            <div className="pdp-rating-row">
              {item.rating && (
                <span className="pdp-rating">⭐ {Number(item.rating).toFixed(1)}</span>
              )}
              <span className="pdp-meal-tag">{mealTime}</span>
              {item.cuisine && <span className="pdp-cuisine-tag">{item.cuisine}</span>}
            </div>

            {item.description && (
              <p className="pdp-description">{item.description}</p>
            )}

            <div className="pdp-price-box">
              <span className="pdp-price">₹{Number(item.price)}</span>
              <span className="pdp-tax-note">Inclusive of all taxes</span>
            </div>

            {/* ABOUT */}
            <div className="pdp-info-card">
              <h3>About this item</h3>
              <div className="info-row">
                <span>Prepared by</span>
                <strong>{vendorName}</strong>
              </div>
              <div className="info-row">
                <span>Best for</span>
                <strong>{mealTime}</strong>
              </div>
              <div className="info-row">
                <span>Cuisine</span>
                <strong>{item.cuisine || "—"}</strong>
              </div>
              {item.category && (
                <div className="info-row">
                  <span>Category</span>
                  <strong>{item.category}</strong>
                </div>
              )}
              <div className="info-row">
                <span>Serving</span>
                <strong>Single portion</strong>
              </div>
              <div className="info-row">
                <span>Food type</span>
                <strong>{item.food_type || "—"}</strong>
              </div>
            </div>

            {/* WHY ORDER */}
            <div className="pdp-info-card subtle">
              <h3>Why order this?</h3>
              <div className="why-grid">
                <div className="why-item">⭐ {item.rating || "New"} rated</div>
                <div className="why-item">🚚 Fast delivery</div>
                <div className="why-item">🍳 Freshly prepared</div>
                <div className="why-item">🛡️ Hygienic kitchen</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SUGGESTIONS ── */}
        {suggestions.length > 0 && (
          <div className="pdp-suggestions">
            <h3>You may also like</h3>
            <div className="suggestion-grid">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="suggestion-card"
                  onClick={() => navigate(`/card-details/${s.id}`)}
                >
                  <div className="suggestion-img-wrap">
                    <img src={s.image} alt={s.name} />
                  </div>
                  <div className="suggestion-body">
                    <h4>{s.name}</h4>
                    <p>{s.shop_name}</p>
                    <span>₹{s.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {toast && <div className="pdp-toast">✅ Added to cart</div>}
    </>
  );
};

export default CardDetails;