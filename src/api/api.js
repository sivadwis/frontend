const BASE_URL = "http://127.0.0.1:8000/api";

// helper fetch dengan token
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json", // 🔥 PALING PENTING
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Response bukan JSON:", text);
    throw new Error("Response bukan JSON");
  }
}

// =====================
// CREATE
// =====================
export function tambahLaporan(formData) {
  return authFetch(`${BASE_URL}/laporan-online`, {
    method: "POST",
    body: formData, // ❗ jangan set Content-Type
  });
}

// =====================
// READ ALL
// =====================
export function getLaporan() {
  return authFetch(`${BASE_URL}/laporan-online`);
}

// =====================
// READ BY ID
// =====================
export function getLaporanById(id) {
  return authFetch(`${BASE_URL}/laporan-online/${id}`);
}

// =====================
// UPDATE (ADMIN)
// =====================
export function updateLaporan(id, formData) {
  formData.append("_method", "PUT"); // Laravel trick

  return authFetch(`${BASE_URL}/laporan-online/${id}`, {
    method: "POST",
    body: formData,
  });
}

// =====================
// DELETE (ADMIN)
// =====================
export function hapusLaporan(id) {
  return authFetch(`${BASE_URL}/laporan-online/${id}`, {
    method: "DELETE",
  });
}
