// import { useEffect, useState } from "react";
// import API from "../services/api";
// import "./Orders.css";

// const Orders = () => {
//   const [orders, setOrders] = useState([]);

//   // cancel modal
//   const [cancelReason, setCancelReason] = useState("");
//   const [cancelId, setCancelId] = useState(null);

//   // filters
//   const [statusFilter, setStatusFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   // search
//   const [search, setSearch] = useState("");

//   // pagination
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 10;

//   /* =========================
//      FETCH ORDERS
//   ========================= */
//   const fetchOrders = async (pageNo = page) => {
//     try {
//       const res = await API.get("/admin/orders", {
//         params: {
//           status: statusFilter || undefined,
//           from: fromDate || undefined,
//           to: toDate || undefined,
//           search: search || undefined,
//           page: pageNo,
//           limit,
//         },
//       });

//       setOrders(res.data.data || []);
//       setTotalPages(res.data.pagination.totalPages || 1);
//       setPage(pageNo);
//     } catch (err) {
//       console.error("❌ Orders fetch error", err);
//     }
//   };

//   useEffect(() => {
//     fetchOrders(1);
//   }, []);

//   /* =========================
//      UPDATE STATUS
//   ========================= */
//   const updateStatus = async (id, action, reason = "") => {
//     try {
//       await API.put(`/admin/orders/${id}/${action}`, { reason });
//       setCancelId(null);
//       setCancelReason("");
//       fetchOrders(page);
//     } catch (err) {
//       console.error("❌ Update status error", err);
//     }
//   };

//   return (
//     <div className="orders">
//       <h2>Orders</h2>

//       {/* ================= SEARCH ================= */}
//       <div className="search-box">
//         <input
//           type="text"
//           placeholder="Search Order ID / User / Vendor"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//         <button onClick={() => fetchOrders(1)}>Search</button>
//       </div>

//       {/* ================= FILTERS ================= */}
//       <div className="filters">
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="">All Status</option>
//           <option value="pending">Pending</option>
//           <option value="accepted">Accepted</option>
//           <option value="delivered">Delivered</option>
//           <option value="cancelled">Cancelled</option>
//         </select>

//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//         />

//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => setToDate(e.target.value)}
//         />

//         <button onClick={() => fetchOrders(1)}>Apply</button>

//         <button
//           className="reset"
//           onClick={() => {
//             setStatusFilter("");
//             setFromDate("");
//             setToDate("");
//             setSearch("");
//             fetchOrders(1);
//           }}
//         >
//           Reset
//         </button>
//       </div>

//       {/* ================= TABLE ================= */}
//       <div className="table-wrapper">
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>User</th>
//               <th>Vendor</th>
//               <th>Amount</th>
//               <th>Status</th>
//               <th>Cancel Reason</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.length === 0 && (
//               <tr>
//                 <td colSpan="7" style={{ textAlign: "center" }}>
//                   No orders found
//                 </td>
//               </tr>
//             )}

//             {orders.map((o) => (
//               <tr key={o.id}>
//                 <td>{o.id}</td>
//                 <td>{o.user_name}</td>
//                 <td>{o.vendor_name}</td>
//                 <td>₹{o.total_amount}</td>

//                 <td className={`status ${o.status}`}>
//                   {o.status}
//                 </td>

//                 <td>{o.cancel_reason || "-"}</td>

//                 <td>
//                   {o.status === "pending" && (
//                     <>
//                       <button
//                         className="accept"
//                         onClick={() => updateStatus(o.id, "accept")}
//                       >
//                         Accept
//                       </button>

//                       <button
//                         className="cancel"
//                         onClick={() => setCancelId(o.id)}
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   )}

//                   {o.status === "accepted" && (
//                     <button
//                       className="deliver"
//                       onClick={() => updateStatus(o.id, "deliver")}
//                     >
//                       Deliver
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>


//       {/* ================= MOBILE CARD VIEW ================= */}
// <div className="orders-cards">
//   {orders.length === 0 && (
//     <p className="no-data">No orders found</p>
//   )}

//   {orders.map((o) => (
//     <div key={o.id} className="order-card">
//       <div className="card-row">
//         <span>ID</span>
//         <strong>#{o.id}</strong>
//       </div>

//       <div className="card-row">
//         <span>User</span>
//         <strong>{o.user_name}</strong>
//       </div>

//       <div className="card-row">
//         <span>Vendor</span>
//         <strong>{o.vendor_name}</strong>
//       </div>

//       <div className="card-row">
//         <span>Amount</span>
//         <strong>₹{o.total_amount}</strong>
//       </div>

//       <div className={`status-badge ${o.status}`}>
//         {o.status}
//       </div>

//       {o.cancel_reason && (
//         <div className="cancel-reason">
//           <strong>Reason:</strong> {o.cancel_reason}
//         </div>
//       )}

//       <div className="card-actions">
//         {o.status === "pending" && (
//           <>
//             <button
//               className="accept"
//               onClick={() => updateStatus(o.id, "accept")}
//             >
//               Accept
//             </button>
//             <button
//               className="cancel"
//               onClick={() => setCancelId(o.id)}
//             >
//               Cancel
//             </button>
//           </>
//         )}

//         {o.status === "accepted" && (
//           <button
//             className="deliver"
//             onClick={() => updateStatus(o.id, "deliver")}
//           >
//             Deliver
//           </button>
//         )}
//       </div>
//     </div>
//   ))}
// </div>


