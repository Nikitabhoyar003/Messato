import { useState } from "react";
import "./CartModal.css";
// import CartModal from "../cart/CartModal";



export default function CartModal({ onClose }) {
    const [role, setRole] = useState("user");
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Veg Tiffin", price: 120, qty: 1 },
    { id: 2, name: "Special Thali", price: 180, qty: 1 }
  ]);

  const increaseQty = (id) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Your Cart</h3>

        {cartItems.map(item => (
          <div className="cart-item" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <p>₹{item.price}</p>
            </div>

            <div className="qty">
              <button onClick={() => decreaseQty(item.id)}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => increaseQty(item.id)}>+</button>
            </div>
          </div>
        ))}

        <div className="cart-total">
          <span>Total</span>
          <strong>₹{total}</strong>
        </div>

        <button className="checkout-btn">Checkout</button>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
