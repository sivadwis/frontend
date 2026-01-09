import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLaporanById, updateLaporan, fetchImageBlob } from "../api/api";
import { FaChevronLeft, FaPaperPlane, FaTimes, FaImage } from "react-icons/fa";

/**
 * Modern, clean Laporan Edit form
 * - Responsive card layout
 * - Inline validation
 * - Existing photo preview + optional replace (with client-side preview)
 * - Friendly submit state and toast message
 *
 * Usage: route points to this component with :id param
 */

const IMAGE_PUBLIC_BASE = "http://127.0.0.1:8000/storage/foto";

export default function LaporanEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    tanggal: "",
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // image handling
  const [existingImageSrc, setExistingImageSrc] = useState(null); // url or objectUrl
  const [imageFile, setImageFile] = useState(null); // File to upload
  const [previewSrc, setPreviewSrc] = useState(null); // objectUrl for selected file

  // small toast message
  const [toast, setToast] = useState(null);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
      // revoke object urls
      try { previewSrc && URL.revokeObjectURL(previewSrc); } catch {}
      try { existingImageSrc && existingImageSrc.startsWith("blob:") && URL.revokeObjectURL(existingImageSrc); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLaporanById(id);
      // adapt to various shapes (res.data or res)
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

      // try to load protected image first using fetchImageBlob (if endpoint exists)
      if (data.foto) {
        try {
          const blob = await fetchImageBlob(data.foto);
          // create object url for preview (protected)
          const objUrl = URL.createObjectURL(blob);
          if (mountedRef.current) setExistingImageSrc(objUrl);
        } catch (err) {
          // fallback to public storage URL (if file moved to public)
          const publicUrl = `${IMAGE_PUBLIC_BASE}/${encodeURIComponent(data.foto)}`;
          if (mountedRef.current) setExistingImageSrc(publicUrl);
        }
      } else {
        setExistingImageSrc(null);
      }
    } catch (err) {
      console.error("Load laporan error", err);
      setToast({ type: "error", text: "Terjadi kesalahan saat memuat data." });
      setForm({ nama: "", alamat: "", tanggal: "", status: "" });
    } finally {
      if (mountedRef.current) setLoading(false);
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
    // simple client-side validation
    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", text: "File harus berupa gambar." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", text: "Ukuran gambar maksimal 5 MB." });
      return;
    }
    // revoke previous preview
    try { previewSrc && URL.revokeObjectURL(previewSrc); } catch {}
    const obj = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewSrc(obj);
  };

  const handleRemoveSelectedImage = () => {
    try { previewSrc && URL.revokeObjectURL(previewSrc); } catch {}
    setImageFile(null);
    setPreviewSrc(null);
    // keep existingImageSrc as is (don't remove existing file on server)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ type: "error", text: "Periksa formulir sebelum menyimpan." });
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("nama", form.nama);
      formData.append("alamat", form.alamat);
      formData.append("tanggal", form.tanggal);
      formData.append("status", form.status);

      if (imageFile) {
        formData.append("foto", imageFile);
      }

      const res = await updateLaporan(id, formData);

      // adapt to different response shapes
      const ok = res && (res.status === true || res.success === true || res.message);
      if (ok) {
        setToast({ type: "success", text: "Perubahan disimpan." });
        // give a short delay so user can see the toast
        setTimeout(() => navigate("/"), 800);
      } else {
        // if API returns validation errors, map them
        if (res && res.errors) {
          setErrors(res.errors);
          setToast({ type: "error", text: "Validasi server gagal. Periksa input." });
        } else {
          setToast({ type: "error", text: "Gagal menyimpan perubahan." });
        }
      }
    } catch (err) {
      console.error("Update error", err);
      setToast({ type: "error", text: "Terjadi kesalahan saat menyimpan." });
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <button
            onClick={() => navigate(-1)}
            style={backBtnStyle}
            aria-label="Kembali"
            title="Kembali"
          >
            <FaChevronLeft />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Edit Laporan</h2>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>Ubah detail laporan lalu simpan.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
          <div style={formGrid}>
            <div style={colLeft}>
              {/* Nama */}
              <label style={labelStyle}>Nama</label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nama pelapor"
                style={{ ...inputStyle, borderColor: errors.nama ? "#f43f5e" : inputStyle.border }}
                required
              />
              {errors.nama && <div style={errorText}>{errors.nama}</div>}

              {/* Alamat */}
              <label style={{ ...labelStyle, marginTop: 12 }}>Alamat</label>
              <textarea
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                placeholder="Alamat lengkap atau lokasi"
                style={{ ...inputStyle, height: 100, resize: "vertical", borderColor: errors.alamat ? "#f43f5e" : inputStyle.border }}
                required
              />
              {errors.alamat && <div style={errorText}>{errors.alamat}</div>}

              {/* Status */}
              <label style={{ ...labelStyle, marginTop: 12 }}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ ...inputStyle, padding: "10px 12px", borderColor: errors.status ? "#f43f5e" : inputStyle.border }}
                required
              >
                <option value="">— Pilih status —</option>
                <option value="baru">Menunggu</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
              </select>
              {errors.status && <div style={errorText}>{errors.status}</div>}
            </div>

            <div style={colRight}>
              <label style={labelStyle}>Tanggal</label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                style={{ ...inputStyle, marginBottom: 12, borderColor: errors.tanggal ? "#f43f5e" : inputStyle.border }}
                required
              />
              {errors.tanggal && <div style={errorText}>{errors.tanggal}</div>}

              <div style={{ marginTop: 6 }}>
                <label style={labelStyle}>Foto (opsional)</label>
                <div style={imageCard}>
                  {/* preview area */}
                  <div style={imagePreviewWrap}>
                    {previewSrc ? (
                      <>
                        <img src={previewSrc} alt="Preview" style={imagePreview} />
                        <button type="button" onClick={handleRemoveSelectedImage} style={removeImageBtn} title="Hapus gambar terpilih">
                          <FaTimes />
                        </button>
                      </>
                    ) : existingImageSrc ? (
                      <>
                        <img src={existingImageSrc} alt="Existing" style={imagePreview} />
                        <div style={imageNote}>Foto saat ini</div>
                      </>
                    ) : (
                      <div style={noImage}>
                        <FaImage size={28} color="#94a3b8" />
                        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>Belum ada foto</div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                    <label style={chooseBtn}>
                      Pilih Foto
                      <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
                    </label>

                    {previewSrc || existingImageSrc ? (
                      <button type="button" onClick={() => { setImageFile(null); setPreviewSrc(null); setExistingImageSrc(null); }} style={removeBtn}>
                        Hapus Foto
                      </button>
                    ) : null}

                    <div style={{ marginLeft: "auto", color: "#64748b", fontSize: 13 }}>
                      Maks 5 MB, JPG/PNG
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* actions */}
          <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" onClick={() => navigate("/")} style={cancelBtn}>
              Batal
            </button>

            <button type="submit" disabled={saving} style={{ ...saveBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? <FaSpinner style={{ marginRight: 8, animation: "spin 1s linear infinite" }} /> : <FaPaperPlane style={{ marginRight: 8 }} />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* toast */}
      {toast && (
        <div style={{ ...toastStyle, background: toast.type === "error" ? "#fee2e2" : "#ecfdf5", borderColor: toast.type === "error" ? "#fecaca" : "#bbf7d0", color: toast.type === "error" ? "#991b1b" : "#065f46" }}>
          {toast.text}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}

/* ===== Styles ===== */

const wrapperStyle = {
  minHeight: "100vh",
  padding: "36px 18px",
  background: "linear-gradient(180deg,#f8fafc,#eef2ff)",
  display: "flex",
  justifyContent: "center",
  fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
};

const cardStyle = {
  width: "100%",
  maxWidth: 980,
  background: "#fff",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 12px 40px rgba(2,6,23,0.06)",
};

const headerStyle = { display: "flex", gap: 12, alignItems: "center", marginBottom: 6 };
const backBtnStyle = {
  width: 44,
  height: 44,
  borderRadius: 10,
  border: "none",
  background: "#f1f5f9",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 320px",
  gap: 18,
};

const colLeft = { display: "flex", flexDirection: "column" };
const colRight = { display: "flex", flexDirection: "column" };

const labelStyle = { fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 6 };
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e6eef7",
  outline: "none",
  fontSize: 14,
  background: "#fff",
};

const errorText = { color: "#dc2626", fontSize: 13, marginTop: 6 };

const imageCard = {
  background: "#fbfdff",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #eef2f7",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
};

const imagePreviewWrap = { width: "100%", height: 200, borderRadius: 8, overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" };
const imagePreview = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const noImage = { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#94a3b8" };
const imageNote = { position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.5)", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 12 };

const chooseBtn = {
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 10,
  background: "linear-gradient(90deg,#06b6d4,#0ea5a4)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const removeBtn = {
  padding: "8px 12px",
  borderRadius: 10,
  background: "#f8fafc",
  border: "1px solid #f1f5f9",
  color: "#ef4444",
  cursor: "pointer",
  fontWeight: 700,
};

const removeImageBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "none",
  background: "rgba(255,255,255,0.8)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const cancelBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "#fff",
  border: "1px solid #eef2f7",
  color: "#334155",
  cursor: "pointer",
  fontWeight: 700,
};

const saveBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "linear-gradient(90deg,#2e5bff,#06b6d4)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
};

const toastStyle = {
  position: "fixed",
  right: 20,
  bottom: 20,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid",
  boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
  zIndex: 9999,
};