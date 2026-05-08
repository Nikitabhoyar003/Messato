import { useState, useEffect, useCallback } from "react";
import API from "../utils/api";
import "./VendorMenuPage.css";

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const isLocked   = (d) => !!d && d <= todayStr();
const isPastDay  = (d) => {
  if (!d) return false;
  const a = new Date(d); a.setHours(0, 0, 0, 0);
  const b = new Date();  b.setHours(0, 0, 0, 0);
  return a < b;
};
const isTodayDay = (d) => d === todayStr();

const parseImages = (f) => {
  try { const p = JSON.parse(f); return Array.isArray(p) ? p : []; }
  catch { return f ? [f] : []; }
};

const getWeekDates = (offset = 0) => {
  const now = new Date();
  const dow  = now.getDay();
  const diff = now.getDate() - dow + (dow === 0 ? -6 : 1) + offset * 7;
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
};

const WEEK_DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const ALL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// const MEAL_TIMES = { Breakfast1: "6 AM – 10 AM", Lunch2: "11 AM – 4 PM", Dinner3: "6 AM – 11 PM" };
const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" };

/* ══════════════════════════════════════════════
   MENU CARD
══════════════════════════════════════════════ */
function MenuCard({ item, onEdit, onDelete }) {
  const images = parseImages(item.image);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgErr, setImgErr] = useState(false);

  const locked  = isLocked(item.menu_date);
  const pastIt  = isPastDay(item.menu_date);
  const todayIt = isTodayDay(item.menu_date);

  const scopeClass = {
    Daily:   "vm-scope-daily",
    Weekly:  "vm-scope-weekly",
    Monthly: "vm-scope-monthly",
  }[item.menu_scope] || "vm-scope-daily";

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() =>
      setImgIdx(p => (p + 1) % images.length), 3500
    );
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={`vm-menu-card${locked ? " vm-locked" : ""}`}>
      {todayIt && <div className="vm-card-today-badge">TODAY</div>}
      {pastIt && (
        <div className="vm-card-lock-overlay">
          <div className="vm-card-lock-pill">🔒 PAST MENU</div>
        </div>
      )}

      {/* IMAGE */}
      <div className="vm-card-img-wrap">
        {images[imgIdx] && !imgErr ? (
          <>
            <img
              src={images[imgIdx]}
              alt={item.name}
              onError={() => setImgErr(true)}
            />
            <div className="vm-card-img-overlay" />
          </>
        ) : (
          <div className="vm-card-img-fallback">🍱</div>
        )}
        <div className={`vm-veg-badge ${item.food_type === "Veg" ? "vm-veg" : "vm-nonveg"}`}>
          {item.food_type === "Veg" ? "🟢 VEG" : "🔴 NON-VEG"}
        </div>
      </div>

      {/* BODY */}
      <div className="vm-card-body">
        <div className="vm-card-top">
          <div className="vm-card-name">{item.name}</div>
          <div className="vm-card-price">₹{item.price}</div>
        </div>
        <div className="vm-card-desc">{item.description}</div>
        <div className="vm-card-badges">
          <span className={`vm-scope-badge ${scopeClass}`}>{item.menu_scope}</span>
          <span className="vm-meal-badge">{MEAL_ICONS[item.meal_type]} {item.meal_type}</span>
          {item.cuisine && <span className="vm-meal-badge">🍴 {item.cuisine}</span>}
        </div>
        <div className="vm-card-meta">
          <span>📅 {fmtDate(item.menu_date)}</span>
          <span className="vm-card-meta-dot">•</span>
         
        </div>
        <div className="vm-card-actions">
          <button className="vm-edit-btn"   disabled={locked} onClick={() => onEdit(item)}>✏️ Edit</button>
          <button className="vm-delete-btn" disabled={locked} onClick={() => onDelete(item.id)}>🗑️ Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CALENDAR STRIP
