import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLaporanById, updateLaporan, fetchImageBlob } from "../api/api";
import { FaChevronLeft, FaPaperPlane, FaTimes, FaImage, FaSpinner } from "react-icons/fa";

const IMAGE_PUBLIC_BASE = "http://127.0.0.1:8000/storage/foto";

export default function LaporanEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const [form, setForm] = useState({ nama: "", alamat: "", tanggal: "", status: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [existingImageSrc, setExistingImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [toast, setToast] = useState(null);

  // theme
  const theme = {
    primary: "#0ea5a4",
    accent: "#10b981",
    muted: "#6b7280",
    surface: "#fff",
    bg: "#f8fafc",
  };

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
      try { previewSrc && URL.revokeObjectURL(previewSrc); } catch {}
      try { existingImageSrc && existingImageSrc.startsWith("blob:") && URL.revokeObjectURL(existingImageSrc); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    try {
      const res = await getLaporanById(id);
      const data = res && res.data ? res.data : res;
      if (!data) {
        setToast({ type: "error", text: "Gagal memuat data laporan." });
        return;
      }
      setForm({
        nama: data.nama || "",
        alamat: data.alamat || "",
        tanggal: data.tanggal ? data.tanggal.split(" ")[0] : "",
        status: data.status || "",
      });
      if (data.foto) {
        try {
          const blob = await fetchImageBlob(data.foto);
          const objUrl = URL.createObjectURL(blob);
          if (mountedRef.current) setExistingImageSrc(objUrl);
        } catch {
          const publicUrl = `${IMAGE_PUBLIC_BASE}/${encodeURIComponent(data.foto)}`;
          if (mountedRef.current) setExistingImageSrc(publicUrl);
        }
      } else setExistingImageSrc(null);
    } catch (err) {
      console.error("Load error", err);
      setToast({ type: "error", text: "Terjadi kesalahan saat memuat." });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.nama || form.nama.trim().length < 2) errs.nama = "Nama minimal 2 karakter.";
    if (!form.alamat || form.alamat.trim().length < 6) errs.alamat = "Alamat minimal 6 karakter.";
    if (!form.tanggal) errs.tanggal = "Tanggal wajib diisi.";
    if (!form.status) errs.status = "Pilih status laporan.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setToast({ type: "error", text: "File harus berupa gambar." }); return; }
    if (file.size > 5 * 1024 * 1024) { setToast({ type: "error", text: "Ukuran gambar maksimal 5 MB." }); return; }
    try { previewSrc && URL.revokeObjectURL(previewSrc); } catch {}
    const obj = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewSrc(obj);
  };

  const handleRemoveSelectedImage = () => {
    try { previewSrc && URL.revokeObjectURL(previewSrc); } catch {}
    setImageFile(null);
    setPreviewSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setToast({ type: "error", text: "Periksa formulir sebelum menyimpan." }); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("nama", form.nama);
      formData.append("alamat", form.alamat);
      formData.append("tanggal", form.tanggal);
      formData.append("status", form.status);
      if (imageFile) formData.append("foto", imageFile);

      const res = await updateLaporan(id, formData);
      const ok = res && (res.status === true || res.success === true || res.message || res.ok);
      if (ok) {
        setToast({ type: "success", text: "Perubahan disimpan." });
        setTimeout(() => navigate("/"), 700);
      } else {
        if (res && res.data && res.status === 422 && res.data.errors) {
          setErrors(res.data.errors);
        }
        setToast({ type: "error", text: (res && res.data && (res.data.message || res.data.error)) || "Gagal menyimpan perubahan." });
      }
    } catch (err) {
      console.error("Update error", err);
      setToast({ type: "error", text: "Terjadi kesalahan saat menyimpan." });
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: 36, background: theme.bg, fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 980, background: theme.surface, borderRadius: 12, padding: 20, boxShadow: "0 12px 40px rgba(2,6,23,0.06)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, borderRadius: 10, border: "none", background: "#f1f5f9", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <FaChevronLeft />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Edit Laporan</h2>
            <div style={{ color: theme.muted, fontSize: 13 }}>Ubah detail laporan lalu simpan.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nama</label>
              <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama pelapor" style={{ padding: "10px 12px", borderRadius: 10, border: errors.nama ? "1px solid #f43f5e" : "1px solid #e6eef7", outline: "none" }} />
              {errors.nama && <div style={{ color: "#dc2626", marginTop: 6 }}>{errors.nama}</div>}

              <label style={{ fontSize: 13, fontWeight: 700, marginTop: 12, marginBottom: 6 }}>Alamat</label>
              <textarea name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat / lokasi" style={{ padding: 12, borderRadius: 10, border: errors.alamat ? "1px solid #f43f5e" : "1px solid #e6eef7", minHeight: 100, resize: "vertical" }} />
              {errors.alamat && <div style={{ color: "#dc2626", marginTop: 6 }}>{errors.alamat}</div>}

              <label style={{ fontSize: 13, fontWeight: 700, marginTop: 12, marginBottom: 6 }}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={{ padding: "10px 12px", borderRadius: 10, border: errors.status ? "1px solid #f43f5e" : "1px solid #e6eef7" }}>
                <option value="">— Pilih status —</option>
                <option value="baru">Baru</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
              </select>
              {errors.status && <div style={{ color: "#dc2626", marginTop: 6 }}>{errors.status}</div>}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Tanggal</label>
              <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} style={{ padding: "10px 12px", borderRadius: 10, border: errors.tanggal ? "1px solid #f43f5e" : "1px solid #e6eef7" }} />

              <div style={{ marginTop: 10, background: "#fbfdff", padding: 12, borderRadius: 10, border: "1px solid #eef2f7" }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>Foto (opsional)</label>

                <div style={{ width: "100%", height: 200, borderRadius: 8, overflow: "hidden", position: "relative", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {previewSrc ? (
                    <>
                      <img src={previewSrc} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={handleRemoveSelectedImage} style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}><FaTimes /></button>
                    </>
                  ) : existingImageSrc ? (
                    <>
                      <img src={existingImageSrc} alt="existing" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.5)", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>Foto saat ini</div>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#94a3b8" }}>
                      <FaImage size={28} />
                      <div style={{ fontSize: 13 }}>Belum ada foto</div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                  <label style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 10, background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`, color: "white", cursor: "pointer", fontWeight: 700 }}>
                    Pilih Foto
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
                  </label>

                  {(previewSrc || existingImageSrc) && (
                    <button type="button" onClick={() => { setImageFile(null); setPreviewSrc(null); setExistingImageSrc(null); }} style={{ padding: "8px 12px", borderRadius: 10, background: "#fff", border: "1px solid #eef2f7", cursor: "pointer", color: theme.primary }}>
                      Hapus Foto
                    </button>
                  )}

                  <div style={{ marginLeft: "auto", color: theme.muted, fontSize: 13 }}>Maks 5 MB, JPG/PNG</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => navigate("/")} style={{ padding: "10px 14px", borderRadius: 10, background: "#fff", border: "1px solid #eef2f7", cursor: "pointer" }}>Batal</button>

            <button type="submit" disabled={saving} style={{ padding: "10px 14px", borderRadius: 10, background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`, color: "#fff", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              {saving ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaPaperPlane />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div style={{ position: "fixed", right: 20, bottom: 20, padding: "10px 14px", borderRadius: 8, background: toast.type === "error" ? "#fee2e2" : "#ecfdf5", color: toast.type === "error" ? "#991b1b" : "#065f46", border: "1px solid", borderColor: toast.type === "error" ? "#fecaca" : "#bbf7d0" }}>
          {toast.text}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}