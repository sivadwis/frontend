import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaClipboardList, FaRegHandshake, FaShieldAlt } from "react-icons/fa";
import { getLaporan } from "../api/api";

/**
 * Home page — updated so "Lihat Daftar Laporan" always navigates reliably.
 * Fixes:
 * - Use <Link> for navigation so React Router handles the navigation reliably.
 * - Ensure CTA elements are not accidentally covered by SVG/overlays (zIndex / pointerEvents).
 * - FeatureCard supports either cta.to (Link) or cta.onClick (button).
 *
 * Save to: src/pages/Home.jsx
 */

const THEME = {
  primary: "#0ea5a4",
  secondary: "#10b981",
  accent: "#f59e0b",
  muted: "#64748b",
  surface: "#ffffff",
  bg: "#f6f9fb",
  heroGradient: "linear-gradient(135deg, #0ea5a4 0%, #06b6d4 100%)",
  cardShadow: "0 12px 30px rgba(2,6,23,0.06)",
};

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, baru: 0, diproses: 0, selesai: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getLaporan();
        let items = [];
        if (!res) items = [];
        else if (Array.isArray(res)) items = res;
        else if (Array.isArray(res.data)) items = res.data;
        else items = [];

        if (!mounted) return;
        const totals = items.reduce(
          (acc, cur) => {
            acc.total += 1;
            const s = (cur.status || "baru").toLowerCase();
            if (s === "diproses") acc.diproses += 1;
            else if (s === "selesai") acc.selesai += 1;
            else acc.baru += 1;
            return acc;
          },
          { total: 0, baru: 0, diproses: 0, selesai: 0 }
        );
        setStats(totals);
      } catch (err) {
        console.error("load home stats", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", background: THEME.bg, color: "#0f172a" }}>
      {/* HERO */}
      <header style={{ background: THEME.heroGradient, color: "#ffffff", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px", display: "flex", gap: 24, alignItems: "center", position: "relative" }}>
          {/* left: text */}
          <div style={{ flex: 1, zIndex: 3 /* put text above illustration */ }}>
            <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.05, fontWeight: 800, color: "#ffffff" }}>
              Kami peduli kepada komunitas yang melapor
            </h1>

            <p style={{ marginTop: 14, color: "rgba(255,255,255,0.92)", maxWidth: 640, fontSize: 16 }}>
              Laporkan kejadian di lingkungan Anda dengan cepat dan aman. Kami membantu menyalurkan laporan ke pihak yang berwenang
              serta memantau progres penanganannya.
            </p>

            <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate("/tambah")}
                style={{
                  background: "#ffffff",
                  color: THEME.primary,
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(3,105,101,0.08)",
                  display: "inline-flex",
                  gap: 8,
                  alignItems: "center",
                  zIndex: 3,
                }}
              >
                <FaPlus /> Laporkan Sekarang
              </button>

              {/* Use Link instead of onClick so React Router handles navigation properly */}
              <Link
                to="/laporan"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.22)",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 700,
                  textDecoration: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.95)",
                  zIndex: 3,
                }}
              >
                Lihat Daftar Laporan
              </Link>
            </div>

            {/* small stats row with stronger, distinct backgrounds */}
            <div style={{ marginTop: 28, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", zIndex: 3 }}>
              <StatBadge variant="total" label="Total laporan" value={loading ? "…" : stats.total} />
              <StatBadge variant="baru" label="Menunggu" value={loading ? "…" : stats.baru} />
              <StatBadge variant="diproses" label="Diproses" value={loading ? "…" : stats.diproses} />
              <StatBadge variant="selesai" label="Selesai" value={loading ? "…" : stats.selesai} />
            </div>
          </div>

          {/* right: improved decorative illustration (SVG) */}
          <div style={{ width: 420, flex: "0 0 420px", zIndex: 2, pointerEvents: "none" /* avoid covering CTAs */ }}>
            <IllustrationModern />
          </div>

          {/* angled white separator bottom */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -1,
              height: 80,
              transform: "translateY(50%)",
              background: "transparent",
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              <path d="M0,40 C300,120 900,0 1200,40 L1200,80 L0,80 Z" fill={THEME.surface} />
            </svg>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        <section style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: 28, color: "#0f172a" }}>Untuk komunitas, oleh komunitas</h2>
          <div style={{ height: 8 }} />
          <div style={{ width: 80, height: 6, background: THEME.accent, margin: "12px auto", borderRadius: 4 }} />
          <p style={{ color: THEME.muted, maxWidth: 760, margin: "12px auto 0", fontSize: 15 }}>
            Kami menerima laporan dari masyarakat dan membantu memprosesnya. Lihat fitur utama yang memudahkan pelaporan dan penanganan.
          </p>
        </section>

        {/* cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          <FeatureCard
            title="Pelaporan Publik"
            description="Laporkan masalah yang bisa dilihat publik — membantu transparansi dan kolaborasi warga."
            icon={<FaClipboardList size={22} />}
            cta={{ label: "Lihat Laporan", to: "/laporan" }}
          />

          <FeatureCard
            title="Pelaporan Terverifikasi"
            description="Ajukan bukti (foto) agar laporan dapat diverifikasi dan ditindaklanjuti lebih cepat."
            icon={<FaShieldAlt size={22} />}
            cta={{ label: "Pelajari Lebih", to: "/tambah" }}
          />

          <FeatureCard
            title="Koordinasi Komunitas"
            description="Bergabung bersama warga lain untuk mendorong penyelesaian masalah lingkungan di sekitar Anda."
            icon={<FaRegHandshake size={22} />}
            cta={{ label: "Gabung Komunitas", onClick: () => alert("Fitur komunitas belum tersedia") }}
          />
        </section>
      </main>
    </div>
  );
}

/* ===== components ===== */

function StatBadge({ variant = "total", label, value }) {
  const styles = {
    total: { bg: "#ffffff", color: "#0f172a", border: "1px solid rgba(2,6,23,0.06)", boxShadow: "0 8px 18px rgba(2,6,23,0.06)" },
    baru: { bg: "#dffaf6", color: "#0b7b6f", border: "1px solid rgba(6,95,70,0.08)" },
    diproses: { bg: "#fff4e6", color: "#b45309", border: "1px solid rgba(185,97,0,0.06)" },
    selesai: { bg: "#ecfbef", color: "#065f46", border: "1px solid rgba(6,95,70,0.06)" },
  };

  const s = styles[variant] || styles.total;

  return (
    <div
      role="status"
      aria-label={`${label}: ${value}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        border: s.border,
        boxShadow: s.boxShadow || "none",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 16 }}>{value}</div>
      <div style={{ fontSize: 13, color: s.color, opacity: 0.95 }}>{label}</div>
    </div>
  );
}

function FeatureCard({ title, description, icon, cta = {} }) {
  // if cta.to provided -> Link, otherwise button that calls onClick
  return (
    <div style={{ background: THEME.surface, borderRadius: 12, padding: 20, boxShadow: THEME.cardShadow, minHeight: 160, display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid rgba(2,6,23,0.04)" }}>
      <div>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: "linear-gradient(180deg, rgba(14,165,148,0.06), rgba(6,182,212,0.02))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ color: THEME.primary }}>{icon}</div>
        </div>
        <h4 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>{title}</h4>
        <p style={{ margin: 0, color: THEME.muted }}>{description}</p>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-start" }}>
        {cta.to ? (
          <Link
            to={cta.to}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "transparent",
              border: `1px solid rgba(15,23,42,0.06)`,
              cursor: "pointer",
              fontWeight: 700,
              color: "#0f172a",
              textDecoration: "none",
            }}
          >
            {cta.label}
          </Link>
        ) : (
          <button
            onClick={cta.onClick}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "transparent",
              border: `1px solid rgba(15,23,42,0.06)`,
              cursor: "pointer",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {cta.label}
          </button>
        )}
      </div>
    </div>
  );
}

/* Improved SVG illustration for the hero */
function IllustrationModern() {
  return (
    <svg viewBox="0 0 420 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="gradA" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.06" />
        </linearGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#0b1220" floodOpacity="0.08" />
        </filter>
      </defs>

      <rect x="8" y="12" rx="16" width="404" height="276" fill="rgba(255,255,255,0.02)" />
      <line x1="16" y1="210" x2="404" y2="210" stroke="rgba(255, 255, 255, 0.64)" strokeWidth="1" />

      <g transform="translate(32,54)">
        <rect x="0" y="80" width="30" height="56" rx="6" fill="rgba(255, 255, 255, 0.32)" stroke="rgba(255,255,255,0.08)" />
        <rect x="46" y="48" width="30" height="88" rx="6" fill="rgba(255, 255, 255, 0.48)" stroke="rgba(255,255,255,0.08)" />
        <rect x="92" y="28" width="30" height="108" rx="6" fill="rgba(255, 255, 255, 0.5)" stroke="rgba(255,255,255,0.08)" />
        <rect x="138" y="64" width="30" height="72" rx="6" fill="rgba(255, 255, 255, 0.56)" stroke="rgba(255,255,255,0.08)" />
        <rect x="184" y="8" width="30" height="128" rx="6" fill="rgba(255, 255, 255, 0.59)" stroke="rgba(255,255,255,0.08)" />
      </g>

      <circle cx="340" cy="48" r="28" fill="rgba(255, 255, 255, 0.48)" stroke="rgba(255, 255, 255, 0.49)" />
      <path d="M22 34 C92 6 182 66 270 36" fill="none" stroke="rgba(255, 255, 255, 0.66)" strokeDasharray="6 6" strokeLinecap="round" strokeWidth="1.5" />
      <rect x="298" y="188" rx="10" width="72" height="48" fill="rgba(255, 255, 255, 0.32)" stroke="rgba(255, 255, 255, 0.38)" />
      <ellipse cx="320" cy="24" rx="44" ry="10" fill="url(#gradA)" opacity="0.6" />
      <g transform="translate(290,36)">
        <circle cx="0" cy="0" r="10" fill="#ffffff" opacity="0.14" />
        <circle cx="0" cy="0" r="4" fill="#ffffffe8" opacity="0.9" />
      </g>
      <g filter="url(#softShadow)"><rect x="24" y="162" rx="6" width="120" height="22" fill="rgba(255, 255, 255, 0)" /></g>
    </svg>
  );
}