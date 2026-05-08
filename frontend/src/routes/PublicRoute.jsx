import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // already logged in → redirect to their respective dashboard
  if (token) {
    if (role === "vendor") {
      return <Navigate to="/vendor-dashboard" replace />;
    }
    return <Navigate to="/user-dashboard" replace />;
  }

  // not logged in → allow page
  return children;
};

export default PublicRoute;
