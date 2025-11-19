// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// LAYOUT
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import PageContainer from "./components/layout/PageContainer.jsx";

// USER PAGES
import Home from "./pages/Home.jsx";
import ActivityList from "./pages/ActivityList.jsx";
import ActivityDetail from "./pages/ActivityDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Transactions from "./pages/Transactions.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

// ADMIN PAGES
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminTransactions from "./pages/admin/AdminTransactions.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminActivities from "./pages/admin/AdminActivities.jsx"; // 🔹 baru
import AdminPromos from "./pages/admin/AdminPromos.jsx"; // 🔹 baru

// Proteksi route yang butuh login
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Proteksi route admin (butuh login + role = admin)
function RequireAdmin({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let role = "";
  try {
    const raw = localStorage.getItem("userProfile");
    if (raw) {
      const user = JSON.parse(raw);
      role = user.role || "";
    }
  } catch (e) {
    role = "";
  }

  if (role !== "admin") {
    // kalau bukan admin, lempar balik ke home
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />

        <PageContainer>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/activity" element={<ActivityList />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* USER PROTECTED */}
            <Route
              path="/cart"
              element={
                <RequireAuth>
                  <Cart />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/transactions"
              element={
                <RequireAuth>
                  <Transactions />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <RequireAdmin>
                  <AdminTransactions />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireAdmin>
                  <AdminUsers />
                </RequireAdmin>
              }
            />
            <Route // 🔹 baru
              path="/admin/activities"
              element={
                <RequireAdmin>
                  <AdminActivities />
                </RequireAdmin>
              }
            />
            <Route // 🔹 baru
              path="/admin/promos"
              element={
                <RequireAdmin>
                  <AdminPromos />
                </RequireAdmin>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageContainer>

        <Footer />
      </div>
    </>
  );
}
