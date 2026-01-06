import { useState } from "react";
import API from "/servies/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const submit = async () => {
    const res = await API.post("/auth/register", form);
    alert(res.data.message);
  };

  return (
    <>
      <input placeholder="Name" onChange={e => setForm({...form, name:e.target.value})}/>
      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password:e.target.value})}/>
      <button onClick={submit}>Register</button>
    </>
  );
}
