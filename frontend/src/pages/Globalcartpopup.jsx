import { useCart } from "../components/useCart";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Globalcartpopup.css";

const Globalcartpopup = () => {
  const { cart, setCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [visible, setVisible] = useState(true);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  /* ✅ HIDE ON CART + PAYMENT PAGES */
  const hideOnRoutes = ["/cart", "/payment"];

  const shouldHide =
    totalItems === 0 ||
    hideOnRoutes.some((route) =>
      location.pathname.startsWith(route)
    ) ||
    !visible;

  /* ✅ AUTO HIDE AFTER 5 SECONDS */
  useEffect(() => {
    if (totalItems > 0) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (shouldHide) return null;

  return (
    <div
      className="global-cart-popup"
      onClick={() => {
        setCartOpen(true);
        navigate("/cart");
      }}
    >
      <div className="cart-popup-left">
        <h4>
          {totalItems} item{totalItems > 1 && "s"} added
        </h4>
        <p>₹{totalPrice}</p>
      </div>

      <button className="view-cart-btn">
        View Cart 🛒
      </button>
    </div>
  );
};

export default Globalcartpopup;