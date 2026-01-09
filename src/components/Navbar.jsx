import React, { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaPlus,
} from "react-icons/fa";

/**
 * Updated theme: Komunitas / Peduli
 * Palette:
 * - primary: #0ea5a4 (teal)
 * - accent:  #10b981 (green)
 * - bg glass / surface: soft white
 *
 * Save as: src/components/Navbar.jsx
 */

export default function Navbar({ setIsLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Komunitas / Peduli theme
  const theme = {
    primary: "#0ea5a4", // main teal
    accent: "#10b981", // supportive green
    surface: "rgba(255,255,255,0.84)",
    blur: "8px",
    border: "rgba(6,95,70,0.08)",
    text: "#0b1220",
    muted: "#6b7280",
    danger: "#ef4444",
  };

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "";
  const token = localStorage.getItem("token");

  if (!token) return null;

  const initials = useMemo(() => {
    if (!name) return role ? role.charAt(0).toUpperCase() : "U";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [name, role]);

  const navItems = [
    { to: "/", label: "Data Laporan", icon: <FaClipboardList /> },
    { to: "/tambah", label: "Tambah Laporan", icon: <FaPlus /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      // ignore
    }
    localStorage.clear();
    if (typeof setIsLogin === "function") setIsLogin(false);
    navigate("/login", { replace: true });
  };

  const styles = {
    wrapper: {
      position: "sticky",
      top: 12,
      zIndex: 60,
      display: "flex",
      justifyContent: "center",
      padding: "8px 12px",
    },
    nav: {
      width: "100%",
      maxWidth: 1100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "10px 16px",
      borderRadius: 14,
      background: theme.surface,
      backdropFilter: `blur(${theme.blur})`,
      WebkitBackdropFilter: `blur(${theme.blur})`,
      border: `1px solid ${theme.border}`,
      boxShadow: "0 8px 30px rgba(2,6,23,0.06)",
    },
    brand: { display: "flex", gap: 12, alignItems: "center", textDecoration: "none", color: theme.text },
    logoBox: {
      width: 44,
      height: 44,
      borderRadius: 10,
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 800,
      fontFamily: "'Poppins', sans-serif",
      fontSize: 16,
      boxShadow: "0 8px 20px rgba(16,185,129,0.12)",
    },
    brandText: { fontSize: 16, fontWeight: 700, letterSpacing: 0.4 },
    navCenter: { display: "flex", gap: 8, alignItems: "center" },
    navLinks: { display: "flex", gap: 8, alignItems: "center" },
    link: {
      display: "inline-flex",
      gap: 8,
      alignItems: "center",
      padding: "8px 12px",
      borderRadius: 999,
      color: theme.text,
      textDecoration: "none",
      fontWeight: 600,
      fontSize: 14,
      transition: "all .18s ease",
      opacity: 0.95,
      background: "transparent",
    },
    linkActive: {
      background: `${theme.primary}10`,
      color: theme.primary,
      boxShadow: `inset 0 -4px 0 0 ${theme.primary}10`,
      transform: "translateY(-1px)",
    },
    right: { display: "flex", gap: 12, alignItems: "center" },
    pill: {
      display: "inline-flex",
      gap: 8,
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: 999,
      background: "transparent",
      color: theme.muted,
      fontSize: 13,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.text,
      fontWeight: 700,
      boxShadow: "0 6px 16px rgba(2,6,23,0.06)",
      border: `1px solid ${theme.border}`,
      fontSize: 13,
    },
    logoutBtn: {
      display: "inline-flex",
      gap: 8,
      alignItems: "center",
      padding: "8px 12px",
      borderRadius: 10,
      background: theme.danger,
      color: "white",
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 13,
    },
    burger: {
      width: 44,
      height: 44,
      borderRadius: 10,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: theme.text,
    },
    mobilePanel: {
      position: "absolute",
      top: "72px",
      left: 12,
      right: 12,
      margin: "0 auto",
      maxWidth: 1100,
      borderRadius: 12,
      padding: 12,
      background: theme.surface,
      backdropFilter: `blur(${theme.blur})`,
      border: `1px solid ${theme.border}`,
      boxShadow: "0 12px 40px rgba(2,6,23,0.12)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.nav}>
        <Link to="/" style={styles.brand} aria-label="LaporOnline - Beranda">
          <div style={styles.logoBox}>LO</div>
          <div>
            <div style={styles.brandText}>LaporOnline</div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>Komunitas peduli lingkungan</div>
          </div>
        </Link>

        <nav style={styles.navCenter} aria-label="Main navigation">
          <div style={styles.navLinks} className="nav-links-desktop">
            {navItems.map((it) => (
              <Link
                to={it.to}
                key={it.to}
                style={{
                  ...styles.link,
                  ...(isActive(it.to) ? styles.linkActive : {}),
                }}
                onClick={() => setOpen(false)}
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div style={styles.right}>
          <div style={styles.pill} title={`Role: ${role}`}>
            <FaUserCircle style={{ color: theme.primary }} />
            <span style={{ color: theme.text, fontWeight: 700 }}>{role}</span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label={name ? `Profil ${name}` : "Profil"}
            onClick={() => navigate("/profile")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/profile");
            }}
            style={styles.avatar}
          >
            {name ? initials : <FaUserCircle size={18} />}
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn} aria-label="Logout" title="Keluar">
            <FaSignOutAlt />
            <span style={{ fontSize: 13 }}>Logout</span>
          </button>

          <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Tutup menu" : "Buka menu"} style={styles.burger}>
            {open ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </header>

      {open && (
        <div style={styles.mobilePanel} role="menu" aria-label="Mobile menu">
          {navItems.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              style={{
                ...styles.link,
                justifyContent: "space-between",
                padding: "10px 12px",
                ...(isActive(it.to) ? styles.linkActive : {}),
              }}
            >
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                {it.icon} <span>{it.label}</span>
              </span>
              {isActive(it.to) && <span style={{ color: theme.primary, fontWeight: 800 }}>●</span>}
            </Link>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
              <div style={{ ...styles.avatar, width: 44, height: 44 }}>{name ? initials : <FaUserCircle />}</div>
              <div>
                <div style={{ fontWeight: 800, color: theme.text }}>{name || "Pengguna"}</div>
                <div style={{ fontSize: 12, color: theme.muted }}>{role || "role"}</div>
              </div>
            </div>

            <button onClick={handleLogout} style={{ ...styles.logoutBtn, padding: "8px 10px" }} aria-label="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}