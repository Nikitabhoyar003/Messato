import { useState } from "react";
import "./filter.css";

const CUISINES = [
  "Indian",
  "Punjabi",
  "South Indian",
  "Chinese",
  "Italian",
  "North Indian",
];

const FilterModal = ({ close, onApply, defaultActive }) => {
  const [active, setActive] = useState(defaultActive || "veg");

  // ✅ FILTER STATE (DISTANCE REMOVED)
  const [filters, setFilters] = useState({
    foodType: "all",   // veg | nonveg | all
    rating: 0,         // 0 | 3.5 | 4 | 4.5
    cuisines: [],
    service: "",
    priceOrder: "",
  });

  // ✅ TOGGLE CUISINES
  const toggleCuisine = (cuisine) => {
    setFilters((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  // ✅ CLEAR ALL
  const clearAll = () => {
    setFilters({
      foodType: "all",
      rating: 0,
      cuisines: [],
      service: "",
      priceOrder: "",
    });
  };

  return (
    <div className="filter-overlay">
      <div className="filter-modal">

        {/* HEADER */}
        <div className="filter-header">
          <span className="clear" onClick={clearAll}>Clear All</span>
          <h2>FILTERS</h2>
          <span className="close" onClick={close}>✕</span>
        </div>

        <div className="filter-body">

          {/* LEFT MENU */}
          <div className="filter-left">
            {[
              { id: "veg", label: "Veg | Non-Veg" },
              { id: "cuisines", label: "Cuisines" },
              { id: "service", label: "Services" },
              { id: "rating", label: "Rating" },
              { id: "price", label: "Price" },
            ].map((f) => (
              <div
                key={f.id}
                className={`filter-item ${active === f.id ? "active" : ""}`}
                onClick={() => setActive(f.id)}
              >
                {f.label}
              </div>
            ))}
          </div>

          {/* RIGHT CONTENT */}
          <div className="filter-right">

            {/* VEG | NON-VEG */}
            {active === "veg" && (
              <div className="option-row">
                {["veg", "nonveg", "all"].map((type) => (
                  <button
                    key={type}
                    className={`chip ${filters.foodType === type ? "selected" : ""}`}
                    onClick={() =>
                      setFilters({ ...filters, foodType: type })
                    }
                  >
                    {type === "nonveg"
                      ? "Non-Veg"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* CUISINES */}
            {active === "cuisines" && (
              <div className="option-row">
                {CUISINES.map((cuisine) => (
                  <button
                    key={cuisine}
                    className={`chip ${
                      filters.cuisines.includes(cuisine) ? "selected" : ""
                    }`}
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            )}

            {/* RATING */}
            {active === "rating" && (
              <div className="option-column">
                {[0, 3.5, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    className={`chip ${filters.rating === r ? "selected" : ""}`}
                    onClick={() =>
                      setFilters({ ...filters, rating: r })
                    }
                  >
                    {r === 0 ? "Any" : `${r}+`}
                  </button>
                ))}
              </div>
            )}

            {/* PRICE */}
            {active === "price" && (
              <div className="option-column">
                <button
                  className={`chip ${
                    filters.priceOrder === "asc" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setFilters({ ...filters, priceOrder: "asc" })
                  }
                >
                  Low to High
                </button>
                <button
                  className={`chip ${
                    filters.priceOrder === "desc" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setFilters({ ...filters, priceOrder: "desc" })
                  }
                >
                  High to Low
                </button>
              </div>
            )}

            {/* SERVICES */}
            {active === "service" && (
              <div className="option-column">
                {["delivery", "takeaway"].map((s) => (
                  <button
                    key={s}
                    className={`chip ${
                      filters.service === s ? "selected" : ""
                    }`}
                    onClick={() =>
                      setFilters({ ...filters, service: s })
                    }
                  >
                    {s === "delivery"
                      ? "Home Delivery"
                      : "Takeaway"}
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="filter-footer">
          <button
            className="apply-btn"
            onClick={() => {
              onApply(filters);
              close();
            }}
          >
            Apply
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterModal;