══════════════════════════════════════════════ */
function CalendarStrip({ selectedDate, onSelectDate, menuList }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const days = getWeekDates(weekOffset);

  const countByDate = {};
  menuList.forEach(item => {
    if (item.menu_date) countByDate[item.menu_date] = (countByDate[item.menu_date] || 0) + 1;
  });

  return (
    <div className="vm-calendar">
      <div className="vm-cal-header">
        <button className="vm-cal-nav" onClick={() => setWeekOffset(o => o - 1)}>‹</button>
        <span className="vm-cal-range">{fmtDate(days[0])} — {fmtDate(days[6])}</span>
        <button className="vm-cal-nav" onClick={() => setWeekOffset(o => o + 1)}>›</button>
      </div>

      <div className="vm-cal-days-grid">
        {days.map((d, i) => {
          const isSelected = d === selectedDate;
          const isToday2   = isTodayDay(d);
          const isPast2    = d < todayStr();
          const count      = countByDate[d] || 0;

          const cls = [
            "vm-cal-day-btn",
            isSelected          ? "vm-cal-selected" : "",
            isToday2 && !isSelected ? "vm-cal-today" : "",
            isPast2             ? "vm-cal-past"     : "",
          ].filter(Boolean).join(" ");

          return (
            <button
              key={d}
              className={cls}
              onClick={() => onSelectDate(d === selectedDate ? null : d)}
            >
              <div className="vm-cal-dow">{WEEK_DAYS[i].slice(0, 3)}</div>
              <div className="vm-cal-day-num">{new Date(d).getDate()}</div>
              {count > 0 && <div className="vm-cal-dot">{count}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADD / EDIT MODAL
══════════════════════════════════════════════ */
function MenuModal({ isEditing, form, setForm, onSave, onClose, saving }) {
  const [previews, setPreviews] = useState([]);

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const d = new Date(val);
    setForm(f => ({
      ...f,
      menu_date: val,
      dayOfWeek: d.toLocaleString("en-US", { weekday: "long" }),
      monthName: d.toLocaleString("en-US", { month:   "long" }),
    }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!isEditing && (files.length < 2 || files.length > 4)) {
      alert("Please select 2–4 images"); return;
    }
    if (isEditing && files.length > 4) {
      alert("Max 4 images allowed"); return;
    }
    setForm(f => ({ ...f, _files: files }));
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  return (
    <div className="vm-modal-overlay" onClick={onClose}>
      <div className="vm-modal" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="vm-modal-header">
          <div>
            <div className="vm-modal-title">
              {isEditing ? "✏️ Edit Menu Item" : "🍽️ Add Menu Item"}
            </div>
            <div className="vm-modal-sub">Messato Tiffin Service · Vendor Portal</div>
          </div>
          <button className="vm-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* SCOPE */}
        <div className="vm-field">
          <label className="vm-label">Menu Scope</label>
          <div className="vm-pill-row">
            {["Daily", "Weekly", "Monthly"].map(s => (
              <button
                key={s}
                className={`vm-pill-btn${form.menuScope === s ? " vm-pill-active" : ""}`}
                onClick={() => setForm(f => ({ ...f, menuScope: s }))}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* FOOD NAME */}
        <div className="vm-field">
          <label className="vm-label">Food Name *</label>
          <input
            className="vm-input"
            placeholder="e.g. Dal Baati Churma"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="vm-field">
          <label className="vm-label">Description</label>
          <textarea
            className="vm-textarea"
            rows={3}
            placeholder="Short appetizing description..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* PRICE + CUISINE */}
        <div className="vm-two-col">
          <div>
            <label className="vm-label">Price (₹) *</label>
            <input
              className="vm-input"
              type="number"
              placeholder="0"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div>
            <label className="vm-label">Cuisine</label>
            <input
              className="vm-input"
              placeholder="e.g. Punjabi"
              value={form.cuisine}
              onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}
            />
          </div>
        </div>

        {/* MEAL TYPE */}
        <div className="vm-field">
          <label className="vm-label">Meal Type</label>
          <div className="vm-pill-row">
            {["Breakfast", "Lunch", "Dinner"].map(m => (
              <button
                key={m}
                className={`vm-pill-btn${form.mealType === m ? " vm-pill-active" : ""}`}
                onClick={() => setForm(f => ({ ...f, mealType: m }))}
              >
                {MEAL_ICONS[m]} {m}
              </button>
            ))}
          </div>
        </div>

        {/* FOOD TYPE */}
        <div className="vm-field">
          <label className="vm-label">Food Type</label>
          <div className="vm-pill-row">
            {["Veg", "Non-Veg"].map(ft => (
              <button
                key={ft}
                className={`vm-pill-btn${form.foodType === ft ? " vm-pill-active" : ""}`}
                onClick={() => setForm(f => ({ ...f, foodType: ft }))}
              >
                {ft === "Veg" ? "🟢" : "🔴"} {ft}
              </button>
            ))}
          </div>
        </div>

        {/* DATE */}
        <div className="vm-field">
          <label className="vm-label">
            📅 Menu Date *
            <span className="vm-label-note"> (minimum: tomorrow)</span>
          </label>
          <input
            type="date"
            className="vm-date-input"
            min={minDate}
            value={form.menu_date}
            onChange={handleDateChange}
          />
          {form.menu_date && (
            <div className="vm-date-hint">
              {form.dayOfWeek && `📆 ${form.dayOfWeek}`}
              {form.dayOfWeek && form.monthName && " · "}
              {form.monthName && `📖 ${form.monthName}`}
            </div>
          )}
        </div>

        {/* IMAGES */}
        <div className="vm-field">
          <label className="vm-label">
            📸 Food Photos
            {!isEditing
              ? <span className="vm-label-required"> 2–4 required</span>
              : <span className="vm-label-optional"> (keep existing if blank)</span>
            }
          </label>
          <label className="vm-upload-zone">
            <div className="vm-upload-icon">📷</div>
            <div className="vm-upload-text">Click to upload images</div>
            <div className="vm-upload-sub">
              {isEditing ? "1–4 photos" : "2–4 photos required"}
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFiles}
              className="vm-upload-input"
            />
          </label>
          {previews.length > 0 && (
            <div className="vm-preview-row">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="preview" className="vm-preview-img" />
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="vm-modal-actions">
          <button className="vm-save-btn" onClick={onSave} disabled={saving}>
            {saving ? "⏳ Saving..." : isEditing ? "Update Item" : "Save to Menu"}
          </button>
          <button className="vm-cancel-btn" onClick={onClose}>Cancel</button>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════ */
function StatsBar({ list }) {
  const counts = { Daily: 0, Weekly: 0, Monthly: 0 };
  list.forEach(i => { if (counts[i.menu_scope] !== undefined) counts[i.menu_scope]++; });
  const upcoming = list.filter(i => i.menu_date > todayStr()).length;

  const stats = [
    { icon: "🍽️", value: list.length,   label: "Total Items", colorClass: "vm-stat-blue"   },
    { icon: "📅",  value: upcoming,       label: "Upcoming",    colorClass: "vm-stat-green"  },
    { icon: "☀️",  value: counts.Daily,   label: "Daily",       colorClass: "vm-stat-sky"    },
    { icon: "📆",  value: counts.Weekly,  label: "Weekly",      colorClass: "vm-stat-purple" },
    { icon: "📖",  value: counts.Monthly, label: "Monthly",     colorClass: "vm-stat-teal"   },
  ];

  return (
    <div className="vm-stats-row">
      {stats.map(({ icon, value, label, colorClass }) => (
        <div className="vm-stat-box" key={label}>
          <div className="vm-stat-icon">{icon}</div>
          <div className={`vm-stat-value ${colorClass}`}>{value}</div>
          <div className="vm-stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════ */
function EmptyState({ icon, title, sub, onAdd }) {
  return (
    <div className="vm-empty">
      <div className="vm-empty-icon">{icon}</div>
      <div className="vm-empty-title">{title}</div>
      <div className="vm-empty-sub">{sub}</div>
      <button className="vm-empty-btn" onClick={onAdd}>+ Add First Item</button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const VendorMenuPage = () => {
  const token = localStorage.getItem("token");

  /* ── state ─────────────────────────────── */
  const [menuList,     setMenuList]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [viewType,     setViewType]     = useState("Daily");
  const [showModal,    setShowModal]    = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [selItem,      setSelItem]      = useState(null);
  const [selDate,      setSelDate]      = useState(null);
  const [filterMonth,  setFilterMonth]  = useState("");
  const [showFilter,   setShowFilter]   = useState(false);

  const emptyForm = {
    name: "", description: "", price: "", cuisine: "",
    foodType: "Veg", mealType: "Breakfast",
    dayOfWeek: "", monthName: "", menu_date: "",
    menuScope: "Daily", _files: [],
  };
  const [form, setForm] = useState(emptyForm);

  /* ── fetch menu ─────────────────────────── */
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/vendor/menu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu. Please try again.");
      setMenuList([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  /* ── open add ───────────────────────────── */
  const openAdd = () => {
    setForm({ ...emptyForm, menuScope: viewType });
    setIsEditing(false);
    setSelItem(null);
    setShowModal(true);
  };

  /* ── open edit ──────────────────────────── */
  const openEdit = (item) => {
    setForm({
      name:        item.name        || "",
      description: item.description || "",
      price:       item.price       || "",
      cuisine:     item.cuisine     || "",
      foodType:    item.food_type   || "Veg",
      mealType:    item.meal_type   || "Breakfast",
      dayOfWeek:   item.day_of_week || "",
      monthName:   item.month_name  || "",
      menu_date:   item.menu_date   || "",
      menuScope:   item.menu_scope  || viewType,
      _files:      [],
    });
    setIsEditing(true);
    setSelItem(item);
    setShowModal(true);
  };

  /* ── save (add or update) ───────────────── */
  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.menu_date) {
      alert("Name, price, and date are required!"); return;
    }
    if (!isEditing && (!form._files || form._files.length < 2)) {
      alert("Please upload at least 2 images"); return;
    }

    setSaving(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("name",        form.name);
      fd.append("description", form.description || "");
      fd.append("price",       form.price);
      fd.append("cuisine",     form.cuisine     || "");
      fd.append("foodType",    form.foodType);
      fd.append("mealType",    form.mealType);
      fd.append("menuScope",   form.menuScope);
      fd.append("dayOfWeek",   form.dayOfWeek   || "");
      fd.append("monthName",   form.monthName   || "");
      fd.append("menu_date",   form.menu_date);

      if (form._files && form._files.length > 0) {
        form._files.forEach(file => fd.append("images", file));
      }

      if (isEditing && selItem) {
        await API.put(`/vendor/menu/${selItem.id}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await API.post("/vendor/menu", fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      await fetchMenu();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ─────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    setError("");
    try {
      await API.delete(`/vendor/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchMenu();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete item.";
      setError(msg);
      alert(msg);
    }
  };

  /* ── filtered list ──────────────────────── */
  let filtered = menuList.filter(i => i.menu_scope === viewType);
  if (selDate)     filtered = filtered.filter(i => i.menu_date === selDate);
  if (filterMonth) filtered = filtered.filter(i =>
    new Date(i.menu_date).toLocaleString("en-US", { month: "long" }) === filterMonth
  );

  /* ── weekly groups ──────────────────────── */
  const currentWeekDates = getWeekDates(0);
  const weeklyGrouped = WEEK_DAYS.map((day, i) => ({
    day,
    date: currentWeekDates[i],
    items: menuList.filter(item =>
      item.menu_scope === "Weekly" &&
      new Date(item.menu_date).toLocaleString("en-US", { weekday: "long" }) === day
    ),
  }));

  /* ── active months ──────────────────────── */
  const activeMonths = ALL_MONTHS.filter(m =>
    filtered.some(i => new Date(i.menu_date).toLocaleString("en-US", { month: "long" }) === m)
  );

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="vm-root">
      <div className="vm-page">

        {/* SAVING OVERLAY */}
        {saving && (
          <div className="vm-saving-overlay">
            <div className="vm-spinner" />
            <div className="vm-saving-text">Saving your menu item...</div>
          </div>
        )}

        {/* ── HEADER ── */}
        {/* <header className="vm-header">
          <div className="vm-header-inner">
            <div className="vm-logo-wrap">
              <div className="vm-logo-icon">🍱</div>
              <div>
                <div className="vm-logo-name">Messato</div>
                <div className="vm-logo-sub">Vendor Portal</div>
              </div>
            </div>
            <div className="vm-date-pill">
              📅 {new Date().toLocaleDateString("en-IN", {
                weekday: "short", day: "2-digit", month: "short", year: "numeric",
              })}
            </div>
          </div>
        </header> */}

        {/* ── CONTENT ── */}
        <div className="vm-content">

          <h1 className="vm-page-title">Manage Menu 🍽️</h1>
          <p  className="vm-page-sub">
            Add items at least 1 day ahead · Today &amp; past menus are locked from editing
          </p>

          {/* ERROR BANNER */}
          {error && (
            <div className="vm-error-bar">
              ⚠️ {error}
              <button className="vm-error-close" onClick={() => setError("")}>✕</button>
            </div>
          )}

          {/* STATS — always visible */}
          <StatsBar list={menuList} />

          {/* TOOLBAR — always visible */}
          <div className="vm-toolbar">
            <div className="vm-tab-group">
              {["Daily", "Weekly", "Monthly"].map(tab => (
                <button
                  key={tab}
                  className={`vm-tab-btn${viewType === tab ? " vm-active" : ""}`}
                  onClick={() => setViewType(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="vm-action-group">
              <button className="vm-filter-btn" onClick={() => setShowFilter(s => !s)}>
                ⚙️ Filter
              </button>
              <button className="vm-add-btn" onClick={openAdd}>+ Add Menu</button>
            </div>
          </div>

          {/* FILTER BAR */}
          {showFilter && (
            <div className="vm-filter-bar">
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                <option value="">All Months</option>
                {ALL_MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
              {(filterMonth || selDate) && (
                <button
                  className="vm-clear-btn"
                  onClick={() => { setFilterMonth(""); setSelDate(null); }}
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>
          )}

          {/* CALENDAR — always visible */}
          <CalendarStrip
            selectedDate={selDate}
            onSelectDate={setSelDate}
            menuList={menuList}
          />

          {/* DATE BANNER */}
          {selDate && (
            <div className={`vm-date-banner ${
              isPastDay(selDate) ? "vm-past" : isTodayDay(selDate) ? "vm-today" : "vm-future"
            }`}>
              <span className="vm-banner-icon">
                {isPastDay(selDate) ? "🔒" : isTodayDay(selDate) ? "📍" : "📅"}
              </span>
              <span className="vm-banner-text">
                {isPastDay(selDate)
                  ? "Past menu — view only"
                  : isTodayDay(selDate)
                  ? "Today's menu — locked for editing"
                  : `Showing menu for: ${fmtDate(selDate)}`}
              </span>
              <button className="vm-banner-close" onClick={() => setSelDate(null)}>✕</button>
            </div>
          )}

          {/* LOADING / CONTENT */}
          {loading ? (
            <div className="vm-loading">
              <div className="vm-spinner" />
              <div className="vm-loading-text">Loading your menu...</div>
            </div>
          ) : (
            <>
              {/* ══ DAILY ══ */}
              {viewType === "Daily" && (
                filtered.length === 0 ? (
                  <EmptyState
                    icon="🍱"
                    title={selDate ? `No items for ${fmtDate(selDate)}` : "No daily menu items yet"}
                    sub="Start adding meals to delight your customers!"
                    onAdd={openAdd}
                  />
                ) : (
                  <div className="vm-cards-grid">
                    {filtered.map(item => (
                      <MenuCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                  </div>
                )
              )}

              {/* ══ WEEKLY ══ */}
              {viewType === "Weekly" && weeklyGrouped.map(({ day, date, items }) => {
                const dayIsPast  = isPastDay(date);
                const dayIsToday = isTodayDay(date);
                return (
                  <div key={day} className="vm-week-section">
                    <div className={`vm-week-header${
                      dayIsToday ? " vm-today-row" : dayIsPast ? " vm-past-row" : ""
                    }`}>
                      <div className={`vm-week-day-avatar ${
                        dayIsToday ? "vm-avatar-today" : dayIsPast ? "vm-avatar-past" : "vm-avatar-future"
                      }`}>
                        <div className="vm-avatar-dow">{day.slice(0, 3)}</div>
                        <div className="vm-avatar-num">{new Date(date).getDate()}</div>
                      </div>
                      <div className="vm-week-day-meta">
                        <div className="vm-week-day-name">{day}</div>
                        <div className="vm-week-day-date">
                          {fmtDate(date)}{dayIsPast ? " · Past" : dayIsToday ? " · Today" : ""}
                        </div>
                      </div>
                      <div className="vm-week-item-count">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </div>
                      {!dayIsPast && !dayIsToday && (
                        <button className="vm-week-add-btn" onClick={openAdd}>+ Add</button>
                      )}
                    </div>
                    <div className="vm-week-body">
                      {items.length === 0 ? (
                        <div className="vm-week-empty">
                          {dayIsPast
                            ? "🔒 No items were added for this day"
                            : "No items yet — add something delicious!"}
                        </div>
                      ) : (
                        <div className="vm-cards-grid">
                          {items.map(item => (
                            <MenuCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* ══ MONTHLY ══ */}
              {viewType === "Monthly" && (
                activeMonths.length === 0 ? (
                  <EmptyState
                    icon="📖"
                    title="No monthly menu yet"
                    sub="Add items with Monthly scope to see them here"
                    onAdd={openAdd}
                  />
                ) : (
                  activeMonths.map(month => {
                    const monthItems = filtered.filter(i =>
                      new Date(i.menu_date).toLocaleString("en-US", { month: "long" }) === month
                    );
                    return (
                      <div key={month} className="vm-month-section">
                        <div className="vm-month-divider">
                          <div className="vm-month-line" />
                          <div className="vm-month-label">📖 {month}</div>
                          <div className="vm-month-line vm-month-line-rev" />
                        </div>
                        <div className="vm-cards-grid">
                          {monthItems.map(item => (
                            <MenuCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </>
          )}

        </div>{/* end vm-content */}

        {/* MODAL */}
        {showModal && (
          <MenuModal
            isEditing={isEditing}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={() => !saving && setShowModal(false)}
            saving={saving}
          />
        )}

      </div>{/* end vm-page */}
    </div>
  );
};

export default VendorMenuPage;
