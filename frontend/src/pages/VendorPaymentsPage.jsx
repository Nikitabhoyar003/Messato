import { useEffect, useState } from "react";
import axios from "../utils/api";
import "./VendorPaymentsPage.css";

const VendorPaymentsPage = () => {
  const [paymentsData, setPaymentsData] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalEarnings: 0, pendingAmount: 0 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===========================
     🔹 FETCH PAYMENTS
  ============================ */
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No vendor token found");
          return;
        }

        const res = await axios.get(
          "http://localhost:5000/api/vendor/payments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.payments) {
          setPaymentsData(res.data.payments);
          setStats(res.data.stats);
        } else {
          setPaymentsData(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error("FETCH PAYMENTS ERROR:", err.response?.data || err.message);

        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("vendorToken");
          window.location.href = "/vendor/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const { totalOrders, totalEarnings, pendingAmount } = stats;

  if (loading) {
    return <div className="payments-page">Loading payments...</div>;
  }

  return (
    <div className="payments-page">
      <h2 className="page-title">Payments Overview</h2>

      {/* SUMMARY */}
      <div className="summary-grid">
        <div className="summary-card">
          <p>Total Orders</p>
          <h3>{totalOrders}</h3>
        </div>
        <div className="summary-card green">
          <p>Total Earnings</p>
          <h3>₹ {totalEarnings}</h3>
        </div>
        <div className="summary-card orange">
          <p>Pending Amount</p>
          <h3>₹ {pendingAmount}</h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="payment-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Method</th>
              <th>Status</th>
              <th>Paid At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paymentsData.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  No payments found
                </td>
              </tr>
            ) : (
              paymentsData.map((p, index) => (
                <tr key={p.payment_id || p.order_id}>
                  <td>{index + 1}</td>
                  <td>{p.order_id}</td>
                  <td>{p.customer_name}</td>
                  <td>₹ {p.amount}</td>
                  <td>{p.payment_mode}</td>
                  <td>{p.payment_method}</td>
                  <td>
                    <span
                      className={`status ${
                        p.payment_status?.toLowerCase() || ""
                      }`}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                  <td>{p.paidAt || "-"}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setSelectedPayment(p)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Payment Details</h3>

            <p><b>Order ID:</b> {selectedPayment.order_id}</p>
            <p><b>Customer:</b> {selectedPayment.customer_name}</p>
            <p><b>Address:</b> {selectedPayment.address}</p>
            <p><b>Payment Mode:</b> {selectedPayment.payment_mode}</p>
            <p><b>Payment Method:</b> {selectedPayment.payment_method}</p>
            <p><b>Transaction ID:</b> {selectedPayment.txn_id}</p>
            <p><b>Paid At:</b> {selectedPayment.paidAt || "-"}</p>

            <h4>Total: ₹ {selectedPayment.amount}</h4>

            <button onClick={() => setSelectedPayment(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPaymentsPage;
