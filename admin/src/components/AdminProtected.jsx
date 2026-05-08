import { Navigate } from "react-router-dom";

const AdminProtected = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminProtected;
