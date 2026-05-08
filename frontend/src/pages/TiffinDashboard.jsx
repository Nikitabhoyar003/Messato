import { useState } from "react";
import UserSidebar from "../components/sidebar";
import TiffinCard from "../components/Tiffincard";
import TiffinModal from "../components/filtermodel";
import "./TiffinDashboard.css";

const TiffinDashboard = () => {
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    mealType: "",
    category: "",
    maxPrice: 0,
  });

  const menus = [
    {
      id: 101,
      mealType: "Lunch",
      category: "Veg",
      items: "Roti, Dal, Sabji, Rice",
      price: 80,
    },
    {
      id: 102,
      mealType: "Dinner",
      category: "Veg",
      items: "Chapati, Paneer, Rice",
      price: 100,
    },
    {
      id: 103,
      mealType: "Lunch",
      category: "Non-Veg",
      items: "Chicken Curry, Rice",
      price: 140,
    },
  ];

  // ✅ FILTER LOGIC
  const filteredMenus = menus.filter((menu) => {
    return (
      (!filters.mealType || menu.mealType === filters.mealType) &&
      (!filters.category || menu.category === filters.category) &&
      (!filters.maxPrice || menu.price <= filters.maxPrice)
    );
  });

  return (
    <div className="dashboard">
      <UserSidebar />

      <div className="tiffin-dashboard">
        <div className="header">
          <h2>Sundar Sushil – Menus</h2>
          <button onClick={() => setShowFilter(true)}>Filter</button>
        </div>

        {/* MENU LIST */}
        <div className="menu-list">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu) => (
              <TiffinCard key={menu.id} menu={menu} />
            ))
          ) : (
            <p>No menus found</p>
          )}
        </div>

        {/* FILTER MODAL */}
        {showFilter && (
          <TiffinModal
            close={() => setShowFilter(false)}
            applyFilters={(data) => {
              setFilters(data);
              setShowFilter(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TiffinDashboard;
