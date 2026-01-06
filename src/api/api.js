const BASE_URL = "http://127.0.0.1:8000/api";

export async function tambahLaporan(formData) {
  const res = await fetch(`${BASE_URL}/laporan-online`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function getLaporan() {
  const res = await fetch(`${BASE_URL}/laporan-online`);
  return res.json();
}
