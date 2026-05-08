import { useEffect, useState, useMemo } from "react";
import { FaMoneyBillWave, FaFileInvoice, FaFileExport } from "react-icons/fa";
import { FaWhatsapp, FaFilePdf } from "react-icons/fa";

import { CSVLink } from "react-csv";
import API from "../services/api";
import "./AdminBills.css";

const ITEMS_PER_PAGE = 6;

const AdminBills = () => {

  const [bills, setBills] = useState([]);

  const [summary, setSummary] = useState({
  totalRevenue: 0,
  totalBills: 0
});
  
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("order_id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

//   useEffect(() => {
//   fetchBills();
//   const interval = setInterval(fetchBills, 5000); // every 5 sec
//   return () => clearInterval(interval);
// }, []);


useEffect(() => {
  fetchBills();
  fetchSummary();
}, []);




const fetchSummary = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const res = await API.get("/admin/bills/summary", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSummary({
      totalRevenue: res.data.totalRevenue || 0,
      totalBills: res.data.totalBills || 0,
    });

  } catch (err) {
    console.error("Summary fetch error", err);
  }
};

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await API.get("/admin/bills", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(res.data || []);
    } catch (err) {
      console.error("Fetch bills error", err);
    } finally {
      setLoading(false);
    }
  };

const sendBillWhatsApp = (bill) => {
  if (!bill.phone) {
    alert("Phone number not available");
    return;
  }

  const phone = bill.phone.replace(/\D/g, "");
  const message = `🧾 Your Messato Bill

Order ID: ${bill.order_id}
Amount: ₹${bill.total_amount}

Download Bill:
http://localhost:5000${bill.bill_url}`;

  const whatsappURL = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank");
};

 

  const filteredBills = useMemo(() => {
    let filtered = bills.filter(
      (b) =>
        b.phone?.includes(search) ||
        b.order_id?.toString().includes(search)
    );

    filtered.sort((a, b) => {
      const valA = Number(a[sortField]) || a[sortField];
      const valB = Number(b[sortField]) || b[sortField];

      return sortOrder === "asc"
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });

    return filtered;
  }, [bills, search, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);

  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="admin-bills">

      <h2>📄 Bills Management</h2>

      {/* SUMMARY */}
      {/* SUMMARY */}
<div className="summary-cards">
<div className="card">
  <div className="card-icon revenue-icon">
    <FaMoneyBillWave />
  </div>
  <div>
    <h3>Total Revenue</h3>
    <p>₹{Number(summary.totalRevenue).toLocaleString()}</p>
  </div>
</div>

<div className="card">
  <div className="card-icon bills-icon">
    <FaFileInvoice />
  </div>
  <div>
    <h3>Total Bills</h3>
    <p>{summary.totalBills}</p>
  </div>
</div>

  <div className="card export">
    <div className="card-icon export-icon">
      <FaFileExport />
    </div>
    <CSVLink data={bills} filename="bills.csv">
      Export to CSV
    </CSVLink>
  </div>

</div>


      {/* SEARCH + SORT */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search by Order ID or Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          onChange={(e) => setSortField(e.target.value)}
          value={sortField}
        >
          <option value="order_id">Order ID</option>
          <option value="total_amount">Amount</option>
        </select>

        <button
          onClick={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
        >
          Sort {sortOrder === "asc" ? "⬆" : "⬇"}
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading bills...</p>
      ) : paginatedBills.length === 0 ? (
        <p className="empty">No bills found</p>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>PDF</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBills.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.order_id}</td>
                    <td>{b.phone}</td>
                    <td className="amount">
                      ₹{Number(b.total_amount).toLocaleString()}
                    </td>
                    <td>
  <a
    href={
      b.bill_url?.startsWith("http")
        ? b.bill_url
        : `http://localhost:5000${b.bill_url}`
    }
    target="_blank"
    rel="noopener noreferrer"
    className="pdf-link"
  >
    <FaFilePdf /> View
  </a>
</td>
                    <td>
                     <button
  onClick={() => sendBillWhatsApp(b)}
  className="send-btn"
>
  <FaWhatsapp className="wa-icon" />
  Send
</button>


                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">

  <button
    onClick={() => setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
    className="nav-btn"
  >
    ←
  </button>

  {Array.from({ length: totalPages }, (_, i) => i + 1)
  .filter(
    (page) =>
      page >= currentPage - 1 &&
      page <= currentPage + 1
  )
  .map((pageNumber) => (
    <button
      key={pageNumber}
      className={
        currentPage === pageNumber
          ? "page-btn active"
          : "page-btn"
      }
      onClick={() => setCurrentPage(pageNumber)}
    >
      {pageNumber}
    </button>
  ))}


  <button
    onClick={() => setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="nav-btn"
  >
    →
  </button>

</div>

        </>
      )}
    </div>
  );
};

export default AdminBills;