//       {/* ================= PAGINATION ================= */}
//       <div className="pagination">
//         <button disabled={page === 1} onClick={() => fetchOrders(page - 1)}>
//           Prev
//         </button>

//         <span>
//           Page {page} / {totalPages}
//         </span>

//         <button
//           disabled={page === totalPages}
//           onClick={() => fetchOrders(page + 1)}
//         >
//           Next
//         </button>
//       </div>

//       {/* ================= CANCEL MODAL ================= */}
//       {cancelId && (
//         <div className="modal">
//           <div className="modal-box">
//             <h3>Cancel Order</h3>

//             <textarea
//               placeholder="Enter cancel reason..."
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//             />

//             <div className="modal-actions">
//               <button
//                 className="danger"
//                 onClick={() =>
//                   updateStatus(cancelId, "cancel", cancelReason)
//                 }
//               >
//                 Confirm Cancel
//               </button>

//               <button onClick={() => setCancelId(null)}>Close</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;

// block reason states



import { useEffect, useState, useRef } from "react";
import API from "../services/api";

import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  // cancel modal
  const [cancelReason, setCancelReason] = useState("");
  const [cancelId, setCancelId] = useState(null);

  // filters
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // search
  const [search, setSearch] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  /* =========================
     SWIPE REFS
  ========================= */
  const startX = useRef(0);
  const currentX = useRef(0);

  /* =========================
     FETCH ORDERS
  ========================= */
  const fetchOrders = async (pageNo = page) => {
    try {
      const res = await API.get("/admin/orders", {
        params: {
          status: statusFilter || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
          search: search || undefined,
          page: pageNo,
          limit,
        },
      });

      setOrders(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setPage(pageNo);
    } catch (err) {
      console.error("❌ Orders fetch error", err);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  /* =========================
     UPDATE STATUS
  ========================= */
  const updateStatus = async (id, action, reason = "") => {
    try {
      await API.put(`/admin/orders/${id}/${action}`, { reason });
      setCancelId(null);
      setCancelReason("");
      fetchOrders(page);
    } catch (err) {
      console.error("❌ Update status error", err);
    }
  };

  /* =========================
     SWIPE HANDLERS (MOBILE)
  ========================= */
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e, card) => {
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    if (Math.abs(diff) > 10) {
      card.style.transform = `translateX(${diff}px)`;
    }
  };

  const handleTouchEnd = (order, card) => {
    const diff = currentX.current - startX.current;
    card.style.transform = "translateX(0)";

    // 👉 swipe right
    if (diff > 80 && order.status === "pending") {
      updateStatus(order.id, "accept");
    }

    // 👉 swipe left
    if (diff < -80 && order.status === "pending") {
      setCancelId(order.id);
    }
  };

  return (
    <div className="orders">
      <h2>Orders</h2>

      {/* ================= SEARCH ================= */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search Order ID / User / Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => fetchOrders(1)}>Search</button>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

        <button onClick={() => fetchOrders(1)}>Apply</button>

        <button
          className="reset"
          onClick={() => {
            setStatusFilter("");
            setFromDate("");
            setToDate("");
            setSearch("");
            fetchOrders(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>ID</th>
              <th>User</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Cancel Reason</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((o, index) => (
              <tr key={o.id}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{o.id}</td>
                <td>{o.user_name}</td>
                <td>{o.vendor_name}</td>
                <td>₹{o.total_amount}</td>
                <td className={`status ${o.status}`}>{o.status}</td>
                <td>{o.cancel_reason || "-"}</td>
                <td>
                  {o.status === "pending" && (
                    <>
                      <button className="accept" onClick={() => updateStatus(o.id, "accept")}>
                        Accept
                      </button>
                      <button className="cancel" onClick={() => setCancelId(o.id)}>
                        Cancel
                      </button>
                    </>
                  )}

                  {o.status === "accepted" && (
                    <button className="deliver" onClick={() => updateStatus(o.id, "deliver")}>
                      Deliver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARD + SWIPE ================= */}
      <div className="orders-cards">
        {orders.map((o) => (
          <div
            key={o.id}
            className="order-card swipe-card"
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e, e.currentTarget)}
            onTouchEnd={(e) => handleTouchEnd(o, e.currentTarget)}
          >
            <div className="card-row"><span>ID</span><strong>#{o.id}</strong></div>
            <div className="card-row"><span>User</span><strong>{o.user_name}</strong></div>
            <div className="card-row"><span>Vendor</span><strong>{o.vendor_name}</strong></div>
            <div className="card-row"><span>Amount</span><strong>₹{o.total_amount}</strong></div>

            <div className={`status-badge ${o.status}`}>{o.status}</div>

            {o.cancel_reason && (
              <div className="cancel-reason">
                <strong>Reason:</strong> {o.cancel_reason}
              </div>
            )}

            <div className="swipe-hint left">Accept</div>
            <div className="swipe-hint right">Cancel</div>
          </div>
        ))}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => fetchOrders(page - 1)}>
          Prev
        </button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => fetchOrders(page + 1)}>
          Next
        </button>
      </div>

      {/* ================= CANCEL MODAL ================= */}
      {cancelId && (
        <div className="modal">
          <div className="modal-box">
            <h3>Cancel Order</h3>
            <textarea
              placeholder="Enter cancel reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="danger"
                onClick={() => updateStatus(cancelId, "cancel", cancelReason)}
              >
                Confirm Cancel
              </button>
              <button onClick={() => setCancelId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
