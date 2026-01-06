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
    e.preventDefault(); // ⬅️ WAJIB
    alert("TOMBOL SUBMIT DIKLIK"); // ⬅️ TEST 1

    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) data.append(key, form[key]);
      });

      console.log("FORM DATA:", [...data.entries()]); // ⬅️ TEST 2

      const res = await tambahLaporan(data);
      console.log("RESPONSE API:", res); // ⬅️ TEST 3

      if (res.status) {
        alert("✅ Laporan berhasil disimpan");
      } else {
        alert("❌ Gagal menyimpan laporan");
      }
    } catch (error) {
      console.error("ERROR SUBMIT:", error);
      alert("❌ ERROR, cek console");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Tambah Laporan</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nama"
          placeholder="Nama"
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type="text"
          name="alamat"
          placeholder="Alamat"
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type="date"
          name="tanggal"
          onChange={handleChange}
          required
        /><br /><br />

        <textarea
          name="deskripsi"
          placeholder="Deskripsi"
          onChange={handleChange}
          required
        ></textarea><br /><br />

        <input
          type="file"
          name="foto"
          onChange={handleChange}
        /><br /><br />

        {/* ⬇️ INI PENTING */}
        <button type="submit">SIMPAN</button>
      </form>
    </div>
  );
}
