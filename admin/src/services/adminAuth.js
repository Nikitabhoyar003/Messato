const API = "http://localhost:5000";

export const adminLogin = async (email, password) => {
  const res = await fetch(`${API}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return res.json();
};

export const getAdminToken = () => {
  return sessionStorage.getItem("adminToken");
};

export const adminLogout = () => {
  sessionStorage.removeItem("adminToken");
};