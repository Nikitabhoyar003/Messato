import { jwtDecode } from "jwt-decode";

export const getValidToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      return null;
    }

    return token;
  } catch  {
    localStorage.clear();
    return null;
  }
};
