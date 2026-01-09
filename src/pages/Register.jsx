import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";

// API URL
const API_URL = "http://127.0.0.1:8000/api";

// Styles object for better organization (instead of inline styles everywhere)
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #10b981, #06b6d4)",
    fontFamily: "'Poppins', sans-serif",
    padding: "20px",
  },
  form: {
    background: "white",
    padding: "40px 32px",
    borderRadius: "16px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "360px",
    animation: "fadeIn 0.5s ease-in-out",
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#4b5563",
    fontSize: "14px",
  },
  // wrapper for each input group (ke luar)
  inputGroup: {
    position: "relative",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center", // center the inner input wrapper
  },
  // inner wrapper to keep icon absolutely positioned relative to it
  inputInner: {
    position: "relative",
    width: "100%",
    maxWidth: "300px", // adjust this value to make inputs shorter/longer
  },
  icon: {
    position: "absolute",
    top: "50%",
    left: "12px",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "12px 12px 12px 40px", // left padding to make room for icon
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
    fontSize: "16px",
    boxSizing: "border-box",
    display: "block",
  },
  inputFocus: {
    borderColor: "#10b981",
    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
  },
  button: {
    width: "100%",
    padding: "12px 0",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #10b981, #06b6d4)",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.3s, transform 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  buttonHover: {
    background: "linear-gradient(135deg, #059669, #0ea5e9)",
    transform: "translateY(-2px)",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
  },
  linkText: {
    marginTop: "16px",
    fontSize: "13px",
    textAlign: "center",
    color: "#4b5563",
  },
  link: {
    color: "#10b981",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.3s",
  },
  linkHover: {
    color: "#059669",
  },
  error: {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "6px",
    textAlign: "center",
  },
  success: {
    color: "#10b981",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "16px",
  },
};

// Keyframes for fade-in animation (add this to your global CSS or inline)
const fadeInKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Input component for reusability (uses inner wrapper to control max-width)
const InputField = ({ name, icon: Icon, type, placeholder, value, onChange, error }) => (
  <div style={styles.inputGroup}>
    <div style={styles.inputInner}>
      <Icon style={styles.icon} />
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        style={styles.input}
        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
        onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
      />
      {error && <div style={styles.error}>{error}</div>}
    </div>
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear specific error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi.";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email tidak valid.";
    if (!form.password) newErrors.password = "Password wajib diisi.";
    else if (form.password.length < 6) newErrors.password = "Password minimal 6 karakter.";
    if (form.password !== form.password_confirmation) newErrors.password_confirmation = "Password tidak cocok.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    setSuccessMessage("");
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.message || "Registrasi gagal. Coba lagi." });
        return;
      }
      setSuccessMessage("✅ Registrasi berhasil! Silakan login.");
      setTimeout(() => navigate("/login"), 2000); // Delay for user to see message
    } catch (err) {
      console.error(err);
      setErrors({ general: "❌ Gagal terhubung ke server. Periksa koneksi Anda." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{fadeInKeyframes}</style> {/* Inject keyframes */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Selamat Datang!</h1>
        <p style={styles.subtitle}>Silakan daftar untuk membuat akun baru</p>

        {successMessage && <div style={styles.success}>{successMessage}</div>}
        {errors.general && <div style={styles.error}>{errors.general}</div>}

        <InputField
          name="name"
          icon={FaUser}
          type="text"
          placeholder="Nama"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <InputField
          name="email"
          icon={FaEnvelope}
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <InputField
          name="password"
          icon={FaLock}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <InputField
          name="password_confirmation"
          icon={FaLock}
          type="password"
          placeholder="Konfirmasi Password"
          value={form.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.buttonHover)}
          onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.button)}
        >
          {loading && <FaSpinner style={{ animation: "spin 1s linear infinite" }} />}
          {loading ? "Mendaftarkan..." : "Daftar"}
        </button>

        <p style={styles.linkText}>
          Sudah punya akun?{" "}
          <Link
            to="/login"
            style={styles.link}
            onMouseEnter={(e) => (e.target.style.color = styles.linkHover.color)}
            onMouseLeave={(e) => (e.target.style.color = styles.link.color)}
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}