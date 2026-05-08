import { useEffect, useState } from "react";
import API from "../services/api";
import "./Vendors.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiList } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/* =========================
   FILE URL HELPER
========================= */
const fileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `http://localhost:5000/${path}`;
};

/* =========================
   DOWNLOAD VENDOR PDF
========================= */
const downloadVendorPDF = async (vendor) => {
  try {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 20;

    doc.setFontSize(18);
    doc.text(vendor.shop_name || "Vendor Profile", 20, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Owner", vendor.owner_name || "-"],
        ["Email", vendor.email || "-"],
        ["Phone", vendor.phone || "-"],
        ["Location", vendor.location || "-"],
        ["Town", vendor.town || "-"],
        ["Service Radius", vendor.service_radius || "-"],
        ["Cuisine", vendor.cuisine || "-"],
        ["Operating Days", vendor.operating_days || "-"],
        ["Paid Orders", vendor.paid_orders || 0], // ✅ Added
        ["Bank", vendor.bank_name || "-"],
        ["Account Number", vendor.account_number || "-"],
        ["IFSC", vendor.ifsc_code || "-"],
      ],
    });

    doc.save(`${vendor.shop_name || "vendor"}_profile.pdf`);
  } catch (err) {
    console.error("PDF FAILED:", err);
    alert("PDF download failed");
  }
};

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  /* =========================
     FETCH VENDORS
  ========================= */
  const fetchVendors = async () => {
    try {
      const res = await API.get("/admin/vendors", {
        params: { q: search },
      });

      const safeData = res.data.map((v) => ({
        ...v,
        id: v.id ?? v.vendor_id,
        paid_orders: v.paid_orders ?? 0, // ✅ fallback
      }));

      setVendors(safeData);
    } catch (err) {
      console.error("Vendor fetch failed", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [search]);

  /* =========================
     OPEN MENUS PAGE
  ========================= */
  const openMenus = (vendor) => {
    if (!vendor?.id) return;
    navigate(`/admin/vendors/${vendor.id}/menus`);
  };

  return (
    <div className="vendors-page">
      <h2>Vendor Management</h2>
      <p className="subtitle">
        Manage and monitor mess partners on the platform
      </p>

      <input
        className="search"
        placeholder="Search vendors by name, owner or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="vendor-list">
        {vendors.map((v) => (
          <div
            className="vendor-card hover-card clickable"
            key={v.id}
            onClick={() => navigate(`/admin/vendors/${v.id}`)}
          >
            {/* SHOP NAME */}
            <div className="vc-name">
              <strong>{v.shop_name}</strong>
            </div>

            {/* STATUS */}
            <div className="vc-col">
              <span className="label">Status</span>
              <span className={`value ${v.status}`}>
                {v.status}
              </span>
            </div>

            {/* CONTACT */}
            <div className="vc-col">
              <span className="label">Contact</span>
              <span className="value">{v.phone}</span>
            </div>

            {/* LOCATION */}
            <div className="vc-col location-col">
              <span className="label">Location</span>
              <span className="value truncate">
                {v.location || "-"}
              </span>
            </div>

            {/* MENUS */}
            <div className="vc-col">
              <span className="label">Menus</span>
              <span className="value">{v.menu_count || 0}</span>
            </div>

            {/* ✅ PAID ORDERS ADDED */}
            <div className="vc-col">
              <span className="label">Orders</span>
              <span className="value orders-count">
                {v.paid_orders}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="vc-action row-actions">
              <button
                type="button"
                className="action-link"
                onClick={(e) => {
                  e.stopPropagation();
                  openMenus(v);
                }}
              >
                <FiList />
                <span>Menus</span>
              </button>

              <button
                type="button"
                className="action-link"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadVendorPDF(v);
                }}
              >
                ⬇ PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vendors;
