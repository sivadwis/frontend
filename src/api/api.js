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

// =====================
// Fetch image blob (protected)
// =====================
// Use this to fetch /api/foto/{filename} which is protected by auth:sanctum.
// If you store a Bearer token in localStorage it will be sent, otherwise it will use credentials: 'include' (for Sanctum cookies).
export async function fetchImageBlob(filename) {
  if (!filename) throw new Error("filename required");
  const token = localStorage.getItem("token");
  const url = `${BASE_URL}/foto/${encodeURIComponent(filename)}`;

  const headers = {};
  const options = { method: "GET", headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    // do not send credentials for bearer token
  } else {
    // for Sanctum cookie-based auth
    options.credentials = "include";
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    const err = new Error(`Gagal mengambil gambar: ${res.status} ${text}`);
    err.status = res.status;
    throw err;
  }

  const blob = await res.blob();
  return blob;
}