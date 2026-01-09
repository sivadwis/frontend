import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // ❌ BELUM LOGIN → TENDANG KE LOGIN
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ SUDAH LOGIN
  return children;
}
