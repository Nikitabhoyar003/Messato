import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "./VendorMenus.css";




const VendorMenus = () => {
  const { vendorId } = useParams();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);


  useEffect(() => {
  if (editingMenu) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.remove("modal-open");
  }

  return () => {
    document.body.classList.remove("modal-open");
  };
}, [editingMenu]);


  const fetchMenus = async () => {
    try {
      const res = await API.get(`/admin/vendors/${vendorId}/menus`);
      setMenus(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (editingMenu) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.remove("modal-open");
  }

  return () => {
    document.body.classList.remove("modal-open");
  };
}, [editingMenu]);




  const saveEditedMenu = async () => {
  if (!editingMenu) return;

  try {
    await API.put(
      `/admin/menus/${editingMenu.id}`,
      {
        name: editingMenu.name,
        description: editingMenu.description,
        price: Number(editingMenu.price),
        cuisine: editingMenu.cuisine,
        meal_type: editingMenu.meal_type,
        food_type: editingMenu.food_type,
        category: editingMenu.category,
        is_available: editingMenu.is_available,
      }
    );

    // ✅ UI update without refetch
    setMenus(prev =>
      prev.map(m =>
        m.id === editingMenu.id ? editingMenu : m
      )
    );

    setEditingMenu(null);
    alert("Menu updated successfully ✅");

  } catch (err) {
    console.error("Menu update failed", err);
    alert("Menu update failed ❌");
  }
};


/* =====================
   UPDATE EDITING FIELD
===================== */
const updateEdit = (field, value) => {
  setEditingMenu(prev => ({
    ...prev,
    [field]: value
  }));
};


  /* =====================
     DELETE MENU
  ===================== */
  const deleteMenu = async (id) => {
    if (!window.confirm("Delete this menu permanently?")) return;

    try {
      await API.delete(`/admin/menus/${id}`);
      setMenus(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* =====================
     SAVE MENU
  ===================== */
  const saveMenu = async () => {
    try {
      setSaving(true);
      await API.put(`/admin/menus/${editingMenu.id}`, editingMenu);
      alert("Menu updated");
      setEditingMenu(null);
      fetchMenus();
    } catch (err) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="menu-loading">Loading…</p>;

  return (
    <div className="menu-page">
      <h2>Vendor Menus</h2>

      <div className="menu-grid">
        {menus.map(menu => (
          <div className="menu-small-card" key={menu.id}>
            <img
              src={
                menu.image
                  ? menu.image.startsWith("http")
                    ? menu.image
                    : `http://localhost:5000/${menu.image}`
                  : "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt={menu.name}
            />

            <div className="menu-info">
              <h4>{menu.name}</h4>
              <p className="price">₹ {menu.price}</p>

              <span className="badge">{menu.cuisine}</span>

              <div className="actions">
                <button
                  className="edit-btn"
                  onClick={() => setEditingMenu({ ...menu })}
                >
                  ✏️ Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteMenu(menu.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {/* ================= EDIT MODAL ================= */}
{/* ===== EDIT MENU MODAL ===== */}
{editingMenu && (
  <div className="edit-overlay">
    <div className="edit-modal">

      {/* IMAGE */}
      <div className="edit-image">
        <img
          src={
            editingMenu.image
              ? editingMenu.image.startsWith("http")
                ? editingMenu.image
                : `http://localhost:5000/${editingMenu.image}`
              : "https://via.placeholder.com/600x300?text=No+Image"
          }
          alt={editingMenu.name}
        />
      </div>

      {/* FORM */}
      <div className="edit-body">
        <h3>Edit Menu</h3>

        <div className="form-group">
          <label>Menu Name</label>
          <input
            value={editingMenu.name}
            onChange={(e) => updateEdit("name", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="3"
            value={editingMenu.description}
            onChange={(e) =>
              updateEdit("description", e.target.value)
            }
          />
        </div>

        <div className="form-row">
          <div>
            <label>Price (₹)</label>
            <input
              type="number"
              value={editingMenu.price}
              onChange={(e) =>
                updateEdit("price", e.target.value)
              }
            />
          </div>

          <div>
            <label>Food Type</label>
            <select
              value={editingMenu.food_type}
              onChange={(e) =>
                updateEdit("food_type", e.target.value)
              }
            >
              <option>Veg</option>
              <option>Non-Veg</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Meal Type</label>
            <select
              value={editingMenu.meal_type}
              onChange={(e) =>
                updateEdit("meal_type", e.target.value)
              }
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
            </select>
          </div>

          <div>
            <label>Cuisine</label>
            <select
              value={editingMenu.cuisine}
              onChange={(e) =>
                updateEdit("cuisine", e.target.value)
              }
            >
              <option>Indian</option>
              <option>South Indian</option>
              <option>Punjabi</option>
              <option>Maharashtrian</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            value={editingMenu.category}
            onChange={(e) =>
              updateEdit("category", e.target.value)
            }
          />
        </div>

        <label className="available-check">
          <input
            type="checkbox"
            checked={editingMenu.is_available === 1}
            onChange={(e) =>
              updateEdit(
                "is_available",
                e.target.checked ? 1 : 0
              )
            }
          />
          Available
        </label>

        <div className="edit-actions">
          <button
            className="btn-cancel"
            onClick={() => setEditingMenu(null)}
          >
            Cancel
          </button>

          <button
            className="btn-save"
            onClick={saveEditedMenu}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default VendorMenus;
