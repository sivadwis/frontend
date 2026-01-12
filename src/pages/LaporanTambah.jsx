import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import { tambahLaporan } from "../api/api";

const THEME = {
  primary: "#0ea5a4",
  accent: "#10b981",
  muted: "#6b7280",
  bg: "#f8fafc",
  surface: "#fff",
  danger: "#ef4444",
};

export default function LaporanTambah() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    deskripsi: "",
    tanggal: "",
    foto: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto") {
      const file = files && files[0] ? files[0] : null;
      if (file) {
        if (!file.type.startsWith("image/")) {
          setToast({ type: "error", text: "File harus berupa gambar (JPG/PNG)." });
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setToast({ type: "error", text: "Ukuran maksimal 5 MB." });
          return;
        }
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
        setForm((p) => ({ ...p, foto: file }));
      } else {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setForm((p) => ({ ...p, foto: null }));
      }
      setErrors((p) => ({ ...p, foto: null }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
      setErrors((p) => ({ ...p, [name]: null }));
    }
  };

  const validateClient = () => {
    const e = {};
    if (!form.nama || form.nama.trim().length < 2) e.nama = "Nama minimal 2 karakter.";
    if (!form.alamat || form.alamat.trim().length < 6) e.alamat = "Alamat minimal 6 karakter.";
    if (!form.tanggal) e.tanggal = "Tanggal kejadian wajib diisi.";
    if (!form.deskripsi || form.deskripsi.trim().length < 10) e.deskripsi = "Deskripsi minimal 10 karakter.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRemoveImage = () => {
    if (fileRef.current) fileRef.current.value = "";
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setForm((p) => ({ ...p, foto: null }));
    setErrors((p) => ({ ...p, foto: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    if (!validateClient()) {
      setToast({ type: "error", text: "Periksa kembali form, beberapa field wajib." });
      return;
    }

    setBusy(true);
    setErrors({});
    try {
      const fd = new FormData();
      fd.append("nama", form.nama);
      fd.append("alamat", form.alamat);
      fd.append("deskripsi", form.deskripsi);
      fd.append("tanggal", form.tanggal);
      fd.append("status", "baru"); // selalu kirim "baru"
      if (form.foto) fd.append("foto", form.foto);

      const res = await tambahLaporan(fd);
      // kompatibel dengan wrapper baru atau respons lama
      const ok = res && (res.ok || res.status === true || res.data?.status === true);
      if (ok) {
        setToast({ type: "success", text: "✅ Laporan berhasil disimpan" });
        setTimeout(() => navigate("/"), 700);
        return;
      }

      // validasi server (422)
      if (res && res.status === 422 && res.data && res.data.errors) {
        const mapped = {};
        for (const k of Object.keys(res.data.errors)) mapped[k] = res.data.errors[k];
        setErrors(mapped);
        setToast({ type: "error", text: "Validasi gagal — periksa input." });
        return;
      }

      const msg = (res && (res.data?.message || res.text || res.data?.error)) || "Gagal menyimpan laporan.";
      setToast({ type: "error", text: msg });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", text: "Terjadi kesalahan. Cek koneksi atau console." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: 28, fontFamily: "'Inter', sans-serif", background: THEME.bg, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: 820 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Tambah Laporan Baru</h2>
            <div style={{ color: THEME.muted, marginTop: 6 }}>Laporkan peristiwa/kejadian yang perlu perhatian komunitas.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: THEME.surface, padding: 18, borderRadius: 12, boxShadow: "0 12px 30px rgba(2,6,23,0.06)", border: "1px solid #eef2f7" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={labelStyle}>Nama Pelapor</label>
                <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama lengkap" style={inputStyle} aria-invalid={!!errors.nama} />
                {errors.nama && <div style={errorText}>{Array.isArray(errors.nama) ? errors.nama[0] : errors.nama}</div>}
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={labelStyle}>Alamat / Lokasi</label>
                <input name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat atau titik lokasi" style={inputStyle} aria-invalid={!!errors.alamat} />
                {errors.alamat && <div style={errorText}>{Array.isArray(errors.alamat) ? errors.alamat[0] : errors.alamat}</div>}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Tanggal Kejadian</label>
                  <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} style={inputStyle} aria-invalid={!!errors.tanggal} />
                  {errors.tanggal && <div style={errorText}>{Array.isArray(errors.tanggal) ? errors.tanggal[0] : errors.tanggal}</div>}
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={labelStyle}>Deskripsi Laporan</label>
                <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={6} placeholder="Jelaskan kronologi / detail kejadian" style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} aria-invalid={!!errors.deskripsi} />
                {errors.deskripsi && <div style={errorText}>{Array.isArray(errors.deskripsi) ? errors.deskripsi[0] : errors.deskripsi}</div>}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 10, background: "#fbfdff", border: "1px solid #eef2f7", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>P</div>
                  <div>
                    <div style={{ fontWeight: 800 }}>Foto Bukti (opsional)</div>
                    <div style={{ color: THEME.muted, fontSize: 13 }}>JPG/PNG — maksimal 5 MB</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`, color: "#fff", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>
                    <FaImage />
                    Pilih Foto
                    <input ref={fileRef} type="file" name="foto" accept="image/*" onChange={handleChange} style={{ display: "none" }} />
                  </label>

                  {form.foto && (
                    <button type="button" onClick={handleRemoveImage} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e6eef7", background: "#fff", cursor: "pointer" }}>
                      <FaTimes /> Hapus
                    </button>
                  )}
                </div>

                <div style={{ marginTop: 6 }}>
                  {preview ? (
                    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eef2f7" }}>
                      <img src={preview} alt="preview" style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }} />
                    </div>
                  ) : (
                    <div style={{ height: 240, borderRadius: 10, border: "1px dashed #e6eef7", display: "flex", alignItems: "center", justifyContent: "center", color: THEME.muted }}>
                      <div style={{ textAlign: "center" }}>
                        <FaImage size={34} />
                        <div style={{ marginTop: 8 }}>Belum ada foto</div>
                      </div>
                    </div>
                  )}
                  {errors.foto && <div style={errorText}>{Array.isArray(errors.foto) ? errors.foto[0] : errors.foto}</div>}
                </div>
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #eef2f7", cursor: "pointer" }}>
                  Batal
                </button>

                <button type="submit" disabled={busy} aria-busy={busy} style={{ flex: 2, padding: 12, borderRadius: 10, background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`, color: "#fff", border: "none", cursor: busy ? "default" : "pointer", display: "inline-flex", gap: 8, justifyContent: "center", alignItems: "center", fontWeight: 800 }}>
                  {busy ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaPaperPlane />}
                  <span>{busy ? "Menyimpan..." : "Simpan Laporan"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {toast && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 8, border: "1px solid", background: toast.type === "error" ? "#fff5f5" : "#ecfdf5", color: toast.type === "error" ? THEME.danger : "#065f46" }}>
            {toast.text}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}

/* ===== styles ===== */
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginTop: 6,
  borderRadius: 10,
  border: "1px solid #e6eef7",
  outline: "none",
  fontSize: 14,
  background: "#fff",
};

const labelStyle = {
  fontWeight: 700,
  fontSize: 13,
  color: "#0f172a",
};

const errorText = {
  color: "#dc2626",
  marginTop: 6,
  fontSize: 13,
};