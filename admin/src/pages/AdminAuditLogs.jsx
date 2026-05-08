// import { useEffect, useState } from "react";
// import API from "../services/api";
// import "./adminAudit.css";

// const TABS = [
//   { key: "admin", label: "Admin Logs" },
//   { key: "users", label: "User Logs" },
//   { key: "vendors", label: "Vendor Logs" }
// ];

// const AdminAuditLogs = () => {
//   const [activeTab, setActiveTab] = useState("admin");
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchLogs(activeTab);
//   }, [activeTab]);

//   const fetchLogs = async (type) => {
//   try {
//     setLoading(true);
//     const res = await API.get(`/admin/audit?entity=${type}`);
//     setLogs(res.data || []);
//   } catch (err) {
//     console.error("AUDIT ERROR", err);
//     setLogs([]);
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div className="audit-page">
//       <h1>Audit Logs</h1>

//       <div className="audit-tabs">
//         {TABS.map((t) => (
//           <button
//             key={t.key}
//             className={activeTab === t.key ? "active" : ""}
//             onClick={() => setActiveTab(t.key)}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       <div className="audit-table-wrapper">
//         {loading ? (
//           <p className="loading">Loading...</p>
//         ) : logs.length === 0 ? (
//           <p className="empty">No logs found</p>
//         ) : (
//           <table className="audit-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Email</th>
//                 <th>Action</th>
//                 <th>Entity</th>
//                 <th>Description</th>
//                 <th>IP</th>
//                 <th>Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {logs.map((l) => (
//                 <tr key={l.id}>
//                   <td>{l.id}</td>
//                   <td>{l.email || "-"}</td>
//                   <td>
//                     <span className={`badge ${l.action}`}>
//                       {l.action}
//                     </span>
//                   </td>
//                   <td>{l.entity}</td>
//                   <td>{l.description}</td>
//                   <td>{l.ip_address}</td>
//                   <td>{new Date(l.created_at).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminAuditLogs;


import { useEffect, useState } from "react";
import API from "../services/api";
import "./adminAudit.css";

/* ✅ ENTITY KEYS MUST MATCH BACKEND */
const TABS = [
  { key: "admin", label: "Admin Logs" },
  { key: "user", label: "User Logs" },
  { key: "vendor", label: "Vendor Logs" }
];

const AdminAuditLogs = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs(activeTab);
  }, [activeTab]);

  const fetchLogs = async (entity) => {
    try {
      setLoading(true);

      const res = await API.get(
        `/admin/audit?entity=${entity}`
      );

      setLogs(res.data || []);
    } catch (err) {
      console.error("❌ AUDIT FETCH ERROR:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audit-page">
      <h1>Audit Logs</h1>

      {/* 🔘 TABS */}
      <div className="audit-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 📋 TABLE */}
      <div className="audit-table-wrapper">
        {loading ? (
          <p className="loading">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="empty">No logs found</p>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Admin Email</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Description</th>
                <th>IP</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.email || "-"}</td>

                  <td>
                    <span className={`badge ${l.action}`}>
                      {l.action}
                    </span>
                  </td>

                  <td className="entity">{l.entity}</td>
                  <td>{l.description || "-"}</td>
                  <td>{l.ip_address || "-"}</td>
                  <td>
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
