import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import POS from "./pages/POS.jsx";
import Inventory from "./pages/Inventory.jsx";
import SalesPage from "./pages/SalesPage.jsx";
import Analytics from "./pages/Analytics.jsx";
import AppLayout from "./components/AppLayout.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="sales" element={<SalesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
