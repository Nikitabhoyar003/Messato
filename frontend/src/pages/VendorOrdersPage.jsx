import { useEffect, useState } from "react";
import socket from "../socket";
// import axios from "axios";
import API from "../utils/api";
import {
  FiFilter,
  FiChevronDown,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
} from "react-icons/fi";
import "./VendorOrdersPage.css";
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  // hgugughuhjh
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [cashReceived, setCashReceived] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
     const isCOD =
  selectedOrder?.payment_method?.toLowerCase() === "cod";

const isOnline =
  selectedOrder?.payment_method?.toLowerCase() !== "cod";
0


  // 🔽 dropdown state
  const [open, setOpen] = useState(false);

  {
    ["all", "pending", "accepted", "preparing", "out_for_delivery", "delivered", "cancelled"].map(
      (s) => (
        <div
          key={s}
          className={`status-option ${statusFilter === s ? "active" : ""
            }`}
          onClick={() => {
            setStatusFilter(s);
            setOpen(false);
          }}
        >
          {capitalize(s)}
        </div>
      )
    )
  }



  // ✅ CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // 🔹 FETCH ORDERS


  // const fetchOrders = async () => {
  //   try {
  //     const res = await axios.get(
  //       "http://localhost:5000/api/vendor/orders",
  //       { withCredentials: true }
  //     );
  //     setOrders(res.data || []);
  //   } catch (fetchError) {
  //     console.error("FETCH ORDERS ERROR:", fetchError);
  //   }
  // };
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");


      const res = await API.get(
        "/vendor/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("ORDERS:", res.data);
      setOrders(res.data || []);
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err.response?.data || err);
    }
  };
 useEffect(() => {
  fetchOrders();

  socket.on("orderStatusUpdated", (data) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === Number(data.orderId)
          ? { ...order, order_status: data.status }
          : order
      )
    );
  });

  return () => {
    socket.off("orderStatusUpdated");
  };
}, []);


  // 🔹 UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, nextStatus) => {
    try {
      let rejectReason = null;

      if (nextStatus === "Cancelled") {
        const confirmCancel = window.confirm(
          "⚠️ Are you sure you want to cancel this order?\nThis can be undone before delivery."
        );
        if (!confirmCancel) return;

        rejectReason = prompt("Please enter cancellation reason:");
        if (!rejectReason) return;
      }

      await API.put(
        `/vendor/orders/${orderId}`,
        { order_status: nextStatus, reason: rejectReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      alert("✅ Order status updated");
      fetchOrders();
    } catch (updateError) {
      console.error("ORDER STATUS UPDATE FAILED:", updateError);
      alert("❌ Failed to update order");
    }
  };

  // 🔹 FILTER ORDERS
  const filteredOrders = orders.filter((o) => {
    const orderStatus = o.order_status?.toLowerCase();
    const filterStatus = statusFilter.toLowerCase();

    const statusOk =
      filterStatus === "all" || orderStatus === filterStatus;

    const searchOk =
      o.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);

    return statusOk && searchOk;
  });


  // 🔹 PAGINATION LOGIC
  const totalPages = Math.ceil(
    filteredOrders.length / ITEMS_PER_PAGE
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="admin-orders">
      {/* HEADER */}
      <div className="orders-header">
        <h2>Orders</h2>
        <p className="subtitle">
          Manage customer orders, approvals and delivery status
        </p>
      </div>



      {/* CONTROLS */}
      <div className="orders-controls">
        <input
          className="search"
          placeholder="Quick search (order id, user, meal)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* 🔽 PROFESSIONAL STATUS FILTER */}
        <div
          className="status-filter"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="status-pill"
            onClick={() => setOpen(!open)}
          >
            <FiFilter size={16} />
            <span>Status</span>
            <b>{statusFilter}</b>
            <FiChevronDown
              size={16}
              className={`chevron ${open ? "rotate" : ""}`}
            />
          </button>

          {open && (
            <div className="status-popover">
              <div
                className={`status-option ${statusFilter === "all" ? "active" : ""
                  }`}
                onClick={() => {
                  setStatusFilter("all");
                  setOpen(false);
                }}
              >
                <FiFilter /> All
              </div>

              <div
                className={`status-option ${statusFilter === "Pending" ? "active" : ""
                  }`}
                onClick={() => {
                  setStatusFilter("Pending");
                  setOpen(false);
                }}
              >
                🟡 Pending
              </div>

              <div
                className={`status-option ${statusFilter === "Accepted" ? "active" : ""
                  }`}
                onClick={() => {
                  setStatusFilter("Accepted");
                  setOpen(false);
                }}
              >
                <FiCheckCircle /> Accepted
              </div>

              <div
                className={`status-option ${statusFilter === "Delivered" ? "active" : ""
                  }`}
                onClick={() => {
                  setStatusFilter("Delivered");
                  setOpen(false);
                }}
              >
                <FiTruck /> Delivered
              </div>

              <div
                className={`status-option ${statusFilter === "Cancelled" ? "active" : ""
                  }`}
                onClick={() => {
                  setStatusFilter("Cancelled");
                  setOpen(false);
                }}
              >
                <FiXCircle /> Cancelled
              </div>
            </div>
          )}
        </div>
      </div>


      {/* TABLE */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>ORDER ID</th>
              <th>USER</th>
              <th>MEAL</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  No orders found
                </td>
              </tr>
            )}

            {paginatedOrders.map((o, index) => (
              <tr key={o.id}>
                <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td>#{o.id}</td>

                <td>
                  <div className="user">
                    <b>{o.user_name}</b>
                    <span>{o.phone || ""}</span>
                  </div>
                </td>

                <td>{o.meal_type}</td>
                <td>₹ {o.amount}</td>

                <td>
                  <span className={`status ${o.order_status}`}>
                    {o.order_status}
                  </span>
                </td>

                <td className="action-cell">

  {/* Pending → Preparing */}
  {o.order_status === "Pending" && (
    <button
      className="prepare-btn"
      onClick={() => updateOrderStatus(o.id, "Preparing")}
    >
      Start Preparing
    </button>
  )}

  {/* Preparing → Out for Delivery */}
  {o.order_status === "Preparing" && (
    <button
      className="out-btn"
      onClick={() =>
        updateOrderStatus(o.id, "Out for Delivery")
      }
    >
      Out for Delivery
    </button>
  )}

  {/* Out for Delivery → Delivered */}
  {o.order_status === "Out for Delivery" && (
    <button
      className="deliver-btn"
      onClick={() => {
        setSelectedOrder(o);
        setShowDeliveryModal(true);
      }}
    >
      Mark Delivered
    </button>
  )}

  {/* Delivered or Cancelled → No Action */}
  {(o.order_status === "Delivered" ||
    o.order_status === "Cancelled") && (
    <span className="no-action">—</span>
  )}




                  {/*  */}

                  {/* ✅ PASTE DELIVERY MODAL CODE HERE */}
                  {showDeliveryModal && selectedOrder && (

                    <div className="modal-overlay">


                      <div className="delivery-modal">
                        <h3>Confirm Delivery</h3>



                        <div className="detail-row">
                          <span>Order ID:</span>
                          <b>#{selectedOrder.id}</b>
                        </div>

                        <div className="detail-row">
                          <span>Customer:</span>
                          <b>{selectedOrder.user_name}</b>
                        </div>

                        <div className="detail-row">
                          <span>Phone:</span>
                          <b>{selectedOrder.phone || "-"}</b>
                        </div>

                        <div className="detail-row">
                          <span>Address:</span>
                          <b>{selectedOrder.address}</b>
                        </div>

                        <div className="detail-row">
                          <span>Meal:</span>
                          <b>{selectedOrder.meal_type}</b>
                        </div>

                        <div className="detail-row">
                          <span>Total Amount:</span>
                          <b>₹{selectedOrder.amount}</b>
                        </div>

                        <div className="detail-row">
                          <span>Payment:</span>
                          <b>{selectedOrder.payment_status}</b>
                        </div>

                        <div className="detail-row">
                          <span>Status:</span>
                          <b>{selectedOrder.order_status}</b>
                        </div>


                        {/*  */}
                        {/* 🔹 ONLINE PAYMENT */}
                        {selectedOrder.payment_method !== "COD" && (
                          <>
                            <div className="qr-box">
                              <p>Scan QR to Pay</p>
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY ₹${selectedOrder.amount}`}
                                alt="QR Code"
                              />
                            </div>
                          </>
                        )}

                        {/* mdbnjbjbj */}
                        <button
                          className="send-otp-btn"
                          onClick={async () => {
                            await axios.post(
                              `http://localhost:5000/api/vendor/orders/${selectedOrder.id}/send-otp`,
                              {},
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
                                },
                              }
                            );

                            alert("OTP sent to customer");
                          }}
                        >
                          Send OTP
                        </button>
                        {/*  */}

                      


                        {/*  */}

                        {/* 🔹 CASH ON DELIVERY */}
                        {selectedOrder.payment_method === "COD" && (
                          <label className="cash-check">
                            <input
                              type="checkbox"
                              checked={cashReceived}
                              onChange={(e) => setCashReceived(e.target.checked)}
                            />
                            I have received cash payment
                          </label>
                        )}

                        {/* 🔹 OTP SECTION (FOR BOTH) */}
                        <div className="otp-section">
                          <label>Enter Delivery OTP</label>
                          <input
                            type="text"
                            value={deliveryOtp}
                            onChange={(e) => setDeliveryOtp(e.target.value)}
                            placeholder="Enter OTP"
                          />
                        </div>

                        <div className="modal-actions">
                          <button
                            className="cancel-btn"
                            onClick={() => {
                              setShowDeliveryModal(false);
                              setSelectedOrder(null);
                              setDeliveryOtp("");
                              setCashReceived(false);
                            }}
                          >
                            Cancel
                          </button>

                          <button
                            className="confirm-btn"
                            onClick={() => {
                             updateOrderStatus(selectedOrder.id, "delivered");
                              setShowDeliveryModal(false);
                              setSelectedOrder(null);
                              // 
                              setShowSuccess(true);
                              setDeliveryOtp("");
                              setCashReceived(false);
                            }}
                          >
                            Confirm Delivered
                          </button>
                        </div>
                      </div>
                    </div>


                  )}

                  {/* </div> admin-orders ends */}




                  {/*  */}



                  {o.order_status === "Delivered" ||
o.order_status === "Cancelled" ? (
  <span className="no-action">–</span>
) : (
  <>
    {/* existing buttons logic here */}
  </>
)}

                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ← Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}

      </div>


    </div>
  );
};

export default VendorOrdersPage;