import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// 🔐 Attach token automatically
API.interceptors.request.use(
  (config) => {
    const adminToken = sessionStorage.getItem("adminToken"); // ✅ FIXED
    const userToken = localStorage.getItem("token");

    config.headers = config.headers || {};

    // Priority: Admin → User/Vendor
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;