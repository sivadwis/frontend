import { useEffect, useState } from "react";
import { getLaporan, hapusLaporan } from "../api/api";
import { useNavigate } from "react-router-dom";

const IMAGE_BASE_URL = "http://127.0.0.1:8000/storage/foto";

export default function LaporanList() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const role = localStorage.getItem("role"); // 🔐 ambil role

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getLaporan();
    if (res && res.data) {
      setData(res.data);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus laporan ini?"
    );
    if (!confirmDelete) return;

    const res = await hapusLaporan(id);
    if (res.status) {
      alert("✅ Laporan berhasil dihapus");
      load();
    } else {
      alert("❌ Gagal menghapus laporan");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        background: "linear-gradient(135deg, #0030c1, #3f5f8f)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "white",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 12px 30px rgba(0, 0, 0, .15)",
        }}
      >
        <h2 style={{ marginBottom: 18, textAlign: "center" }}>
          Daftar Laporan
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "#2e5bff", color: "white" }}>
              <th style={{ padding: 12 }}>Nama</th>
              <th style={{ padding: 12 }}>Alamat</th>
              <th style={{ padding: 12 }}>Tanggal</th>
              <th style={{ padding: 12 }}>Foto</th>
              <th style={{ padding: 12 }}>Status</th>
              <th style={{ padding: 12 }}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((l) => (
              <tr
                key={l.id}
                style={{
                  background: "#f8f9ff",
                  borderBottom: "1px solid #e3e6ff",
                }}
              >
                <td style={{ padding: 10 }}>{l.nama}</td>
                <td style={{ padding: 10 }}>{l.alamat}</td>
                <td style={{ padding: 10 }}>{l.tanggal}</td>

                {/* FOTO */}
                <td style={{ padding: 10, textAlign: "center" }}>
                  {l.foto ? (
                    <img
                      src={`${IMAGE_BASE_URL}/${l.foto}`}
                      alt="Foto laporan"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 12, color: "#999" }}>
                      Tidak ada foto
                    </span>
                  )}
                </td>

                {/* STATUS */}
                <td style={{ padding: 10 }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 13,
                      background:
                        l.status === "baru"
                          ? "#dbeafe"
                          : l.status === "diproses"
                          ? "#fef3c7"
                          : "#dcfce7",
                      color:
                        l.status === "baru"
                          ? "#1e40af"
                          : l.status === "diproses"
                          ? "#92400e"
                          : "#166534",
                    }}
                  >
                    {l.status}
                  </span>
                </td>

                {/* AKSI (ADMIN ONLY) */}
                <td style={{ padding: 10, textAlign: "center" }}>
                  {role === "admin" ? (
                    <>
                      <button
                        onClick={() => navigate(`/edit/${l.id}`)}
                        style={{
                          marginRight: 8,
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: "#facc15",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(l.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: "#ef4444",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Hapus
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#999", fontSize: 13 }}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
