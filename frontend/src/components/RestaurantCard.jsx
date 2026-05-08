import { useNavigate } from "react-router-dom";
import { useCart } from "../components/useCart";
import { useState, useRef } from "react";
import "./RestaurantCard.css";

const TODAY = new Date().toISOString().split("T")[0];

/* Format:  "Mon, 3 Mar" */
const fmtDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

/* Returns { label, sub, cls } or null */
const resolveDateBadge = (menu_date, menu_scope, week_number, day_of_week) => {
  // Daily with actual date
  if (menu_date) {
    if (menu_date === TODAY)
      return { label: "Today",    sub: fmtDate(menu_date), cls: "today" };
    const diff = Math.round((new Date(menu_date) - new Date(TODAY)) / 86400000);
    if (diff === 1)
      return { label: "Tomorrow", sub: fmtDate(menu_date), cls: "tomorrow" };
    if (diff > 1)
      return { label: fmtDate(menu_date), sub: "Upcoming",   cls: "future" };
    // past — don't show
    return null;
  }
  // Weekly without a specific date
  if (menu_scope === "Weekly") {
    const parts = [];
    if (week_number) parts.push(`Week ${week_number}`);
    if (day_of_week) parts.push(day_of_week);
    if (parts.length)
      return { label: parts.join(" · "), sub: "Weekly Menu", cls: "weekly" };
  }
  return null;
};

const getMealIcon = (t) => {
  switch (t?.toLowerCase()) {
    case "breakfast": return "🌅";
    case "lunch":     return "☀️";
    case "dinner":    return "🌙";
    default:          return "🍱";
  }
};

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const { cart, addToCart, updateQty } = useCart();

  const images = Array.isArray(restaurant.images)
    ? restaurant.images.filter(Boolean)
    : restaurant.image ? [restaurant.image] : [];

  const [idx, setIdx]   = useState(0);
  const ticker          = useRef(null);

  if (!restaurant?.id || !restaurant.name || images.length === 0) return null;

  const firstImage  = images[0];
  const cartItem    = cart.find((c) => c.id === restaurant.id);
  const isAvailable = restaurant.is_available !== 0 && restaurant.is_available !== false;
  const isVeg       = restaurant.food_type?.toLowerCase().includes("veg") &&
                      !restaurant.food_type?.toLowerCase().includes("non");
  const mealType    = restaurant.meal_type || restaurant.meal_time;

  const dateBadge = resolveDateBadge(
    restaurant.menu_date,
    restaurant.menu_scope,
    restaurant.week_number,
    restaurant.day_of_week
  );

  const handleEnter = () => {
    if (images.length <= 1) return;
    ticker.current = setInterval(() => setIdx((p) => (p + 1) % images.length), 650);
  };
  const handleLeave = () => { clearInterval(ticker.current); setIdx(0); };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!mealType) { alert("Meal time not selected"); return; }
    addToCart({
      id: restaurant.id,
      vendor_id: restaurant.vendor_id,
      name: restaurant.name,
      price: Number(restaurant.price || 0),
      image: firstImage,
      meal_time: mealType,
    });
    window.dispatchEvent(new CustomEvent("show-cart-popup", {
      detail: { name: restaurant.name, price: restaurant.price, image: firstImage },
    }));
  };

  return (
    <div
      className={`rc ${!isAvailable ? "rc--dim" : ""}`}
      onClick={() => navigate(`/card-details/${restaurant.id}`)}
    >

      {/* ── IMAGE ── */}
      <div className="rc__img-wrap" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        {images.map((img, i) => (
          <img key={i} src={img} alt="food"
            className={`rc__img ${i === idx ? "rc__img--on" : ""}`}
            draggable={false}
          />
        ))}
        <div className="rc__scrim" />

        {/* Veg / Non-Veg badge */}
        {restaurant.food_type && (
          <span className={`rc__veg ${isVeg ? "rc__veg--v" : "rc__veg--nv"}`}>
            <i className="rc__veg-dot" />
            {isVeg ? "Veg" : "Non‑Veg"}
          </span>
        )}

        {restaurant.offer && <span className="rc__offer">{restaurant.offer}</span>}
        {!isAvailable && <div className="rc__unavail">Unavailable</div>}

        {isAvailable && (
          !cartItem
            ? <button className="rc__add" onClick={handleAdd}>+ Add</button>
            : (
              <div className="rc__qty" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => updateQty(restaurant.id, "dec")}>−</button>
                <span>{cartItem.quantity}</span>
                <button onClick={() => updateQty(restaurant.id, "inc")}>+</button>
              </div>
            )
        )}
      </div>

      {/* ── DATE BADGE — only shows when data exists ── */}
      {dateBadge && (
        <div className={`rc__date rc__date--${dateBadge.cls}`}>
          <div className="rc__date-left">
            <span className="rc__date-label">{dateBadge.label}</span>
            <span className="rc__date-sub">{dateBadge.sub}</span>
          </div>
          <span className="rc__date-icon">
            {dateBadge.cls === "today" ? "✅" :
             dateBadge.cls === "tomorrow" ? "🔔" :
             dateBadge.cls === "weekly" ? "🗓" : "📅"}
          </span>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="rc__body">

        <div className="rc__top">
          <h4 className="rc__name">{restaurant.name}</h4>
          {restaurant.rating != null && (
            <span className="rc__rating">⭐ {Number(restaurant.rating).toFixed(1)}</span>
          )}
        </div>

        {(restaurant.cuisine || restaurant.category) && (
          <p className="rc__meta">
            {[restaurant.cuisine, restaurant.category].filter(Boolean).join(" · ")}
          </p>
        )}

        {restaurant.description && (
          <p className="rc__desc">{restaurant.description}</p>
        )}

        {mealType && (
          <div className="rc__pills">
            <span className="rc__pill">
              {getMealIcon(mealType)} {mealType}
            </span>
            {restaurant.day_of_week && restaurant.menu_scope === "Weekly" && (
              <span className="rc__pill rc__pill--day">📆 {restaurant.day_of_week}</span>
            )}
          </div>
        )}

        <div className="rc__footer">
          <span className="rc__price">₹{Number(restaurant.price)}</span>
          <span className={`rc__avail ${isAvailable ? "rc__avail--on" : "rc__avail--off"}`}>
            {isAvailable ? "● Available" : "● Unavailable"}
          </span>
        </div>

      </div>
    </div>
  );
};

export default RestaurantCard;
