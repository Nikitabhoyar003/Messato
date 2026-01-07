import React from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Register from "./components/Register";
import Navbar from "./components/navbar";
// import Login from "./components/Login";
import Landing from "./pages/landing";
import UserAuth from "./pages/useAuth";
import VendorAuth from "./pages/vendorAuth";
import UserDashboard from "./pages/userDashboard";

function App(){
  // useEffect(()=>{
  //   fetch("http://localhost:5000/user")
  //   .then(res=>res.json())
  //   .then(data=>console.log(data))
  //   .catch(err=>console.log(err))
  // })
  return(
    <BrowserRouter>
       <Navbar />

     <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/user-auth" element={<UserAuth />} />
        <Route path="/vendor-auth" element={<VendorAuth />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;