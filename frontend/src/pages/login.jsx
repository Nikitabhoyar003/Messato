const handleLogin = async () => {
  try {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);
    setMessage("Login successful");

    console.log("JWT:", res.data.token);
  } catch (err) {
    setMessage("Login failed");
  }
};
