// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";

// /* ===== Layout ===== */
// import AdminLayout from "./layouts/AdminLayout";
// <Route path="/admin-login" element={<AdminLogin />} />

// /* ===== Pages ===== */
// import AdminDashboard from "./pages/AdminDashboard";
// import Users from "./pages/Users";
// import Vendors from "./pages/Vendors";
// import Orders from "./pages/Orders";
// import AdminSubscriptions from "./pages/AdminSubscriptions";
// import AdminAuditLogs from "./pages/AdminAuditLogs";
// import AdminBills from "./pages/AdminBills"; // 🧾 ADD



// /* ===== Auth Pages ===== */
// import AdminLogin from "./pages/AdminLogin";
// import AdminRegister from "./pages/AdminRegister";
// import AdminForgotPassword from "./pages/AdminForgotPassword";
// import AdminResetPassword from "./pages/AdminResetPassword";
// import VendorMenus from "./pages/VendorMenus";
// import VendorProfile from "./pages/VendorProfile";



// /* ===== Route Guards ===== */
// import AdminProtectedRoute from "./routes/AdminProtectedRoute";

// /* 🔐 Block auth pages if already logged in */
// const AuthRedirect = ({ children }) => {
//   const token = localStorage.getItem("adminToken");
//   return token ? <Navigate to="/admin" replace /> : children;
// };

// function App() {
//   return (
//     <BrowserRouter>
//       <Toaster position="top-right" />

//       <Routes>
//         {/* =====================
//             🔓 PUBLIC AUTH ROUTES
//         ====================== */}
//         <Route
//           path="/admin-login"
//           element={
//             <AuthRedirect>
//               <AdminLogin />
//             </AuthRedirect>
//           }
//         />

//         <Route
//           path="/admin-register"
//           element={
//             <AuthRedirect>
//               <AdminRegister />
//             </AuthRedirect>
//           }
//         />

//         <Route
//           path="/admin-forgot-password"
//           element={
//             <AuthRedirect>
//               <AdminForgotPassword />
//             </AuthRedirect>
//           }
//         />

//         <Route
//           path="/admin-reset-password/:token"
//           element={
//             <AuthRedirect>
//               <AdminResetPassword />
//             </AuthRedirect>
//           }
//         />

//         {/* =====================
//             🔒 PROTECTED ADMIN AREA
//         ====================== */}
//         <Route
//   path="/admin"
//   element={
//     <AdminProtectedRoute>
//       <AdminDashboard />
//     </AdminProtectedRoute>
//   }
// />
//           <Route index element={<AdminDashboard />} />
//           <Route path="users" element={<Users />} />
//           <Route path="vendors" element={<Vendors />} />
//           <Route path="orders" element={<Orders />} />
//           <Route path="subscriptions" element={<AdminSubscriptions />} />
//           <Route path="audit-logs" element={<AdminAuditLogs />} />
//           <Route path="audit" element={<AdminAuditLogs />} />
//           <Route path="vendors/:vendorId/menus" element={<VendorMenus />} />
//           <Route path="bills" element={<AdminBills />} />
//           <Route path="vendors/:id" element={<VendorProfile />} />





//         </Route>

//         {/* =====================
//             🚨 FALLBACK
//         ====================== */}
//         <Route path="*" element={<Navigate to="/admin-login" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ===== Layout ===== */
import AdminLayout from "./layouts/AdminLayout";

/* ===== Pages ===== */
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import Vendors from "./pages/Vendors";
import Orders from "./pages/Orders";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminBills from "./pages/AdminBills";
import VendorMenus from "./pages/VendorMenus";
import VendorProfile from "./pages/VendorProfile";

/* ===== Auth Pages ===== */
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminEarnings from "./pages/AdminEarnings";
import AdminVendorOrders from "./pages/AdminVendorOrders";

/* ===== Route Guards ===== */
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

/* 🔐 Block auth pages if already logged in */
const AuthRedirect = ({ children }) => {
  const token = sessionStorage.getItem("adminToken");
  return token ? <Navigate to="/admin" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>

        {/* 🔓 PUBLIC AUTH ROUTES */}
        <Route
          path="/admin-login"
          element={
            <AuthRedirect>
              <AdminLogin />
            </AuthRedirect>
          }
        />

        <Route
          path="/admin-register"
          element={
            <AuthRedirect>
              <AdminRegister />
            </AuthRedirect>
          }
        />

        <Route
          path="/admin-forgot-password"
          element={
            <AuthRedirect>
              <AdminForgotPassword />
            </AuthRedirect>
          }
        />

        <Route
          path="/admin-reset-password/:token"
          element={
            <AuthRedirect>
              <AdminResetPassword />
            </AuthRedirect>
          }
        />

        {/* 🔒 PROTECTED ADMIN AREA */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="orders" element={<Orders />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="audit" element={<AdminAuditLogs />} />
          <Route path="vendors/:vendorId/menus" element={<VendorMenus />} />
          <Route path="vendors/:id" element={<VendorProfile />} />
          <Route path="bills" element={<AdminBills />} />
          <Route path="/admin/earnings" element={<AdminEarnings />} />
          <Route
path="/admin/vendor/:vendorId/orders"
element={<AdminVendorOrders/>}
/>
        </Route>

        {/* 🚨 FALLBACK */}
        <Route path="*" element={<Navigate to="/admin-login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;