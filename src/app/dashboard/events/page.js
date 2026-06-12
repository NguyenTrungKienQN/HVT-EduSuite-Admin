"use client";

import { useState, useEffect } from "react";
import { listEvents, deleteEvent, createEvent, updateEvent } from "@/lib/api";

export default function EventsDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    ten: "",
    lop: "",
    bat_dau: "",
    ket_thuc: "",
    muon_sau_phut: 15
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await listEvents();
      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Lỗi tải danh sách sự kiện trường.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingEvent(null);
    const now = new Date();
    const todayLocal = now.toISOString().substring(0, 11) + "08:00";
    const todayEnd = now.toISOString().substring(0, 11) + "11:00";
    setFormData({ ten: "", lop: "", bat_dau: todayLocal, ket_thuc: todayEnd, muon_sau_phut: 15 });
    setModalOpen(true);
  };

  const openEditModal = (ev) => {
    setEditingEvent(ev);
    const startLocal = ev.bat_dau.substring(0, 16).replace(' ', 'T');
    const endLocal = ev.ket_thuc.substring(0, 16).replace(' ', 'T');
    setFormData({
      ten: ev.ten,
      lop: ev.lop,
      bat_dau: startLocal,
      ket_thuc: endLocal,
      muon_sau_phut: ev.muon_sau_phut
    });
    setModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        muon_sau_phut: parseInt(formData.muon_sau_phut, 10)
      };
      
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
      } else {
        await createEvent(payload);
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert("Lỗi lưu sự kiện: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return;
    try {
      await deleteEvent(id);
      fetchEvents();
    } catch (err) {
      alert("Lỗi xóa sự kiện: " + err.message);
    }
  };

  return (
    <>
      <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--table-border)]">
          <h3 className="text-lg font-semibold">Sự Kiện Trường Học (Meeting, Hoạt Động Ngoại Khóa)</h3>
          <button onClick={openAddModal} className="btn btn-primary px-4 py-2.5 text-sm">
            Tạo Sự Kiện Mới
          </button>
        </div>

        {error ? (
          <div className="text-red-500 py-6">{error}</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-[0.95rem] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Tên Sự Kiện</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Lớp Tham Gia</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Bắt Đầu</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Kết Thúc</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Tính Đi Muộn Sau</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center p-6 text-[var(--text-muted)]">Đang tải danh sách sự kiện...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-6 text-[var(--text-muted)]">Chưa có sự kiện đặc biệt nào được lên lịch.</td></tr>
                ) : (
                  events.map(ev => {
                    const startStr = ev.bat_dau.substring(0, 16);
                    const endStr = ev.ket_thuc.substring(0, 16);
                    return (
                      <tr key={ev.id} className="hover:bg-[var(--table-hover)] transition-colors border-b border-[var(--table-border)]">
                        <td className="p-4 font-semibold">{ev.ten}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-[var(--card-border)]">{ev.lop}</span>
                        </td>
                        <td className="p-4">{startStr}</td>
                        <td className="p-4">{endStr}</td>
                        <td className="p-4">Đi muộn {ev.muon_sau_phut} phút</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(ev)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-blue-600 transition-colors" title="Sửa sự kiện">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button onClick={() => handleDelete(ev.id)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Xóa sự kiện">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-[580px] bg-[var(--modal-bg)] border border-[var(--card-border)] p-8 rounded-3xl shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <h2 className="text-xl font-semibold mb-6">{editingEvent ? "Sửa Thông Tin Sự Kiện" : "Lên Lịch Sự Kiện Mới"}</h2>
            <form onSubmit={handleSaveEvent} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Tên sự kiện</label>
                  <input type="text" required value={formData.ten} onChange={(e) => setFormData({...formData, ten: e.target.value})} className="input-control rounded-xl p-3" placeholder="Họp phụ huynh" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Mã lớp tham gia</label>
                  <input type="text" required value={formData.lop} onChange={(e) => setFormData({...formData, lop: e.target.value})} className="input-control rounded-xl p-3" placeholder="10A1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Thời gian Bắt Đầu</label>
                  <input type="datetime-local" required value={formData.bat_dau} onChange={(e) => setFormData({...formData, bat_dau: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Thời gian Kết Thúc</label>
                  <input type="datetime-local" required value={formData.ket_thuc} onChange={(e) => setFormData({...formData, ket_thuc: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Bị tính đi muộn sau (Phút)</label>
                <input type="number" min="0" required value={formData.muon_sau_phut} onChange={(e) => setFormData({...formData, muon_sau_phut: e.target.value})} className="input-control rounded-xl p-3" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="btn px-5 py-2.5">Hủy</button>
                <button type="submit" className="btn btn-primary px-5 py-2.5">Lưu Sự Kiện</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
