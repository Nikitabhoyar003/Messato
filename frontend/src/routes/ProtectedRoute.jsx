import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, vendor, token, role: roleInStorage, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  if ((!user && !vendor) || !token) {
    return <Navigate to="/" replace />;
  }

  // Optional role check
  if (role && roleInStorage !== role) {
    return <Navigate to="/user-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
