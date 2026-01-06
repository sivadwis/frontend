import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: 10, background: "#eee" }}>
      <Link to="/" style={{ marginRight: 10 }}>Home</Link>
      <Link to="/tambah">Tambah Laporan</Link>
    </nav>
  );
}
