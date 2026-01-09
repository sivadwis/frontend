import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const token = localStorage.getItem("token");

  // ❌ SUDAH LOGIN → JANGAN BOLEH KE LOGIN / REGISTER
  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
