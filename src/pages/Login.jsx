import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";

// API URL
const API_URL = "http://127.0.0.1:8000/api";

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #4e73df, #2e93ff)",
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
  inputGroup: {
    position: "relative",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center",
  },
  inputInner: {
    position: "relative",
    width: "100%",
    maxWidth: "300px", // sesuaikan lebar input di sini
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
    padding: "12px 12px 12px 40px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
    fontSize: "16px",
    boxSizing: "border-box",
    display: "block",
  },
  inputFocus: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.08)",
  },
  button: {
    width: "100%",
    padding: "12px 0",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
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
    background: "#2563eb",
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
  linkAction: {
    color: "#3b82f6",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "6px",
    textAlign: "center",
  },
};

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

// Reusable input field like Register.jsx
const InputField = ({ icon: Icon, type, placeholder, value, onChange, error }) => (
  <div style={styles.inputGroup}>
    <div style={styles.inputInner}>
      <Icon style={styles.icon} />
      <input
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

export default function Login({ setIsLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        // store token and minimal user info
        localStorage.setItem("token", data.token);
        if (data.user && data.user.role) localStorage.setItem("role", data.user.role);
        if (data.user && data.user.name) localStorage.setItem("name", data.user.name);

        // notify parent about login
        setIsLogin && setIsLogin(true);

        // navigate to home page after login
        // NOTE: make sure your App.jsx has a route for "/home".
        // If Home is the root "/", change path below to "/".
        navigate("/home", { replace: true });
      } else {
        setErrorMsg(data.message || "Cek email & password");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{fadeInKeyframes}</style>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Selamat Datang!</h1>
        <p style={styles.subtitle}>Silakan masuk untuk melanjutkan</p>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        <InputField
          icon={FaEnvelope}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={null}
        />
        <InputField
          icon={FaLock}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={null}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          onMouseEnter={(e) => !loading && (e.target.style.background = styles.buttonHover.background || styles.buttonHover)}
          onMouseLeave={(e) => !loading && (e.target.style.background = styles.button.background)}
        >
          {loading && <FaSpinner style={{ animation: "spin 1s linear infinite" }} />}
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <p style={styles.linkText}>
          Belum punya akun?{" "}
          <span
            onClick={() => navigate("/register")}
            style={styles.linkAction}
          >
            Daftar
          </span>
        </p>
      </form>
    </div>
  );
}