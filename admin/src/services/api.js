

import axios from "axios";

/* =========================
   AXIOS INSTANCE
========================= */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   CREDENTIALS
   (JWT based → false)
========================= */
API.defaults.withCredentials = false;


/* =========================
   🔐 TOKEN AUTO ATTACH (ADMIN + USER)
========================= */
API.interceptors.request.use(
  (config) => {
    // ✅ SAFE TOKEN RESOLUTION (ADMIN FIRST)
    // const adminToken =
    //   localStorage.getItem("adminToken") ||
    //   localStorage.getItem("admin_token");
    const adminToken = sessionStorage.getItem("adminToken");

    const userToken =
      localStorage.getItem("token") ||
      localStorage.getItem("userToken");

    // ✅ ATTACH CORRECT TOKEN
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/* =========================
   🔁 RESPONSE INTERCEPTOR
   (AUTO LOGOUT ON 401)
========================= */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Unauthorized – clearing tokens");

      // ❗ admin + user safe cleanup
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("token");
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    }

    return Promise.reject(error);
  }
);


/* =========================
   ADMIN AUTH
========================= */
export const adminLogin = async (email, password) => {
  const res = await API.post("/admin/auth/login", {
    email,
    password,
  });

  if (res.data?.token) {
    // ✅ SINGLE SOURCE OF TRUTH
    // localStorage.setItem("adminToken", res.data.token);
    sessionStorage.setItem("adminToken", res.data.token);
  }

  return res.data;
};


/* =========================
   USER AUTH
========================= */
export const userLogin = async (email, password) => {
  const res = await API.post("/auth/login", {
    email,
    password,
  });

  if (res.data?.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("isLoggedIn", "true");
  }

  return res.data;
};


/* =========================
   LOGOUT HELPERS
========================= */
export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("admin_token");
};

export const userLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userToken");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
};


export default API;
