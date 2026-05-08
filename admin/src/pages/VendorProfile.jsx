import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./VendorProfile.css";

import { FiShoppingBag, FiDollarSign } from "react-icons/fi";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiCoffee,
  FiSun
} from "react-icons/fi";



const fileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:5000/${path}`;
};


export default function VendorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [documents, setDocuments] = useState([]);



  const fetchDocuments = async () => {
  try {
    const res = await API.get(`/admin/vendors/${id}/documents`);
    setDocuments(res.data);
  } catch (err) {
    console.error(err);
  }
};



  // ✅ NEW STATE FOR STATS
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchVendor();
    fetchStats(); // ✅ added
  }, []);

  const fetchVendor = async () => {
    try {
      const res = await API.get(`/admin/vendors/${id}`);
      setVendor(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ NEW FUNCTION
  const fetchStats = async () => {
    try {
      const res = await API.get(`/admin/vendors/${id}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch failed", err);
    }
  };

  /* =========================
     APPROVE
  ========================= */
  const approveVendor = async () => {
    try {
      await API.put(`/admin/vendors/${id}/status`, {
        status: "approved",
      });
      fetchVendor();
      fetchStats(); // refresh stats
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  /* =========================
     REJECT
  ========================= */
  const rejectVendor = async () => {
    if (!reason.trim()) {
      alert("Please enter reject reason");
      return;
    }

    try {
      await API.put(`/admin/vendors/${id}/status`, {
        status: "rejected",
        reason,
      });

      setShowReject(false);
      setReason("");
      fetchVendor();
      fetchStats(); // refresh stats
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  /* =========================
     PDF DOWNLOAD
  ========================= */
  const downloadVendorPDF = () => {
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
        ["Phone", vendor.mobile || "-"],
        ["Location", vendor.location || "-"],
        ["Town", vendor.town || "-"],
        ["Service Radius", vendor.service_radius || "-"],
        ["Cuisine", vendor.cuisine || "-"],
        ["Operating Days", vendor.operating_days || "-"],
        ["Bank", vendor.bank_name || "-"],
        ["Account Number", vendor.account_number || "-"],
        ["IFSC", vendor.ifsc_code || "-"],
      ],
    });

    doc.save(`${vendor.shop_name || "vendor"}_profile.pdf`);
  };

  if (!vendor) return <div className="loading">Loading...</div>;

  return (
    <div className="vendor-profile-page">

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate("/admin/vendors")}>
        ← Back to Vendors
      </button>

      {/* HERO SECTION */}
      <div className="vp-hero">
        {vendor.profile_image ? (
          <img src={fileUrl(vendor.profile_image)} alt="" />
        ) : (
          <div className="vp-placeholder">
            {vendor.shop_name?.[0]}
          </div>
        )}

        <div className="vp-hero-overlay">
          <h1>{vendor.shop_name}</h1>
          <span className={`status-badge ${vendor.status}`}>
            {vendor.status}
          </span>
        </div>
      </div>

      <div className="vp-content fade-in">

        {/* =========================
   BASIC INFO SECTION
========================= */}
<div className="vp-basic-info">
  <div className="basic-card">
    <span className="basic-label">Owner</span>
    <span className="basic-value">{vendor.owner_name}</span>
  </div>

  <div className="basic-card">
    <span className="basic-label">Location</span>
    <span className="basic-value location-text">
      {vendor.location}
    </span>
  </div>
</div>

        

        {/* SHOW REJECT REASON */}
        {vendor.status === "rejected" && vendor.reject_reason && (
          <div className="reject-display">
            <strong>Reject Reason:</strong>
            <p>{vendor.reject_reason}</p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="vp-actions">
          {vendor.status !== "approved" && (
            <button className="approve-btn" onClick={approveVendor}>
              ✓ Approve
            </button>
          )}

          {vendor.status !== "rejected" && (
            <button
              className="reject-btn"
              onClick={() => setShowReject(true)}
            >
              ✕ Reject
            </button>
          )}

          <button className="pdf-btn" onClick={downloadVendorPDF}>
            ⬇ Download PDF
          </button>
        </div>

        {/* REJECT MODAL */}
        {showReject && (
          <div className="reject-box animate-scale">
            <textarea
              placeholder="Enter reject reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="reject-actions">
              <button onClick={() => setShowReject(false)}>Cancel</button>
              <button className="reject-btn" onClick={rejectVendor}>
                Confirm Reject
              </button>
            </div>
          </div>
        )}

        <div className="vp-grid">

  {/* CONTACT */}
  <div className="vp-card">
    <div className="card-header">
      <FiPhone className="card-icon blue" />
      <h4>Contact</h4>
    </div>
    <p><FiMail className="mini-icon" /> {vendor.email}</p>
    <p><FiPhone className="mini-icon" /> {vendor.mobile}</p>
  </div>

  {/* SERVICE AREA */}
  <div className="vp-card">
    <div className="card-header">
      <FiMapPin className="card-icon purple" />
      <h4>Service Area</h4>
    </div>
    <p>Town: {vendor.town}</p>
    <p>Radius: {vendor.service_radius} km</p>
  </div>

  {/* FOOD DETAILS */}
  <div className="vp-card">
    <div className="card-header">
      <FiCoffee className="card-icon orange" />
      <h4>Food Details</h4>
    </div>
    <p>Cuisine: {vendor.cuisine}</p>
    <p>Operating: {vendor.operating_days}</p>
  </div>

  {/* MEALS */}
  <div className="vp-card">
    <div className="card-header">
      <FiSun className="card-icon green" />
      <h4>Meals</h4>
    </div>
    <p>Breakfast: {vendor.breakfast ? "Yes" : "No"}</p>
    <p>Lunch: {vendor.lunch ? "Yes" : "No"}</p>
    <p>Dinner: {vendor.dinner ? "Yes" : "No"}</p>
  </div>

</div>


        {/* ✅ REVENUE STATS SECTION */}
{stats && (
  <div className="vp-stats">

    <div className="stat-card">
      <div className="stat-icon orders">
        <FiShoppingBag />
      </div>

      <div className="stat-info">
        <span className="stat-label">Total Orders</span>
        <h3>{stats.total_orders}</h3>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon revenue">
        <FiDollarSign />
      </div>

      <div className="stat-info">
        <span className="stat-label">Total Revenue</span>
        <h3>
          ₹ {Number(stats.total_revenue).toLocaleString()}
        </h3>
      </div>
    </div>

  </div>
)}



        {/* DOCUMENTS */}
        <div className="vp-section">
          <h3>Documents</h3>

          <div className="doc-grid">
            {vendor.fssai_certificate && (
              <button
                className="doc-btn"
                onClick={() =>
                  setPreviewDoc(fileUrl(vendor.fssai_certificate))
                }
              >
                FSSAI Certificate
              </button>
            )}

            {vendor.gst_certificate && (
              <button
                className="doc-btn"
                onClick={() =>
                  setPreviewDoc(fileUrl(vendor.gst_certificate))
                }
              >
                GST Certificate
              </button>
            )}

            {vendor.shop_act_license && (
              <button
                className="doc-btn"
                onClick={() =>
                  setPreviewDoc(fileUrl(vendor.shop_act_license))
                }
              >
                Shop Act License
              </button>
            )}
          </div>
        </div>

        {/* BANK */}
        <div className="vp-section">
          <h3>Bank Details</h3>
          <div className="vp-bank">
            <p><strong>Account Holder:</strong> {vendor.account_holder}</p>
            <p><strong>Bank:</strong> {vendor.bank_name}</p>
            <p><strong>Account:</strong> {vendor.account_number}</p>
            <p><strong>IFSC:</strong> {vendor.ifsc_code}</p>
          </div>
        </div>

      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {/* DOCUMENT PREVIEW MODAL */}
{previewDoc && (
  <div
    className="preview-overlay"
    onClick={() => {
      setPreviewDoc(null);
      setZoom(1);
    }}
  >
    <div
      className="preview-box animate-scale"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="preview-header">
        <div className="preview-title">
          📄 {previewDoc.split("/").pop()}
        </div>

        <div className="preview-actions">
          {!previewDoc.endsWith(".pdf") && (
            <>
              <button
                className="zoom-btn"
                onClick={() => setZoom((z) => z + 0.1)}
              >
                +
              </button>
              <button
                className="zoom-btn"
                onClick={() =>
                  setZoom((z) => (z > 0.2 ? z - 0.1 : z))
                }
              >
                −
              </button>
            </>
          )}

          <a
            href={previewDoc}
            download
            className="download-btn"
          >
            ⬇ Download
          </a>

          <button
            className="close-btn"
            onClick={() => {
              setPreviewDoc(null);
              setZoom(1);
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="preview-content">
        {previewDoc.endsWith(".pdf") ? (
          <iframe
            src={previewDoc}
            title="Document Preview"
            frameBorder="0"
          />
        ) : (
          <img
            src={previewDoc}
            alt="Document"
            className="preview-image"
            style={{ transform: `scale(${zoom})` }}
          />
        )}
      </div>
    </div>
  </div>
)}
   </div>
  );
}
