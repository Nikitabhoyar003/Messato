// import { useEffect, useState } from "react";
// import { Plus, Link2 } from "lucide-react";

// import "./AdminSubscriptions.css";

// const API = "http://localhost:5000";

// const AdminSubscriptions = () => {
//   const [plans, setPlans] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [userSubs, setUserSubs] = useState([]);
//   const [vendorSubs, setVendorSubs] = useState([]);


//   // 🔴 ADD THESE STATES (top me, useState ke saath)
// const [showModal, setShowModal] = useState(false);
// const [editPlan, setEditPlan] = useState(null);
//     /* ===================== DELETE PLAN ===================== */


//     const handleDeletePlan = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this plan?")) return;

//     await fetch(`${API}/api/subscriptions/plans/${id}`, {
//       method: "DELETE"
//     });

//     safeFetch(`${API}/api/subscriptions/plans`, setPlans);
//   };

//   const [form, setForm] = useState({
//     type: "user",
//     name: "",
//     price: "",
//     duration_days: "",
//     features: ""
//   });

//   const [assign, setAssign] = useState({
//     targetType: "user",
//     targetId: "",
//     planId: "",
//     start_date: "",
//     end_date: ""
//   });

//   /* ===================== FETCH HELPERS ===================== */
//   const safeFetch = async (url, setter) => {
//     try {
//       const res = await fetch(url);
//       const data = await res.json();
//       setter(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("FETCH ERROR:", url, err);
//       setter([]);
//     }
//   };

//   /* ===================== INITIAL LOAD ===================== */
//   useEffect(() => {
//     safeFetch(`${API}/api/subscriptions/plans`, setPlans);
//     // safeFetch(`${API}/api/admin/users`, setUsers);
//     safeFetch(`${API}/api/admin/users/list/simple`, setUsers);
//     // safeFetch(`${API}/api/admin/vendors`, setVendors);
//     safeFetch(`${API}/api/admin/vendors/list/simple`, setVendors);
//     safeFetch(`${API}/api/subscriptions/user-subscriptions`, setUserSubs);
//     safeFetch(`${API}/api/subscriptions/vendor-subscriptions`, setVendorSubs);
//   }, []);

//   /* ===================== CREATE PLAN ===================== */
//   const handlePlanChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleCreatePlan = async (e) => {
//     e.preventDefault();

//     let parsedFeatures = {};
//     try {
//       parsedFeatures = form.features ? JSON.parse(form.features) : {};
//     } catch {
//       alert("❌ Features must be valid JSON");
//       return;
//     }

//     try {
//       const res = await fetch(`${API}/api/subscriptions/plans`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: form.type,
//           name: form.name,
//           price: Number(form.price),
//           duration_days: Number(form.duration_days),
//           features: parsedFeatures
//         })
//       });

//       if (!res.ok) throw new Error();

//       alert("✅ Plan created");
//       safeFetch(`${API}/api/subscriptions/plans`, setPlans);
//       setForm({ type: "user", name: "", price: "", duration_days: "", features: "" });
//     } catch {
//       alert("❌ Create plan failed");
//     }
//   };



//   const handleUpdatePlan = async () => {
//   await fetch(`${API}/api/subscriptions/plans/${editPlan.id}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(editPlan)
//   });

//   setShowModal(false);
//   setEditPlan(null);
//   safeFetch(`${API}/api/subscriptions/plans`, setPlans);
// };


//   /* ===================== ASSIGN PLAN ===================== */
//   const handleAssignChange = (e) => {
//     setAssign({ ...assign, [e.target.name]: e.target.value });
//   };

//   const handleAssign = async (e) => {
//     e.preventDefault();

//     const endpoint =
//       assign.targetType === "user"
//         ? "assign-user"
//         : "assign-vendor";

//     const payload =
//       assign.targetType === "user"
//         ? {
//             user_id: assign.targetId,
//             plan_id: assign.planId,
//             start_date: assign.start_date,
//             end_date: assign.end_date
//           }
//         : {
//             vendor_id: assign.targetId,
//             plan_id: assign.planId,
//             start_date: assign.start_date,
//             end_date: assign.end_date
//           };

//     try {
//       const res = await fetch(`${API}/api/subscriptions/${endpoint}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       if (!res.ok) throw new Error();

//       alert("✅ Subscription assigned");

//       safeFetch(`${API}/api/subscriptions/user-subscriptions`, setUserSubs);
//       safeFetch(`${API}/api/subscriptions/vendor-subscriptions`, setVendorSubs);

//       setAssign({
//         targetType: "user",
//         targetId: "",
//         planId: "",
//         start_date: "",
//         end_date: ""
//       });
//     } catch {
//       alert("❌ Assign failed");
//     }
//   };

//   /* ===================== UI ===================== */
//   return (
//     <div className="admin-subscription">
//       <h1>Subscription Dashboard</h1>
      


