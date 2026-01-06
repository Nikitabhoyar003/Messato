import React from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Navbar from "./components/navbar";
import Login from "./components/Login";
function App(){
  // useEffect(()=>{
  //   fetch("http://localhost:5000/user")
  //   .then(res=>res.json())
  //   .then(data=>console.log(data))
  //   .catch(err=>console.log(err))
  // })
  return(
    <BrowserRouter>
      {/* Navbar MUST be inside Router */}
      <Navbar />

      <Routes>
        <Route path="/" element={<h1 style={{ padding: 40 }}>Welcome to Messato 🍱</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;