"use client";

import { useState, useEffect } from "react";
import { listGraduated, restoreGraduated } from "@/lib/api";

export default function GraduatedDashboard() {
  const [graduated, setGraduated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGraduated();
  }, []);

  const fetchGraduated = async () => {
    setLoading(true);
    try {
      const data = await listGraduated();
      setGraduated(data.graduated || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải danh sách học sinh ra trường.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!confirm("Khôi phục học sinh tốt nghiệp này trở lại trạng thái đang học và chuyển về lớp cũ?")) return;
    try {
      await restoreGraduated(id);
      fetchGraduated();
    } catch (err) {
      alert("Lỗi khôi phục: " + err.message);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--table-border)]">
        <h3 className="text-lg font-semibold">Học Sinh Đã Ra Trường (Lưu giữ thông tin trong 30 ngày)</h3>
      </div>

      {error ? (
        <div className="text-red-500 py-6">{error}</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[0.95rem] border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Họ và Tên</th>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Lớp Cũ</th>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Mã Thẻ RFID</th>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Giới Tính</th>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Ngày Sinh</th>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Ngày Tốt Nghiệp</th>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-6 text-[var(--text-muted)]">Đang tải danh sách...</td></tr>
              ) : graduated.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-12 text-[var(--text-muted)] flex flex-col gap-2 items-center">
                    Không có dữ liệu học sinh đã ra trường trong 30 ngày qua.
                  </td>
                </tr>
              ) : (
                graduated.map(hs => (
                  <tr key={hs.id} className="hover:bg-[var(--table-hover)] transition-colors border-b border-[var(--table-border)]">
                    <td className="p-4 font-semibold">{hs.ten}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-[var(--card-border)]">{hs.lop_cu || hs.lop}</span>
                    </td>
                    <td className="p-4"><code className="text-blue-600 dark:text-blue-400 font-medium">{hs.uid_the}</code></td>
                    <td className="p-4">{hs.gioi_tinh}</td>
                    <td className="p-4">{hs.ngay_sinh}</td>
                    <td className="p-4">{hs.ngay_ra_truong}</td>
                    <td className="p-4">
                      <button onClick={() => handleRestore(hs.id)} className="btn btn-primary px-3 py-1.5 text-sm">
                        Khôi phục lại lớp học
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
