import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import LaporanList from "./pages/LaporanList";
import LaporanTambah from "./pages/LaporanTambah";
import LaporanEdit from "./pages/LaporanEdit";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

export default function App() {
  const [isLogin, setIsLogin] = useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter>
      {isLogin && <Navbar setIsLogin={setIsLogin} />}

      <Routes>
        {/* GUEST */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login setIsLogin={setIsLogin} />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan"
          element={
            <ProtectedRoute>
              <LaporanList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tambah"
          element={
            <ProtectedRoute>
              <LaporanTambah />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <LaporanEdit />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}