import "./MyOrder.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const formatIST = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};



const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Fetch orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const res = await fetch(
        "http://localhost:5000/api/orders/my-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch orders failed:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchOrders();
}, [location]);
//    useEffect(() => {
//     window.history.pushState(null, "", window.location.href);

//     const handleBack = () => {
//       navigate("/user-dashboard", { replace: true });
//     };

//     window.addEventListener("popstate", handleBack);

//     return () => window.removeEventListener("popstate", handleBack);
//   }, [navigate]);

  // ❌ Cancel Order
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/orders/cancel/${orderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        alert("This order cannot be cancelled now");
        return;
      }

      fetchOrders();
    } catch {
      alert("Unable to cancel order");
    }
  };

  if (loading) {
    return <p className="center">Loading orders...</p>;
  }

  return (
    <div className="page-with-navbar">
      <Navbar />

      <div className="orders-container">
        <h2>📦 My Orders</h2>
        

        {orders.length === 0 && (
          <div className="empty-orders">
            <p className="empty-icon">🍽️</p>
            <h3>No orders yet</h3>
            <p>Order your favorite tiffin to see it here</p>
          </div>
        )}

        {/* ORDER LIST */}
        {orders.map((order) => (
          <div
            key={order.id}
            className="order-card clickable"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            {/* TOP */}
            <div className="order-top">
              <span>
                <strong>Order ID:</strong> #{order.id}
              </span>

              <span className={`status ${order.status?.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            {/* 🔥 BODY WRAPPER (ADDED, NOTHING REMOVED) */}
            <div className="order-body">
              {/* 🖼️ FOOD IMAGE */}
              {order.items?.[0]?.image && (
                <img
                  src={order.items[0].image}
                  alt={order.items[0].name}
                  className="order-food-img"
                />
              )}

              {/* RIGHT SIDE CONTENT */}
              <div className="order-content">
                {/* TIME */}
  <p className="date">
  {formatIST(order.created_at)}
</p>

                {/* VENDOR */}
                <p className="vendor">
                  🧑‍🍳 {order.vendor_name || "Vendor"} –{" "}
                  {order.tiffin_name || "Tiffin Service"}
                </p>

                {/* ITEMS */}
                <ul className="order-items-list">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} × {item.quantity}
                      </li>
                    ))
                  ) : (
                    <li className="muted">
                      Items will be visible after order confirmation
                    </li>
                  )}
                </ul>

                {/* FOOTER */}
                <div className="order-bottom">
                  <span className="amount">₹{order.total_amount}</span>

                  {order.status === "Pending" && (
                    <span className="info">
                      ⏳ Waiting for vendor to accept your order
                    </span>
                  )}

                  {order.status === "Accepted" &&
                    order.payment_status !== "Paid" && (
                      <div className="actions">
                        <button
                          className="pay-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/payment/${order.id}`);
                          }}
                        >
                          Pay Now
                        </button>

                        <button
                          className="cancel-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelOrder(order.id);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                  {order.payment_status === "Paid" && (
                    <span className="success">
                      💰 Paid — Thank you for your order!
                    </span>
                  )}

                  {order.status === "Preparing" && (
                    <span className="info1">
                      🍳 Food is being prepared
                    </span>
                  )}

                  {order.status === "Out for Delivery" && (
                    <span className="action">
                      <button
      className="track-btn"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/orders/${order.id}?track=true`);
      }}
    > Track order</button>
                      🚚 Your order is on the way
                    </span>
                  )}

                  {order.status === "Delivered" && (
                    <span className="success">
                      ✅ Delivered successfully
                    </span>
                  )}

                  {order.status === "Cancelled" && (
                    <span className="danger">
                      ❌ Order cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default MyOrders;

