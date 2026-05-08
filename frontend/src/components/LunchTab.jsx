import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import RestaurantCard from "../components/RestaurantCard";
import FilterBar from "../components/filterbar";
import "./breakFastTab.css";

const getGreeting = (h) => {
  if (h < 11) return { title: "Plan Your Lunch",      sub: "Order early before tiffins sell out 🌤" };
  if (h < 14) return { title: "It's Lunch Time! ☀️",  sub: "Fresh tiffins are ready near you" };
  if (h < 17) return { title: "Afternoon Cravings?",  sub: "Still time to grab a great lunch 🍱" };
  return        { title: "Planning Ahead?",            sub: "Pre-order tomorrow's lunch today 🌙" };
};

const FLOATERS = [
  { e: "🍛", x: "8%",  y: "20%" },
  { e: "🥘", x: "80%", y: "28%" },
  { e: "🫓", x: "52%", y: "62%" },
  { e: "🥗", x: "22%", y: "70%" },
  { e: "🍱", x: "87%", y: "68%" },
];

const LunchTab = () => {
  const [data, setData]                 = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [menuScope, setMenuScope]       = useState("daily");
  const [loading, setLoading]           = useState(false);
  const [liveTime, setLiveTime]         = useState("");

  const [userLocation, setUserLocation] = useState(() => {
    const s = localStorage.getItem("USER_LOCATION");
    return s ? JSON.parse(s) : null;
  });

  const { todayDate, currentMonth } = useMemo(() => {
    const t = new Date();
    return {
      todayDate:    t.toISOString().split("T")[0],           // "2026-02-27"
      currentMonth: t.toLocaleString("default", { month: "long" }), // "February"
    };
  }, []);

  const currentDay = useMemo(() =>
    new Date().toLocaleString("default", { weekday: "long" }), // "Friday"
  []);

  const greeting = useMemo(() => getGreeting(new Date().getHours()), []);

  /* live clock */
  useEffect(() => {
    const tick = () =>
      setLiveTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  /* location change listener */
  useEffect(() => {
    const onLoc = (e) => setUserLocation(e.detail);
    window.addEventListener("locationChanged", onLoc);
    return () => window.removeEventListener("locationChanged", onLoc);
  }, []);

  /* ─── FETCH ─── */
  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        /*
          daily   → backend: menu_scope='Daily'   AND menu_date <= today
          weekly  → backend: menu_scope='Weekly'  (all days Mon–Sun)
          monthly → backend: menu_scope='Monthly' AND month_name = currentMonth
        */
        const res = await axios.get("http://localhost:5000/api/menu/nearby", {
          params: {
            mealType:  "Lunch",
            lat:       userLocation.lat,
            lng:       userLocation.lng,
            radius:    1,
            menuScope,                  // "daily" | "weekly" | "monthly"
            date:      todayDate,       // used by daily
            monthName: currentMonth,    // used by monthly
          },
        });

        const items = res.data || [];
        setData(items);
        setFilteredData(items);
      } catch (e) {
        console.error("Lunch fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation, menuScope, todayDate, currentMonth]);

  /* ─── FILTERS ─── */
  const applyFilters = (filters) => {
    let f = [...data];
    if (filters.foodType !== "all")
      f = f.filter((i) =>
        i.food_type?.toLowerCase() === (filters.foodType === "nonveg" ? "non-veg" : "veg")
      );
    if (filters.rating > 0)
      f = f.filter((i) => Number(i.rating || 0) >= filters.rating);
    if (filters.cuisines?.length > 0)
      f = f.filter((i) =>
        i.cuisine && filters.cuisines.some((c) => c.toLowerCase() === i.cuisine.toLowerCase())
      );
    if (filters.priceOrder === "asc")  f.sort((a, b) => a.price - b.price);
    if (filters.priceOrder === "desc") f.sort((a, b) => b.price - a.price);
    setFilteredData(f);
  };

  return (
    <div className="tab-page tab-page--lunch">

      {/* HERO */}
      <div className="tab-hero tab-hero--lunch">
        <div className="tab-orb tab-orb-1" />
        <div className="tab-orb tab-orb-2" />
        <div className="tab-orb tab-orb-3" />

        <div className="tab-floaters" aria-hidden>
          {FLOATERS.map((f, i) => (
            <span key={i} style={{ "--fx": f.x, "--fy": f.y, "--fd": `${i * 0.5}s` }}>{f.e}</span>
          ))}
        </div>

        <div className="tab-hero-inner">
          <span className="tab-hero-eyebrow">☀️ Lunch Tiffins</span>
          <h1 className="tab-hero-title">{greeting.title}</h1>
          <p className="tab-hero-sub">{greeting.sub}</p>
        </div>

        <div className="tab-hero-time">
          <span className="tab-hero-time-dot" />
          {liveTime} · {currentDay}
        </div>
      </div>

      {/* SCOPE TOGGLE */}
      <div className="tab-scope">
        <div className="tab-scope-track">
          {[
            { key: "daily",   label: "Today",   icon: "📅" },
            { key: "weekly",  label: "Weekly",  icon: "🗓" },
            { key: "monthly", label: "Monthly", icon: "📆" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={`tab-scope-btn ${menuScope === key ? "active" : ""}`}
              onClick={() => setMenuScope(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER */}
      <div className="tab-filter">
        <FilterBar data={data} setFilteredData={setFilteredData} onApply={applyFilters} />
      </div>

      {/* COUNT */}
      {!loading && filteredData.length > 0 && (
        <div className="tab-count">
          <span className="tab-count-dot" />
          {filteredData.length} tiffin{filteredData.length !== 1 ? "s" : ""} near you
        </div>
      )}

      {/* GRID */}
      <div className="tab-body">
        {loading ? (
          <div className="tab-skeletons">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="tab-skeleton" style={{ "--si": i }} />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="tab-empty">
            <span className="tab-empty-icon">🍽</span>
            <h3>No Lunch Available</h3>
            <p>Try switching to Weekly, or check back later.</p>
          </div>
        ) : (
          <div className="tab-grid">
            {filteredData.map((item, i) => (
              <div key={item.id} className="tab-card-anim" style={{ "--ci": i }}>
                <RestaurantCard restaurant={{ ...item, meal_time: "Lunch" }} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default LunchTab;
