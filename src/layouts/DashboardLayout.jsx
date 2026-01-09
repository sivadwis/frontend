import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div style={container}>
      {/* Sidebar kiri */}
      <div style={sidebar}>
        <h2 style={logo}>MyApp</h2>
        <nav style={navMenu}>
          <button style={menuBtn} onClick={() => navigate("/")}>
            Dashboard
          </button>
          <button style={menuBtn} onClick={() => navigate("/laporan")}>
            Laporan
          </button>
          <button style={menuBtn} onClick={() => navigate("/tambah")}>
            Tambah Laporan
          </button>
          <button style={menuBtn} onClick={() => navigate("/profile")}>
            Profil
          </button>
          <button style={{ ...menuBtn, marginTop: "auto", background: "#ef4444", color: "#fff" }}
                  onClick={() => navigate("/logout")}>
            Logout
          </button>
        </nav>
      </div>

      {/* Konten utama */}
      <div style={mainContent}>{children}</div>
    </div>
  );
}

// ===== Styles =====
const container = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "'Poppins', sans-serif",
};

const sidebar = {
  width: 220,
  background: "#2e5bff",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  padding: 20,
};

const logo = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 40,
  textAlign: "center",
};

const navMenu = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: 1,
};

const menuBtn = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 16,
  padding: "10px 15px",
  borderRadius: 8,
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.2s",
};

menuBtn["hover"] = {
  background: "#1e40af",
};

const mainContent = {
  flex: 1,
  background: "#f8f9ff",
  padding: 24,
};
