import { useEffect, useState } from "react";
import { getLaporan } from "../api/api";

export default function LaporanList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getLaporan();
    setData(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Daftar Laporan</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Alamat</th>
            <th>Tanggal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((l) => (
            <tr key={l.id}>
              <td>{l.nama}</td>
              <td>{l.alamat}</td>
              <td>{l.tanggal}</td>
              <td>{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
