"use client";

import { useState, useEffect } from "react";
import { listClasses, getSchedule, updateSchedule } from "@/lib/api";

export default function SchedulesDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [effectiveDate, setEffectiveDate] = useState("");

  const daysOfWeek = {
    2: "Thứ Hai",
    3: "Thứ Ba",
    4: "Thứ Tư",
    5: "Thứ Năm",
    6: "Thứ Sáu",
    7: "Thứ Bảy"
  };

  useEffect(() => {
    // Set default effective date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEffectiveDate(tomorrow.toISOString().substring(0, 10));

    fetchClassesList();
  }, []);

  const fetchClassesList = async () => {
    try {
      const data = await listClasses();
      const classList = data.classes || [];
      setClasses(classList);
      if (classList.length > 0) {
        setSelectedClass(classList[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi tải danh sách lớp");
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchSchedule();
    }
  }, [selectedClass]);

  const fetchSchedule = async () => {
    setLoading(true);
    setSchedule(null);
    try {
      const data = await getSchedule(selectedClass);
      setSchedule(data.week);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Lỗi tải lịch học từ database.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = (thu, buoi) => {
    if (!schedule) return;
    const newSchedule = { ...schedule };
    newSchedule[thu][buoi] = newSchedule[thu][buoi] === 1 ? 0 : 1;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    if (!selectedClass || !effectiveDate) {
      alert("Vui lòng chọn lớp học và ngày áp dụng lịch mới.");
      return;
    }
    try {
      await updateSchedule(selectedClass, {
        hieu_luc_tu: effectiveDate,
        week: schedule
      });
      alert("Cập nhật lịch học thành công!");
      fetchSchedule();
    } catch (err) {
      alert("Lỗi lưu lịch: " + err.message);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-center pb-4 border-b border-[var(--table-border)] gap-4">
        <h3 className="text-lg font-semibold">Cài Đặt Lịch Học Mặc Định Theo Tuần</h3>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--text-muted)] font-medium">Lớp:</span>
            <select 
              className="input-control rounded-xl px-3 py-2 min-w-[120px]"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--text-muted)] font-medium">Lịch học này áp dụng từ ngày:</span>
            <input 
              type="date" 
              className="input-control rounded-xl px-3 py-2"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end h-full pt-6">
            <button onClick={handleSave} className="btn btn-primary px-5 py-2" disabled={!schedule}>
              Lưu Lịch Học
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
        <p className="text-[0.95rem] text-[var(--text-muted)] mb-6">
          <strong className="text-[var(--text-main)]">Hướng dẫn:</strong> Bấm vào các ô màu bên dưới để chuyển đổi trạng thái giữa <span className="text-emerald-500 font-semibold px-1">HỌC</span> và <span className="text-red-500 font-semibold px-1">NGHỈ</span>.
        </p>

        {error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : loading || !schedule ? (
          <div className="text-center py-10 text-[var(--text-muted)]">Đang tải lịch học của lớp...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.keys(daysOfWeek).map((thu) => {
              const statusSang = schedule[thu].sang === 1;
              const statusChieu = schedule[thu].chieu === 1;
              return (
                <div key={thu} className="flex flex-col gap-3 p-4 bg-black/5 dark:bg-white/5 border border-[var(--card-border)] rounded-xl">
                  <div className="text-center font-semibold pb-2 border-b border-[var(--card-border)]">{daysOfWeek[thu]}</div>
                  <button 
                    onClick={() => toggleBlock(thu, 'sang')}
                    className={`p-3 rounded-xl font-bold text-center transition-all ${statusSang ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--card-border)] opacity-60'}`}
                  >
                    Sáng: {statusSang ? 'HỌC' : 'NGHỈ'}
                  </button>
                  <button 
                    onClick={() => toggleBlock(thu, 'chieu')}
                    className={`p-3 rounded-xl font-bold text-center transition-all ${statusChieu ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--card-border)] opacity-60'}`}
                  >
                    Chiều: {statusChieu ? 'HỌC' : 'NGHỈ'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
