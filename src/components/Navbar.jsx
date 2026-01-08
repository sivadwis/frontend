import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? {
          background: "rgba(255,255,255,0.25)",
          fontWeight: 700,
          boxShadow: "0 4px 10px rgba(0,0,0,.15)",
        }
      : {};

  // khusus edit (route dinamis /edit/:id)
  const isEditActive = location.pathname.startsWith("/edit")
    ? {
        background: "rgba(255,255,255,0.25)",
        fontWeight: 700,
        boxShadow: "0 4px 10px rgba(0,0,0,.15)",
      }
    : {};

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
        <div style={{ display: "flex", gap: 10 }}>
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


        </div>
      </div>
    </nav>
  );
}
