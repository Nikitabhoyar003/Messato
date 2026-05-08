
import { useEffect, useState } from "react";
import "./VendorOtpDeliveryPage.css";

const VendorOtpDeliveryPage = () => {
  const [orders, setOrders] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});
  const [message, setMessage] = useState("");

  // 🔹 FETCH ALL ORDERS WAITING FOR OTP
  useEffect(() => {
    fetch("http://localhost:5000/api/orders/pending-otp")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  // 🔹 VERIFY OTP
  const verifyOtp = async (orderId) => {
    const otp = otpInputs[orderId];

    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    const res = await fetch("http://localhost:5000/api/orders/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, otp })
    });

    const data = await res.json();
    setMessage(data.message);

    // Refresh table
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, delivery_status: "Delivered" }
          : o
      )
    );
  };

  return (
    <div className="otp-table-page">
      <h2>OTP Delivery Confirmation</h2>

      <table className="otp-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User Name</th>
            <th>Mobile</th>
            <th>Enter OTP</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.user_name}</td>
              <td>{order.user_phone}</td>

              <td>
                {order.delivery_status === "Delivered" ? (
                  "—"
                ) : (
                  <input
                    className="otp-input"
                    placeholder="OTP"
                    value={otpInputs[order.id] || ""}
                    onChange={(e) =>
                      setOtpInputs({
                        ...otpInputs,
                        [order.id]: e.target.value
                      })
                    }
                  />
                )}
              </td>

              <td>
                <span
                  className={`status ${
                    order.delivery_status === "Delivered"
                      ? "delivered"
                      : "pending"
                  }`}
                >
                  {order.delivery_status}
                </span>
              </td>

              <td>
                {order.delivery_status === "Delivered" ? (
                  "✅"
                ) : (
                  <button
                    className="verify-btn"
                    onClick={() => verifyOtp(order.id)}
                  >
                    Verify
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && <p className="msg">{message}</p>}
    </div>
  );
};

export default VendorOtpDeliveryPage;
