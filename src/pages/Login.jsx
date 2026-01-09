import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setIsLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login gagal");
        return;
      }

      // simpan login
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      // 🔥 trigger rerender App.jsx
      setIsLogin(true);

      // redirect ke home
      navigate("/", { replace: true });
    } catch (error) {
      alert("Server error, coba lagi");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <button type="submit">Login</button>

      <p>
        Belum punya akun? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
