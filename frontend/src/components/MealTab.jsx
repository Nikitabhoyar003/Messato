import "./MealTabs.css";
import {
  FaCoffee,
  FaUtensils,
  FaMoon
  // FaBoxOpen,
  // FaShoppingCart,
  // FaUser
} from "react-icons/fa";

const MealTab = ({ activeTab, setActiveTab }) => {
  return (
    <div className="meal-navbar">
      <div
        className={`meal-item ${activeTab === "breakfast" ? "active" : ""}`}
        onClick={() => setActiveTab("breakfast")}
      >
        <FaCoffee /> <span>Breakfast</span>
      </div>

      <div
        className={`meal-item ${activeTab === "lunch" ? "active" : ""}`}
        onClick={() => setActiveTab("lunch")}
      >
        <FaUtensils /> <span>Lunch</span>
      </div>

      <div
        className={`meal-item ${activeTab === "dinner" ? "active" : ""}`}
        onClick={() => setActiveTab("dinner")}
      >
        <FaMoon /> <span>Dinner</span>
      </div>

      {/* <div
        className={`meal-item ${activeTab === "orders" ? "active" : ""}`}
        onClick={() => setActiveTab("orders")}
      >
        <FaBoxOpen /> <span>My Orders</span>
      </div> */}

      {/* <div
        className={`meal-item ${activeTab === "cart" ? "active" : ""}`}
        onClick={() => setActiveTab("cart")}
      >
        <FaShoppingCart /> <span>Cart</span>
      </div> */}

      {/* <div
        className={`meal-item ${activeTab === "profile" ? "active" : ""}`}
        onClick={() => setActiveTab("profile")}
      >
        <FaUser /> <span>Profile</span>
      </div> */}
    </div>
  );
};

export default MealTab;
