const BASE_URL = "http://127.0.0.1:8000/api";

// CREATE
export async function tambahLaporan(formData) {
  const res = await fetch(`${BASE_URL}/laporan-online`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

// READ ALL
export async function getLaporan() {
  const res = await fetch(`${BASE_URL}/laporan-online`);
  return res.json();
}

// READ BY ID
export async function getLaporanById(id) {
  const res = await fetch(`${BASE_URL}/laporan-online/${id}`);
  return res.json();
}

// UPDATE
export async function updateLaporan(id, formData) {
  const res = await fetch(`${BASE_URL}/laporan-online/${id}`, {
    method: "POST", // Laravel (PUT via _method)
    body: formData,
  });
  return res.json();
}

// DELETE
export async function hapusLaporan(id) {
  const res = await fetch(`${BASE_URL}/laporan-online/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
