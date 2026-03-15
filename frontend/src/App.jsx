import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/signIn.jsx";
import SignUp from "./pages/signUp.jsx";
import Home from "./pages/home.jsx";
import ForgotPassword from "./pages/forgotPassword.jsx";
import getCurrentUser from "./hooks/getCurrentUser.jsx";
import { useSelector } from "react-redux";
import useGetCity from "./hooks/useGetCity.jsx";
import useGetShop from "./hooks/useGetShop.jsx";
import CreateEditShop from "./pages/createEditShop.jsx";
import AddItem from "./pages/add_Item.jsx";
import useGetMyShop from "./hooks/useGetmyShop.jsx";
import EditItem from "./pages/edit_item.jsx";
import DeleteItem from "./pages/delete_item.jsx";
import useGetShopByCity from "./hooks/useGetShopByCity.jsx";
import useGetItemByCity from "./hooks/useGetItemByCity.jsx";

function App() {
  const { loading } = getCurrentUser();
  useGetCity();
  useGetShop();
  useGetMyShop();
  useGetShopByCity();
  useGetItemByCity();

  const { userData } = useSelector((state) => state.user);

  // ✅ Sahi tarika — if() with parentheses, return with JSX
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#060d1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid #1e293b",
          borderTop: "3px solid #f97316",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ color: "#475569", fontSize: 13, fontFamily: "DM Sans, sans-serif" }}>
          Loading...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
      <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
      <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
      <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to="/signin" />} />
      <Route path="/add-item" element={userData ? <AddItem /> : <Navigate to="/signin" />} />
      <Route path="/edit-item/:id" element={userData ? <EditItem /> : <Navigate to="/signin" />} />
      <Route path="/delete-item/:id" element={userData ? <DeleteItem /> : <Navigate to="/signin" />} />
    </Routes>
  );
}

export default App;