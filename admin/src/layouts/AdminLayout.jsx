import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./adminLayout.css";

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="admin-main">
        <Navbar setOpen={setOpen} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;