import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLaporanById, updateLaporan } from "../api/api";

export default function LaporanEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    tanggal: "",
    status: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getLaporanById(id);
    if (res && res.data) {
      setForm({
        nama: res.data.nama || "",
        alamat: res.data.alamat || "",
        tanggal: res.data.tanggal || "",
        status: res.data.status || "",
      });
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 WAJIB: pakai FormData
    const formData = new FormData();
    formData.append("_method", "PUT"); // untuk Laravel
    formData.append("nama", form.nama);
    formData.append("alamat", form.alamat);
    formData.append("tanggal", form.tanggal);
    formData.append("status", form.status);

    const res = await updateLaporan(id, formData);

    if (res && res.status) {
      alert("✅ Laporan berhasil diperbarui");
      navigate("/"); // ⬅️ balik ke list (route yang benar)
    } else {
      alert("❌ Gagal memperbarui laporan");
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
          maxWidth: 700,
          margin: "0 auto",
          background: "white",
          padding: 28,
          borderRadius: 16,
          boxShadow: "0 12px 30px rgba(0, 0, 0, .15)",
        }}
      >
        <h2
          style={{
            marginBottom: 24,
            color: "#050505ff",
            textAlign: "center",
          }}
        >
          Edit Laporan
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Nama */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Nama</label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Alamat */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Alamat</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              style={{ ...inputStyle, height: 90 }}
              required
            />
          </div>

          {/* Tanggal */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Status */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 500 }}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Pilih Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              style={buttonSecondary}
            >
              Batal
            </button>

            <button type="submit" style={buttonPrimary}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ====== STYLE ====== */

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginTop: 6,
  borderRadius: 10,
  border: "1px solid #dbe0ff",
  outline: "none",
  fontSize: 14,
};

const buttonPrimary = {
  background: "#2e5bff",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 500,
};

const buttonSecondary = {
  background: "#f1f3ff",
  color: "#2e5bff",
  border: "1px solid #dbe0ff",
  padding: "10px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 500,
};
