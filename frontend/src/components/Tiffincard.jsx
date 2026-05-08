// import { useNavigate } from "react-router-dom";

const TiffinCard = ({ menu }) => {
  if (!menu) return null; // safety check

  return (
    <div className="menu-card">
      <h4>{menu.mealType} ({menu.category})</h4>
      <p>{menu.items}</p>
      <p className="price">₹ {menu.price}</p>

      <button>Order</button>
    </div>
  );
};


export default TiffinCard;