//       {/* ========== CREATE PLAN ========== */}
//       <h2>Create Plan</h2>
//       <form className="plan-form" onSubmit={handleCreatePlan}>
//         <select name="type" value={form.type} onChange={handlePlanChange}>
//           <option value="user">User</option>
//           <option value="vendor">Vendor</option>
//         </select>

//         <input name="name" placeholder="Plan Name" value={form.name} onChange={handlePlanChange} required />
//         <input type="number" name="price" placeholder="Price ₹" value={form.price} onChange={handlePlanChange} required />
//         <input type="number" name="duration_days" placeholder="Duration (days)" value={form.duration_days} onChange={handlePlanChange} required />

//         <textarea
//           name="features"
//           placeholder='Example: {"meals":"2/day","support":"priority"}'
//           value={form.features}
//           onChange={handlePlanChange}
//         />

//         <button className="primary-btn">
//   <Plus size={14} /> Create
// </button>

//       </form>


import { useEffect, useState } from "react";


import { Plus } from "lucide-react";
import "./AdminSubscriptions.css";

import {
  Utensils,
  Leaf,
  Clock,
  CalendarDays,
  Headphones,
  SlidersHorizontal
} from "lucide-react";



const API = "http://localhost:5000";



const AdminSubscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
const [selectedFeatures, setSelectedFeatures] = useState(null);
const [selectedPlanType, setSelectedPlanType] = useState(null);

  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [userSubs, setUserSubs] = useState([]);
  const [vendorSubs, setVendorSubs] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);

  /* ===================== CREATE PLAN FORM ===================== */
  const [form, setForm] = useState({
    type: "user",
    name: "",
    price: "",
    duration_days: ""
  });

  /* 🔥 AUTO FEATURES (TIFFIN BASED) */
  const [features, setFeatures] = useState({
    meals_per_day: "2",
    meal_type: "veg",
    delivery_time: "lunch",
    includes_weekend: "yes",
    support: "standard",
    customization: "no"
  });

  /* ===================== ASSIGN FORM ===================== */
  const [assign, setAssign] = useState({
    targetType: "user",
    targetId: "",
    planId: "",
    start_date: "",
    end_date: ""
  });

  /* ===================== HELPERS ===================== */
  const safeFetch = async (url, setter) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      setter(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH ERROR:", url, err);
      setter([]);
    }
  };

  /* ===================== INITIAL LOAD ===================== */
  useEffect(() => {
    safeFetch(`${API}/api/subscriptions/plans`, setPlans);
    safeFetch(`${API}/api/admin/users/list/simple`, setUsers);
    safeFetch(`${API}/api/admin/vendors/list/simple`, setVendors);
    safeFetch(`${API}/api/subscriptions/user-subscriptions`, setUserSubs);
    safeFetch(`${API}/api/subscriptions/vendor-subscriptions`, setVendorSubs);
  }, []);

  /* ===================== HANDLERS ===================== */
  const handlePlanChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFeatureChange = (e) => {
    setFeatures({ ...features, [e.target.name]: e.target.value });
  };

  const handleAssignChange = (e) => {
    setAssign({ ...assign, [e.target.name]: e.target.value });
  };

  /* ===================== CREATE PLAN ===================== */
  const handleCreatePlan = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/subscriptions/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          name: form.name,
          price: Number(form.price),
          duration_days: Number(form.duration_days),
          features: {
            meals_per_day: Number(features.meals_per_day),
            meal_type: features.meal_type,
            delivery_time: features.delivery_time,
            includes_weekend: features.includes_weekend === "yes",
            support: features.support,
            customization: features.customization === "yes"
          }
        })
      });

      if (!res.ok) throw new Error();

      alert("✅ Plan created successfully");
      safeFetch(`${API}/api/subscriptions/plans`, setPlans);

      setForm({ type: "user", name: "", price: "", duration_days: "" });
    } catch {
      alert("❌ Create plan failed");
    }
  };

  /* ===================== DELETE PLAN ===================== */
  const handleDeletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;

    await fetch(`${API}/api/subscriptions/plans/${id}`, {
      method: "DELETE"
    });

    safeFetch(`${API}/api/subscriptions/plans`, setPlans);
  };

  /* ===================== ASSIGN PLAN ===================== */
  const handleAssign = async (e) => {
    e.preventDefault();

    const endpoint =
      assign.targetType === "user" ? "assign-user" : "assign-vendor";

    const payload =
      assign.targetType === "user"
        ? {
            user_id: assign.targetId,
            plan_id: assign.planId,
            start_date: assign.start_date,
            end_date: assign.end_date
          }
        : {
            vendor_id: assign.targetId,
            plan_id: assign.planId,
            start_date: assign.start_date,
            end_date: assign.end_date
          };

    try {
      const res = await fetch(`${API}/api/subscriptions/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      alert("✅ Subscription assigned");
      safeFetch(`${API}/api/subscriptions/user-subscriptions`, setUserSubs);
      safeFetch(`${API}/api/subscriptions/vendor-subscriptions`, setVendorSubs);

      setAssign({
        targetType: "user",
        targetId: "",
        planId: "",
        start_date: "",
        end_date: ""
      });
    } catch {
      alert("❌ Assign failed");
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="admin-subscription">
      <h1>Subscription Dashboard</h1>

      {/* ========== CREATE PLAN ========== */}
      <h2>Create Tiffin Plan</h2>

      <form className="plan-form" onSubmit={handleCreatePlan}>
        <select name="type" value={form.type} onChange={handlePlanChange}>
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
        </select>

        <input
          name="name"
          placeholder="Plan Name"
          value={form.name}
          onChange={handlePlanChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price ₹"
          value={form.price}
          onChange={handlePlanChange}
          required
        />

        <input
          type="number"
          name="duration_days"
          placeholder="Duration (days)"
          value={form.duration_days}
          onChange={handlePlanChange}
          required
        />

        {/* 🔥 AUTO FEATURES */}
        <h3>Plan Features</h3>

<div className="feature-field">
  <Utensils size={18} />
  <select
    name="meals_per_day"
    value={features.meals_per_day}
    onChange={handleFeatureChange}
  >
    <option value="1">1 Meal / Day</option>
    <option value="2">2 Meals / Day</option>
    <option value="3">3 Meals / Day</option>
  </select>
</div>

<div className="feature-field">
  <Leaf size={18} />
  <select
    name="meal_type"
    value={features.meal_type}
    onChange={handleFeatureChange}
  >
    <option value="veg">Veg</option>
    <option value="non-veg">Non-Veg</option>
    <option value="both">Veg + Non-Veg</option>
  </select>
</div>

<div className="feature-field">
  <Clock size={18} />
  <select
    name="delivery_time"
    value={features.delivery_time}
    onChange={handleFeatureChange}
  >
    <option value="lunch">Lunch</option>
    <option value="dinner">Dinner</option>
    <option value="lunch+dinner">Lunch + Dinner</option>
  </select>
</div>

<div className="feature-field">
  <CalendarDays size={18} />
  <select
    name="includes_weekend"
    value={features.includes_weekend}
    onChange={handleFeatureChange}
  >
    <option value="yes">Includes Weekend</option>
    <option value="no">Weekdays Only</option>
  </select>
</div>

<div className="feature-field">
  <Headphones size={18} />
  <select
    name="support"
    value={features.support}
    onChange={handleFeatureChange}
  >
    <option value="standard">Standard Support</option>
    <option value="priority">Priority Support</option>
  </select>
</div>

<div className="feature-field">
  <SlidersHorizontal size={18} />
  <select
    name="customization"
    value={features.customization}
    onChange={handleFeatureChange}
  >
    <option value="yes">Meal Customization</option>
    <option value="no">Fixed Menu</option>
  </select>
</div>


        <button className="primary-btn">
          <Plus size={14} /> Create Plan
        </button>
      </form>



      {/* ========== ASSIGN PLAN ========== */}
      <h2>Assign Subscription</h2>
      <form className="plan-form" onSubmit={handleAssign}>
        <select name="targetType" value={assign.targetType} onChange={handleAssignChange}>
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
        </select>

        {assign.targetType === "user" ? (
          <select name="targetId" value={assign.targetId} onChange={handleAssignChange} required>
            <option value="">Select User</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        ) : (
          <select name="targetId" value={assign.targetId} onChange={handleAssignChange} required>
            <option value="">Select Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.shop_name}</option>
            ))}
          </select>
        )}

        <select name="planId" value={assign.planId} onChange={handleAssignChange} required>
          <option value="">Select Plan</option>
          {plans
            .filter(p => p.type === assign.targetType)
            .map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>

        <input type="date" name="start_date" value={assign.start_date} onChange={handleAssignChange} required />
        <input type="date" name="end_date" value={assign.end_date} onChange={handleAssignChange} required />

        <button className="primary-btn">
  <Plus size={14} />
 Assign
</button>

      </form>



{/* ========== PLANS LIST ========== */}
<h2>All Subscription Plans</h2>

<table className="plans-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Type</th>
      <th>Name</th>
      <th>Price</th>
      <th>Duration</th>
      <th>Features</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {plans.length === 0 ? (
      <tr>
        <td colSpan="8">No plans found</td>
      </tr>
    ) : (
      plans.map(plan => (
        <tr key={plan.id}>
          <td>{plan.id}</td>
          <td>{plan.type}</td>
          <td>{plan.name}</td>
          <td>₹{plan.price}</td>
          <td>{plan.duration_days} days</td>

          <td>
  {plan.features && Object.keys(plan.features).length > 0 ? (
    <button
      className="view-btn"
      onClick={() => {
        setSelectedFeatures(plan.features);
        setSelectedPlanType(plan.type);
        setShowFeatureModal(true);
      }}
    >
      👁 View Features
    </button>
  ) : (
    "-"
  )}
</td>

          <td>
            <span className={`status-badge ${plan.status || "active"}`}>
              {plan.status || "active"}
            </span>
          </td>

          <td className="action-cell">
            <button
              className="edit-btn"
              onClick={() => {
                setEditPlan(plan);
                setShowModal(true);
              }}
            >
              ✏️ Edit
            </button>

            <button
              className="delete-btn"
              onClick={() => handleDeletePlan(plan.id)}
            >
              🗑 Delete
            </button>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>



{showFeatureModal && selectedFeatures && (
  <div className="modal-overlay">
    <div className="modal-box feature-modal">
      <h2>Plan Features</h2>

      {/* USER PLAN FEATURES */}
      {selectedPlanType === "user" && (
        <>
          <p>🍱 <b>Meals / Day:</b> {selectedFeatures.meals_per_day}</p>
          <p>🥗 <b>Meal Type:</b> {selectedFeatures.meal_type}</p>
          <p>🕒 <b>Delivery Time:</b> {selectedFeatures.delivery_time}</p>
          <p>📆 <b>Weekend Included:</b> {selectedFeatures.includes_weekend ? "Yes" : "No"}</p>
          <p>⚙️ <b>Customization:</b> {selectedFeatures.customization ? "Yes" : "No"}</p>
          {selectedFeatures.support && (
            <p>🎧 <b>Support:</b> {selectedFeatures.support}</p>
          )}
        </>
      )}

      {/* VENDOR PLAN FEATURES */}
      {selectedPlanType === "vendor" && (
        <>
          <p>👥 <b>Max Customers:</b> {selectedFeatures.max_customers}</p>
          <p>🍽 <b>Daily Capacity:</b> {selectedFeatures.daily_capacity}</p>
          <p>📍 <b>Delivery Radius:</b> {selectedFeatures.delivery_radius_km} km</p>
          <p>📊 <b>Analytics:</b> {selectedFeatures.analytics_access}</p>
          {selectedFeatures.delivery_support !== undefined && (
            <p>🚚 <b>Delivery Support:</b> {selectedFeatures.delivery_support ? "Yes" : "No"}</p>
          )}
        </>
      )}

      <div className="modal-actions">
        <button onClick={() => setShowFeatureModal(false)}>Close</button>
      </div>
    </div>
  </div>
)}



{showModal && editPlan && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h2>Edit Subscription Plan</h2>

      <input
        value={editPlan.name}
        onChange={e =>
          setEditPlan({ ...editPlan, name: e.target.value })
        }
        placeholder="Plan Name"
      />

      <input
        type="number"
        value={editPlan.price}
        onChange={e =>
          setEditPlan({ ...editPlan, price: e.target.value })
        }
        placeholder="Price"
      />

      <input
        type="number"
        value={editPlan.duration_days}
        onChange={e =>
          setEditPlan({ ...editPlan, duration_days: e.target.value })
        }
        placeholder="Duration (days)"
      />

      <textarea
        value={JSON.stringify(editPlan.features || {}, null, 2)}
        onChange={e => {
          try {
            setEditPlan({
              ...editPlan,
              features: JSON.parse(e.target.value)
            });
          } catch {}
        }}
      />

      <select
        value={editPlan.status || "active"}
        onChange={e =>
          setEditPlan({ ...editPlan, status: e.target.value })
        }
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <div className="modal-actions">
        <button onClick={handleUpdatePlan}>Save</button>
        <button className="cancel" onClick={() => setShowModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}






      {/* ========== USER SUBSCRIPTIONS ========== */}
      <h2>User Subscriptions</h2>
      <table className="plans-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {userSubs.length === 0 ? (
            <tr><td colSpan="5">No user subscriptions</td></tr>
          ) : (
            userSubs.map(s => (
              <tr key={s.id}>
                <td>{s.user_name}</td>
                <td>{s.plan_name}</td>
                <td>{s.start_date}</td>
                <td>{s.end_date}</td>
                <td>{s.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ========== VENDOR SUBSCRIPTIONS ========== */}
      <h2>Vendor Subscriptions</h2>
      <table className="plans-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Plan</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vendorSubs.length === 0 ? (
            <tr><td colSpan="5">No vendor subscriptions</td></tr>
          ) : (
            vendorSubs.map(s => (
              <tr key={s.id}>
                <td>{s.vendor_name}</td>
                <td>{s.plan_name}</td>
                <td>{s.start_date}</td>
                <td>{s.end_date}</td>
                <td>{s.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSubscriptions;
