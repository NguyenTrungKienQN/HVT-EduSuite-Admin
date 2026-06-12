"use client";

import { useState, useEffect } from "react";
import { listPauses, createPause, deletePause } from "@/lib/api";

export default function HolidaysDashboard() {
  const [pauses, setPauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tu_ngay: "",
    den_ngay: "",
    ly_do: ""
  });

  useEffect(() => {
    fetchPauses();
  }, []);

  const fetchPauses = async () => {
    setLoading(true);
    try {
      const data = await listPauses();
      setPauses(data.pauses || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi truy vấn lịch nghỉ từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      tu_ngay: new Date().toISOString().substring(0, 10),
      den_ngay: "",
      ly_do: ""
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.den_ngay) delete payload.den_ngay;
      
      await createPause(payload);
      setModalOpen(false);
      fetchPauses();
    } catch (err) {
      alert("Không thể đặt lịch tạm dừng: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xóa lịch nghỉ này?")) return;
    try {
      await deletePause(id);
      fetchPauses();
    } catch (err) {
      alert("Lỗi khi xóa lịch nghỉ: " + err.message);
    }
  };

  return (
    <>
      <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--table-border)]">
          <h3 className="text-lg font-semibold">Tạm Dừng Hệ Thống Điểm Danh Toàn Trường</h3>
          <button onClick={openAddModal} className="btn btn-primary px-4 py-2.5 text-sm">
            Thêm Ngày Nghỉ Toàn Trường
          </button>
        </div>

        {error ? (
          <div className="text-red-500 py-6">{error}</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-[0.95rem] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Từ Ngày</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Đến Ngày</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Lý Do</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center p-6 text-[var(--text-muted)]">Đang tải lịch nghỉ...</td></tr>
                ) : pauses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-12 text-[var(--text-muted)]">
                      Không có lịch nghỉ học tạm dừng nào. Hệ thống quét điểm danh bình thường.
                    </td>
                  </tr>
                ) : (
                  pauses.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--table-hover)] transition-colors border-b border-[var(--table-border)]">
                      <td className="p-4 font-semibold">{p.tu_ngay}</td>
                      <td className="p-4">
                        {p.den_ngay ? (
                          <span className="font-semibold">{p.den_ngay}</span>
                        ) : (
                          <span className="text-amber-500 font-medium">Vô thời hạn</span>
                        )}
                      </td>
                      <td className="p-4">{p.ly_do || "Không ghi lý do"}</td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(p.id)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Xóa lịch nghỉ">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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

      {/* Add Holiday Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-[500px] bg-[var(--modal-bg)] border border-[var(--card-border)] p-8 rounded-3xl shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <h2 className="text-xl font-semibold mb-6">Thêm Ngày Nghỉ/Tạm Dừng Điểm Danh</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Nghỉ từ ngày</label>
                  <input type="date" required value={formData.tu_ngay} onChange={(e) => setFormData({...formData, tu_ngay: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Đến ngày (Có thể bỏ trống)</label>
                  <input type="date" value={formData.den_ngay} onChange={(e) => setFormData({...formData, den_ngay: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Lý do nghỉ (Tùy chọn)</label>
                <input type="text" value={formData.ly_do} onChange={(e) => setFormData({...formData, ly_do: e.target.value})} className="input-control rounded-xl p-3" placeholder="VD: Nghỉ lễ Quốc Khánh" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="btn px-5 py-2.5">Hủy</button>
                <button type="submit" className="btn btn-primary px-5 py-2.5">Xác Nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
