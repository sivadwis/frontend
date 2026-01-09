import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ setIsLogin }) {
  const location = useLocation();
  const navigate = useNavigate();

  // ambil role & token
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // kalau TIDAK ADA TOKEN → JANGAN RENDER NAVBAR
  if (!token) return null;

  const isActive = (path) =>
    location.pathname === path
      ? {
          background: "rgba(255,255,255,0.25)",
          fontWeight: 700,
          boxShadow: "0 4px 10px rgba(0,0,0,.15)",
        }
      : {};

  // LOGOUT
  const handleLogout = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.log("Logout error (diabaikan)", error);
    }

    // bersihkan auth
    localStorage.clear();
    setIsLogin(false);

    // redirect
    navigate("/login", { replace: true });
  };

  return (
    <nav
      style={{
        width: "100%",
        background: "linear-gradient(135deg, #4e73df, #2e93ff)",
        boxShadow: "0 12px 30px rgba(0,0,0,.15)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* BRAND */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "white",
            letterSpacing: "1px",
          }}
        >
          LaporOnline
        </div>

        {/* MENU */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            to="/"
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              textDecoration: "none",
              color: "white",
              fontSize: 15,
              transition: ".25s",
              ...isActive("/"),
            }}
          >
            Data Laporan
          </Link>

          <Link
            to="/tambah"
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              textDecoration: "none",
              color: "white",
              fontSize: 15,
              transition: ".25s",
              ...isActive("/tambah"),
            }}
          >
            Tambah Laporan
          </Link>

          {/* ROLE */}
          <span
            style={{
              color: "white",
              fontSize: 13,
              opacity: 0.85,
              marginLeft: 10,
            }}
          >
            Role: <b>{role}</b>
          </span>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              marginLeft: 12,
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "#ff4d4f",
              color: "white",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
