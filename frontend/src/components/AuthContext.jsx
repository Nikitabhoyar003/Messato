import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [loading, setLoading] = useState(true);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    setToken(data.token);
    setRole(data.role);

    if (data.role === "vendor") {
      localStorage.setItem("vendor", JSON.stringify(data.vendor));
      setVendor(data.vendor);
      setUser(null);
    } else {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setVendor(null);
    }
    
    // axios default header
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    window.dispatchEvent(new Event("auth-changed"));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("vendor");
    localStorage.removeItem("isLoggedIn");
    
    setToken(null);
    setRole(null);
    setUser(null);
    setVendor(null);
    
    delete axios.defaults.headers.common["Authorization"];
    window.dispatchEvent(new Event("auth-changed"));
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        const res = await axios.get("/api/auth/check");
        
        if (res.data.authenticated) {
          const storedRole = localStorage.getItem("role");
          setRole(storedRole);
          
          if (storedRole === "vendor") {
            const v = JSON.parse(localStorage.getItem("vendor"));
            setVendor(v);
          } else {
            const u = JSON.parse(localStorage.getItem("user"));
            setUser(u);
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        // logout(); // Only logout if it's a 401
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        token,
        role,
        loading,
        login,
        logout,
        isLoggedIn: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
