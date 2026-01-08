import { useState } from "react";
import { tambahLaporan } from "../api/api";

export default function LaporanTambah() {
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    deskripsi: "",
    tanggal: "",
    foto: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) data.append(key, form[key]);
      });

      const res = await tambahLaporan(data);
      if (res.status) {
        alert("✅ Laporan berhasil disimpan");
      } else {
        alert("❌ Gagal menyimpan laporan");
      }
    } catch {
      alert("❌ ERROR, cek console");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0030c1, #3f5f8f)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          width: "95%",
          maxWidth: 550,
          background: "white",
          padding: 28,
          borderRadius: 5,
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Tambah Laporan Baru
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: 20,
            fontSize: 13.5,
          }}
        >
          Mohon isi data laporan secara lengkap dan benar
        </p>

        <form onSubmit={handleSubmit}>
          {/* GROUP 1 */}
          <div style={groupCard}>
            <label style={labelStyle}>Nama Pelapor</label>
            <input
              type="text"
              name="nama"
              placeholder="Masukkan nama lengkap"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* GROUP 2 */}
          <div style={groupCard}>
            <label style={labelStyle}>Alamat</label>
            <input
              type="text"
              name="alamat"
              placeholder="Masukkan alamat lengkap"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* GROUP 3 */}
          <div style={groupCard}>
            <label style={labelStyle}>Tanggal Kejadian</label>
            <input
              type="date"
              name="tanggal"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* GROUP 4 */}
          <div style={groupCard}>
            <label style={labelStyle}>Deskripsi Laporan</label>
            <textarea
              name="deskripsi"
              placeholder="Tuliskan deskripsi kronologi kejadian"
              onChange={handleChange}
              required
              rows={4}
              style={{ ...inputStyle, resize: "none" }}
            ></textarea>
          </div>

          {/* GROUP 5 */}
          <div style={groupCard}>
            <label style={labelStyle}>Upload Foto Bukti</label>
            <input
              type="file"
              name="foto"
              onChange={handleChange}
              style={inputStyle}
            />
            <span style={{ fontSize: 12, color: "#777" }}>
              *opsional — format JPG/PNG
            </span>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              background: "#0a5ad2ff",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: .3,
              transition: ".25s",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Simpan Laporan
          </button>
        </form>
      </div>
    </div>
  );
}

const groupCard = {
  background: "#f7f9fc",
  padding: 12,
  borderRadius: 12,
  marginBottom: 10,
  border: "1px solid #e4e9f1",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginTop: 3,
  borderRadius: 8,
  border: "1px solid #cfd6e3",
  outline: "none",
  fontSize: 14,
  transition: ".2s",
};

const labelStyle = {
  fontWeight: 600,
  fontSize: 13.5,
};