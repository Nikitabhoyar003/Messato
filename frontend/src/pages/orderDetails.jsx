import { useParams, useNavigate } from "react-router-dom";
  import { useEffect, useState } from "react";
  import Navbar from "../components/navbar";
  import Footer from "../components/footer";
  import "./OrderDetails.css";
import OrderTracking from "./orderTracking"; // ✅ fixed

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Order not found");

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
        alert("Unable to load order details");
        navigate("/my-orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);
  const handleReorder = () => {
  const cartItems = order.items.map(item => ({
    id: item.menu_id,
    quantity: item.quantity,
    price: item.price,
    name: item.name,
    image: item.image
  }));

  localStorage.setItem("reorderCart", JSON.stringify(cartItems));

  navigate("/cart");
};
  if (loading) return <p className="center">Loading order details...</p>;
  if (!order) return null;

  return (
<div className="page-with-navbar">
  <Navbar />

  <div className="order-details-container">

    {/* 🧾 ORDER SUMMARY */}
    <div className="summary-card">
      <h3>Order summary</h3>

      {order.arrived_at && (
        <p className="arrival">Arrived at {order.arrived_at}</p>
      )}

      {order.bill_url && (
        <a href={order.bill_url} target="_blank" className="invoice">
          Download Invoice ⬇
        </a>
      )}

      <p className="item-count">
        {order.items.length} item in this order
      </p>

      {order.items.map((item, i) => (
        <div className="summary-item" key={i}>
          <img src={item.image || "/food-placeholder.png"} />
          <div>
            <h4>{item.name}</h4>
            <p>{item.quantity} × ₹{item.price}</p>
          </div>
          <span>₹{item.price * item.quantity}</span>
        </div>
      ))}
    </div>

    {/* 💳 BILL DETAILS */}
    <div className="bill-card1">
      <h3>Bill details</h3>

      <div className="bill-row">
        <span>Item total</span>
        <span>₹{order.total_amount}</span>
      </div>

      <div className="bill-row total">
        <strong>Bill total</strong>
        <strong>₹{order.total_amount}</strong>
      </div>
    </div>

    {/* 📦 ORDER DETAILS */}
    <div className="details-card1">
      <h3>Order details</h3>

      <p><strong>Order id</strong> #{order.id}</p>

      <p><strong>Order placed</strong> {order.placed_at}</p>

      <p><strong>Payment</strong> {order.payment_method}</p>

      <p><strong>Status</strong> {order.status}</p>

      <p><strong>Deliver to</strong> {order.address}</p>
    </div>

    {/* 🔁 REORDER BUTTON */}
    {order.items?.length > 0 && (
      <button
        className="reorder-btn"
        onClick={() => handleReorder()}
      >
        Reorder
      </button>
    )}

    {/* 💬 HELP SECTION */}
    <div className="help-card">
      <h3>Need help with your order?</h3>

      <div className="chat-row">
        <span>💬 Chat with us</span>
        <span>›</span>
      </div>
    </div>

    <button className="back-btn" onClick={() => navigate("/my-orders")}>
      Back to My Orders
    </button>

  </div>

  <Footer />
</div>
  );
};

export default OrderDetails;
