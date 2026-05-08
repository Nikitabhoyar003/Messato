import { useState, useEffect } from "react";
import FilterModal from "./filtermodel";
import "./filter.css";
import { CiSliderHorizontal } from "react-icons/ci";

const FilterBar = ({ data, setFilteredData }) => {
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("veg");

  // ✅ Show all data initially
  useEffect(() => {
    setFilteredData(data);
  }, [data, setFilteredData]);

  const applyFilters = (newFilters) => {
    let filtered = [...data];

    /* =====================
       FOOD TYPE
    ===================== */
    if (
      newFilters.foodType &&
      newFilters.foodType !== "all"
    ) {
      filtered = filtered.filter(
        (item) =>
          item.food_type &&
          item.food_type.toLowerCase() ===
            (newFilters.foodType === "nonveg"
              ? "non-veg"
              : newFilters.foodType)
      );
    }

    /* =====================
       RATING
    ===================== */
    if (newFilters.rating && newFilters.rating > 0) {
      filtered = filtered.filter(
        (item) => Number(item.rating || 0) >= newFilters.rating
      );
    }

    /* =====================
       CUISINES
    ===================== */
    if (
      Array.isArray(newFilters.cuisines) &&
      newFilters.cuisines.length > 0
    ) {
      filtered = filtered.filter(
        (item) =>
          item.cuisine &&
          newFilters.cuisines.includes(item.cuisine)
      );
    }

    /* =====================
       PRICE SORT
    ===================== */
    if (newFilters.priceOrder === "asc") {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (newFilters.priceOrder === "desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredData(filtered);
    setOpen(false);
  };

  // ❌ Distance removed
  const filtersUI = [
    { label: "Veg | Non-Veg", id: "veg" },
    { label: "Cuisines", id: "cuisines" },
    { label: "Rating", id: "rating" },
    { label: "Price", id: "price" },
  ];

  return (
    <>
      <div className="filter-bar-top">
        {/* Mobile icon */}
        <button
          className="filter-btn icon"
          onClick={() => {
            setActiveFilter("veg");
            setOpen(true);
          }}
        >
          <CiSliderHorizontal />
        </button>

        {/* Desktop buttons */}
        <div className="filter-bar-desktop">
          {filtersUI.map((f) => (
            <button
              key={f.id}
              className="filter-btn"
              onClick={() => {
                setActiveFilter(f.id);
                setOpen(true);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {open && (
        <FilterModal
          close={() => setOpen(false)}
          onApply={applyFilters}
          defaultActive={activeFilter}
        />
      )}
    </>
  );
};

export default FilterBar;
