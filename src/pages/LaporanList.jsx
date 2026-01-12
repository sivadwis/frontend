import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaSpinner,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaImage,
} from "react-icons/fa";
import { getLaporan, hapusLaporan, fetchImageBlob } from "../api/api";
import { useNavigate } from "react-router-dom";

/**
 * LaporanTable.jsx
 * - Modern minimal table view for laporan
 * - Includes "Deskripsi" column with truncation + "Selengkapnya" modal
 * - Fixed duplicate-prop JSX error
 */

const IMAGE_PUBLIC_BASE = "http://127.0.0.1:8000/storage/foto";

export default function LaporanTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [sortKey, setSortKey] = useState("tanggal");
  const [sortDir, setSortDir] = useState("desc");

  const [imageSrcs, setImageSrcs] = useState({});
  const [imgErrors, setImgErrors] = useState({});
  const mountedRef = useRef(true);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [previewImg, setPreviewImg] = useState(null);
  const [descModal, setDescModal] = useState(null); // { title, text } | null

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      Object.values(imageSrcs).forEach((u) => {
        try { URL.revokeObjectURL(u); } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLaporan();
      let items = [];
      if (!res) items = [];
      else if (Array.isArray(res)) items = res;
      else if (Array.isArray(res.data)) items = res.data;
      else items = [];
      setData(items);
    } catch (err) {
      console.error("load laporan error", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // search + sort + include deskripsi in search
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = data.filter((r) => {
      if (!q) return true;
      return (
        (r.nama || "").toLowerCase().includes(q) ||
        (r.alamat || "").toLowerCase().includes(q) ||
        (r.deskripsi || "").toLowerCase().includes(q)
      );
    });

    items.sort((a, b) => {
      const va = a[sortKey] ?? "";
      const vb = b[sortKey] ?? "";
      if (sortKey === "tanggal") {
        const da = va ? new Date(va) : new Date(0);
        const db = vb ? new Date(vb) : new Date(0);
        return sortDir === "asc" ? da - db : db - da;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [data, query, sortKey, sortDir]);

  const total = filteredSorted.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  useEffect(() => { if (page > pages) setPage(1); }, [pages]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // lazy fetch images for current page
  useEffect(() => {
    if (!data || data.length === 0) return;
    let cancelled = false;
    (async () => {
      const start = (page - 1) * perPage;
      const pageItems = filteredSorted.slice(start, start + perPage);
      for (const item of pageItems) {
        if (!item.foto) continue;
        if (imageSrcs[item.id] || imgErrors[item.id]) continue;
        const filename = item.foto.split("/").pop().split("\\").pop();
        try {
          const blob = await fetchImageBlob(filename);
          if (cancelled || !mountedRef.current) {
            try { URL.revokeObjectURL(blob); } catch {}
            break;
          }
          const objectUrl = URL.createObjectURL(blob);
          setImageSrcs((prev) => ({ ...prev, [item.id]: objectUrl }));
        } catch (err) {
          console.warn("fetch image failed", item.id, err);
          setImgErrors((p) => ({ ...p, [item.id]: true }));
          const publicUrl = `${IMAGE_PUBLIC_BASE}/${encodeURIComponent(filename)}`;
          setImageSrcs((prev) => ({ ...prev, [item.id]: publicUrl }));
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page, sortKey, sortDir, query, filteredSorted]);

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus laporan ini?")) return;
    setDeletingId(id);
    try {
      await hapusLaporan(id);
      if (imageSrcs[id]) {
        try { URL.revokeObjectURL(imageSrcs[id]); } catch {}
        setImageSrcs((prev) => { const c = { ...prev }; delete c[id]; return c; });
      }
      await load();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus laporan");
    } finally {
      setDeletingId(null);
    }
  };

  // simple formatter
  const fmtDate = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  // truncate helper
  const truncate = (str, n = 120) => {
    if (!str) return "-";
    return str.length > n ? str.slice(0, n).trim() + "…" : str;
  };

  // UI styles (minimal inline)
  const styles = {
    page: { padding: 20, fontFamily: "'Inter', sans-serif", minHeight: "80vh", background: "#f6f9fc" },
    search: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, background: "white", boxShadow: "0 6px 20px rgba(2,6,23,0.04)" },
    tableWrap: { width: "100%", overflowX: "auto", background: "white", borderRadius: 12, boxShadow: "0 6px 20px rgba(2,6,23,0.04)" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 1100 },
    th: { textAlign: "left", padding: "12px 14px", borderBottom: "1px solid #eef2f7", fontWeight: 700, fontSize: 13, color: "#334155", background: "linear-gradient(180deg,#fff,#fbfdff)" },
    td: { padding: "12px 14px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle", fontSize: 14, color: "#0f172a" },
    thumb: { width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #f1f5f9" },
    actions: { display: "flex", gap: 8 },
    btn: { padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, color: "white" },
    btnEdit: { background: "linear-gradient(90deg,#f59e0b,#f97316)" },
    btnDelete: { background: "linear-gradient(90deg,#ef4444,#dc2626)" },
    btnView: { background: "linear-gradient(90deg,#06b6d4,#0891b2)" },
    pager: { display: "flex", gap: 8, alignItems: "center", marginTop: 12, justifyContent: "space-between" },
    pageNums: { display: "flex", gap: 6, alignItems: "center" },
    pageBtn: { padding: "6px 10px", borderRadius: 8, background: "#fff", border: "1px solid #e6eef7", cursor: "pointer" },
    empty: { padding: 28, textAlign: "center", color: "#64748b" },
    descCell: { maxWidth: 420, whiteSpace: "normal", overflow: "hidden", textOverflow: "ellipsis" },
    descMore: { color: "#0ea5a4", cursor: "pointer", fontWeight: 700, marginLeft: 6, fontSize: 13 },
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0 }}>Daftar Laporan</h3>
          <div style={{ color: "#64748b", fontSize: 13 }}>Kelola laporan yang masuk</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={styles.search}>
            <FaSearch style={{ color: "#64748b" }} />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Cari nama, alamat, atau deskripsi..."
              style={{ border: "none", outline: "none", minWidth: 260 }}
            />
          </div>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Foto</th>
              <th style={{ ...styles.th, cursor: "pointer" }} onClick={() => toggleSort("nama")}>
                Nama&nbsp;
                {sortKey === "nama" ? (sortDir === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
              </th>
              <th style={styles.th}>Alamat</th>
              <th style={{ ...styles.th, cursor: "pointer" }} onClick={() => toggleSort("tanggal")}>
                Tanggal&nbsp;
                {sortKey === "tanggal" ? (sortDir === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
              </th>
              <th style={styles.th}>Deskripsi</th>
              <th style={{ ...styles.th, cursor: "pointer" }} onClick={() => toggleSort("status")}>
                Status&nbsp;
                {sortKey === "status" ? (sortDir === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
              </th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {total === 0 && !loading && (
              <tr><td colSpan={8} style={styles.empty}>Tidak ada data.</td></tr>
            )}

            {loading && (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: "center" }}><FaSpinner style={{ animation: "spin 1s linear infinite" }} /> Memuat...</td></tr>
            )}

            {!loading && filteredSorted.slice((page - 1) * perPage, page * perPage).map((l, idx) => {
              const number = (page - 1) * perPage + idx + 1;
              const imgSrc = imageSrcs[l.id];
              return (
                <tr key={l.id}>
                  <td style={styles.td}>{number}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {imgSrc ? (
                        <img src={imgSrc} alt="foto" style={styles.thumb} onClick={() => setPreviewImg(imgSrc)} />
                      ) : (
                        <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRadius: 8 }}>
                          <FaImage style={{ color: "#94a3b8" }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>{l.nama || "-"}</td>
                  <td style={styles.td}>{l.alamat || "-"}</td>
                  <td style={styles.td}>{fmtDate(l.tanggal)}</td>

                  {/* Deskripsi column (truncated) */}
                  <td style={{ ...styles.td, ...styles.descCell }}>
                    <span>{truncate(l.deskripsi, 140)}</span>
                    {l.deskripsi && l.deskripsi.length > 140 && (
                      <span
                        onClick={() => setDescModal({ title: l.nama || "Deskripsi", text: l.deskripsi })}
                        style={styles.descMore}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") setDescModal({ title: l.nama || "Deskripsi", text: l.deskripsi }); }}
                      >
                        Selengkapnya
                      </span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <span style={{ padding: "6px 10px", borderRadius: 999, fontWeight: 700, fontSize: 13, background: l.status === "baru" ? "rgba(59,130,246,0.12)" : l.status === "diproses" ? "rgba(250,204,21,0.12)" : "rgba(16,185,129,0.12)", color: l.status === "baru" ? "#1e40af" : l.status === "diproses" ? "#92400e" : "#065f46" }}>
                      {l.status || "-"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button title="Lihat" onClick={() => (imgSrc ? setPreviewImg(imgSrc) : alert("Tidak ada foto"))} style={{ ...styles.btn, ...styles.btnView }}>
                        <FaEye />
                      </button>

                      {role === "admin" ? (
                        <>
                          <button title="Edit" onClick={() => navigate(`/edit/${l.id}`)} style={{ ...styles.btn, ...styles.btnEdit }}>
                            <FaEdit />
                          </button>

                          <button title="Hapus" onClick={() => handleDelete(l.id)} disabled={deletingId === l.id} style={{ ...styles.btn, ...styles.btnDelete }}>
                            {deletingId === l.id ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaTrash />}
                          </button>
                        </>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.pager}>
        <div style={styles.pageNums}>
          <button onClick={() => setPage(1)} disabled={page === 1} style={styles.pageBtn}>First</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>Prev</button>
          <div style={{ padding: "6px 10px" }}>Hal {page} dari {pages}</div>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} style={styles.pageBtn}>Next</button>
          <button onClick={() => setPage(pages)} disabled={page === pages} style={styles.pageBtn}>Last</button>
        </div>

        <div style={{ color: "#64748b", fontSize: 13 }}>
          Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} dari {total} laporan
        </div>
      </div>

      {/* Preview modal for images */}
      {previewImg && (
        <div onClick={() => setPreviewImg(null)} style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <img src={previewImg} alt="Preview" style={{ maxWidth: "92%", maxHeight: "86%", borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Deskripsi modal */}
      {descModal && (
        <div onClick={() => setDescModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(880px, 92%)", maxHeight: "86%", overflowY: "auto", background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 18px 60px rgba(2,6,23,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>{descModal.title}</h4>
              <button onClick={() => setDescModal(null)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ color: "#0f172a", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{descModal.text}</div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}