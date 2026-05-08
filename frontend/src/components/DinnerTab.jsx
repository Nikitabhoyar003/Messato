import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import RestaurantCard from "../components/RestaurantCard";
import FilterBar from "../components/filterbar";
import "./breakfastTab.css";

const getGreeting = (h) => {
  if (h < 15) return { title: "Plan Tonight's Dinner", sub: "Pre-order so it's hot when you're home 🌆" };
  if (h < 18) return { title: "Evening's Coming 🌇",   sub: "Order before your favourite sells out" };
  if (h < 21) return { title: "Dinner Time! 🌙",       sub: "Warm tiffins ready near you 🍲" };
  return        { title: "Night Cravings?",             sub: "See what's still available near you 🌙" };
};

const FLOATERS = [
  { e: "🍲", x: "9%",  y: "20%" },
  { e: "🫕", x: "79%", y: "26%" },
  { e: "🍜", x: "51%", y: "60%" },
  { e: "🌙", x: "23%", y: "68%" },
  { e: "🫙", x: "86%", y: "72%" },
];

const DinnerTab = () => {
  const [data, setData]                   = useState([]);
  const [filteredData, setFilteredData]   = useState([]);
  const [menuScope, setMenuScope]         = useState("daily");
  const [loading, setLoading]             = useState(false);
  const [liveTime, setLiveTime]           = useState("");

  const [userLocation, setUserLocation] = useState(() => {
    const s = localStorage.getItem("USER_LOCATION");
    return s ? JSON.parse(s) : null;
  });

  const { todayDate, currentMonth, currentDay, currentWeek } = useMemo(() => {
    const t = new Date();
    const getWk = (d) => {
      const j = new Date(d.getFullYear(), 0, 1);
      return Math.ceil(((d - j) / 86400000 + j.getDay() + 1) / 7);
    };
    return {
      todayDate:    t.toISOString().split("T")[0],
      currentMonth: t.toLocaleString("default", { month: "long" }),
      currentDay:   t.toLocaleString("default", { weekday: "long" }),
      currentWeek:  getWk(t),
    };
  }, []);

  const greeting = useMemo(() => getGreeting(new Date().getHours()), []);

  useEffect(() => {
    const tick = () => setLiveTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onLoc = (e) => setUserLocation(e.detail);
    window.addEventListener("locationChanged", onLoc);
    return () => window.removeEventListener("locationChanged", onLoc);
  }, []);

  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng) return;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/menu/nearby", {
          params: {
            mealType: "Dinner",
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 1,
            menuScope,
            date: todayDate,
            weekNumber: currentWeek,
            dayOfWeek: currentDay,
            monthName: currentMonth,
          },
        });
        const live = (res.data || []).filter((item) => {
          if (item.menu_scope === "Daily" && item.menu_date) return item.menu_date >= todayDate;
          return true;
        });
        setData(live);
        setFilteredData(live);
      } catch (e) {
        console.error("Dinner fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [userLocation, menuScope, todayDate, currentWeek, currentDay, currentMonth]);

  const applyFilters = (filters) => {
    let f = [...data];
    if (filters.foodType !== "all")
      f = f.filter((i) => i.food_type?.toLowerCase() === (filters.foodType === "nonveg" ? "non-veg" : "veg"));
    if (filters.rating > 0)
      f = f.filter((i) => Number(i.rating || 0) >= filters.rating);
    if (filters.cuisines?.length > 0)
      f = f.filter((i) => i.cuisine && filters.cuisines.some((c) => c.toLowerCase() === i.cuisine.toLowerCase()));
    if (filters.priceOrder === "asc")  f.sort((a, b) => a.price - b.price);
    if (filters.priceOrder === "desc") f.sort((a, b) => b.price - a.price);
    setFilteredData(f);
  };

  return (
    <div className="tab-page tab-page--dinner">

      {/* HERO */}
      <div className="tab-hero tab-hero--dinner">
        <div className="tab-orb tab-orb-1" />
        <div className="tab-orb tab-orb-2" />
        <div className="tab-orb tab-orb-3" />

        <div className="tab-floaters" aria-hidden>
          {FLOATERS.map((f, i) => (
            <span key={i} style={{ "--fx": f.x, "--fy": f.y, "--fd": `${i * 0.5}s` }}>{f.e}</span>
          ))}
        </div>

        <div className="tab-hero-inner">
          <span className="tab-hero-eyebrow">🌙 Dinner Tiffins</span>
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
          {[{ key: "daily", label: "Today", icon: "📅" }, { key: "weekly", label: "Weekly", icon: "🗓" }, { key: "monthly", label: "Monthly", icon: "📆" }].map(({ key, label, icon }) => (
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
            {[...Array(6)].map((_, i) => <div key={i} className="tab-skeleton" style={{ "--si": i }} />)}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="tab-empty">
            <span className="tab-empty-icon">🌙</span>
            <h3>No Dinner Available</h3>
            <p>Try switching to Weekly, or look for vendors nearby.</p>
          </div>
        ) : (
          <div className="tab-grid">
            {filteredData.map((item, i) => (
              <div key={item.id} className="tab-card-anim" style={{ "--ci": i }}>
                <RestaurantCard restaurant={{ ...item, meal_time: "Dinner" }} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DinnerTab;
