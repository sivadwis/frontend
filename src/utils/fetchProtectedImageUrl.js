// Utility: fetch image using either Bearer token (from localStorage) or Sanctum cookie (credentials: 'include').
// Returns an object URL (URL.createObjectURL(blob)) or throws an Error.
export default async function fetchProtectedImageUrl(apiUrl) {
  // Try to read token from localStorage (if you use Bearer tokens)
  const token = localStorage.getItem("token"); // adjust key if different

  const headers = {};
  const fetchOptions = {
    method: "GET",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    fetchOptions.headers = headers;
    // Don't set credentials if using Bearer token
  } else {
    // If using Sanctum cookie-based auth, include credentials so cookies are sent
    fetchOptions.credentials = "include";
    fetchOptions.headers = headers;
  }

  const res = await fetch(apiUrl, fetchOptions);

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    const err = new Error(`Gagal load image: ${res.status} ${text}`);
    err.status = res.status;
    throw err;
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  return objectUrl;
}