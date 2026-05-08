import { useCart } from "./useCart";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./CartDrawer.css";

const CartDrawer = ({ open, onClose }) => {
  const { cart, updateQty } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  // fake skeleton loading
  useEffect(() => {
    if (open) {
    //   setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  }, [open]);

  return (
    <>
      <div className={`cart-overlay ${open ? "show" : ""}`} onClick={onClose} />

      <div className={`cart-drawer ${open ? "open" : ""}`}>
        
        <div className="cart-header">
          <h2>My Cart</h2>
          <span onClick={onClose}>✕</span>
        </div>

        {loading ? (
          <div className="cart-scroll">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cart-skeleton" />
            ))}
          </div>
        ) : cart.length === 0 ? (
          <div className="empty-cart">Your cart is empty</div>
        ) : (
          <>
            <div className="cart-scroll">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">

                  <img src={item.image} alt={item.name} />

                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>₹{item.price}</p>
                  </div>

                  <div className="qty-control">
                    <button onClick={() => updateQty(item.id, "dec")}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, "inc")}>+</button>
                  </div>

                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="total-row">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <button
                className="place-order-btn12"
                onClick={() => {
                  onClose();
                  navigate("/cart");
                }}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
