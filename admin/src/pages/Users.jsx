import { useEffect, useState } from "react";
import API from "../services/api";
import "./Users.css";

const LIMIT = 5;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showReason, setShowReason] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [page, search]);

  /* ================= FETCH USERS ================= */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get("/admin/users", {
          params: {
            page,
            limit: LIMIT,
            search,
          },
        }),
        API.get("/admin/users/stats"),
      ]);

      // ✅ SAFE DATA EXTRACTION (MOST IMPORTANT FIX)
      const responseUsers =
        usersRes?.data?.users ||
        usersRes?.data?.data ||
        usersRes?.data ||
        [];

      setUsers(Array.isArray(responseUsers) ? responseUsers : []);

      const total =
        usersRes?.data?.total ||
        usersRes?.data?.count ||
        responseUsers.length;

      setTotalPages(Math.max(1, Math.ceil(total / LIMIT)));

      setStats(statsRes?.data || {});
    } catch (err) {
      console.error("Users fetch failed", err);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  /* ================= BLOCK / UNBLOCK ================= */
  const toggleStatus = () => {
    if (selected.status === "active") {
      setShowReason(true);
    } else {
      updateStatus("active");
    }
  };

  const updateStatus = async (status) => {
    try {
      await API.put(`/admin/users/${selected.id}/status`, {
        status,
        reason: blockReason,
      });
      setSelected(null);
      setShowReason(false);
      setBlockReason("");
      fetchAll();
    } catch (err) {
      console.error("Status update failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="users-page">
      <h2>User Management</h2>
      <p className="subtitle">View and manage platform users</p>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>{stats.total || 0}</h4>
          <span>Total Users</span>
        </div>
        <div className="stat-card green">
          <h4>{stats.active || 0}</h4>
          <span>Active Users</span>
        </div>
        <div className="stat-card red">
          <h4>{stats.blocked || 0}</h4>
          <span>Blocked Users</span>
        </div>
        <div className="stat-card blue">
          <h4>{stats.newWeek || 0}</h4>
          <span>New This Week</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="user-toolbar">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

     {/* USERS LIST */}
{loading ? (
  <p className="loading">Loading users...</p>
) : users.length === 0 ? (
  <p className="empty">No users found</p>
) : (
  <div className="users-list">
    {users.map((u) => (
      <div className="user-card" key={u.id}>
        {/* LEFT */}
        <div className="user-left">
          <h4>{u.name || "N/A"}</h4>
          <span>{u.user_number || "-"}</span>
        </div>

        {/* MIDDLE (PLAIN COLUMNS) */}
        <div className="user-meta">
          <div className="meta-col">
            <label>Status</label>
            <span className={`status ${u.status}`}>
              {u.status}
            </span>
          </div>

          <div className="meta-col">
            <label>Orders</label>
            <span>{u.orders || 0}</span>
          </div>

          <div className="meta-col">
            <label>Location</label>
            <span>{u.location || "-"}</span>
          </div>

          <div className="meta-col">
            <label>Subscriptions</label>
            <span>{u.subscriptions || 0}</span>
          </div>

          <div className="meta-col">
            <label>Joined</label>
            <span>
              {u.created_at
                ? new Date(u.created_at).toLocaleDateString()
                : "-"}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <button
          className="view-link"
          onClick={() => setSelected(u)}
        >
          View Details
        </button>
      </div>
    ))}
  </div>
)}

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* DRAWER */}
      {selected && (
        <div className="drawer-overlay" onClick={() => setSelected(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.name}</h3>
            <p><b>Email:</b> {selected.email || "-"}</p>
            <p><b>Phone:</b> {selected.user_number}</p>

            {selected.status === "blocked" && (
              <div className="blocked-reason">
                {selected.block_reason || "Policy violation"}
              </div>
            )}

            <button
              className={selected.status === "active" ? "danger" : "success"}
              onClick={toggleStatus}
            >
              {selected.status === "active"
                ? "Block User"
                : "Unblock User"}
            </button>
          </div>
        </div>
      )}

      {/* BLOCK MODAL */}
      {showReason && (
        <div className="drawer-overlay">
          <div className="block-modal">
            <h4>Block User</h4>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter block reason..."
            />
            <button
              className="danger"
              onClick={() => updateStatus("blocked")}
            >
              Confirm Block
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
