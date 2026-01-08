import { BrowserRouter, Routes, Route } from "react-router-dom";
import LaporanList from "./pages/LaporanList";
import LaporanTambah from "./pages/LaporanTambah";
import Navbar from "./components/Navbar";
import LaporanEdit from "./pages/LaporanEdit";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LaporanList />} />
        <Route path="/tambah" element={<LaporanTambah />} />
        <Route path="/edit/:id" element={<LaporanEdit />} />
      </Routes>
    </BrowserRouter>
  );
}
