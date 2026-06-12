"use client";

import { useState, useEffect } from "react";
import { listStudents, deleteStudent, createStudent, updateStudent, importStudents, upgradeSchoolYear, downgradeStudent, transferStudent } from "@/lib/api";

export default function StudentsDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    ten: "",
    lop: "",
    uid_the: "",
    gioi_tinh: "Nam",
    ngay_sinh: "2010-01-01",
    anh_the: ""
  });

  useEffect(() => {
    fetchStudents();
  }, [search, filterClass]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await listStudents(1, 100, search, filterClass);
      setStudents(data.students || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleFilterClassChange = (e) => setFilterClass(e.target.value);

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await importStudents(file);
      let alertMsg = res.message;
      if (res.errors && res.errors.length > 0) {
        alertMsg += "\n\nMột số lỗi xảy ra:\n" + res.errors.slice(0, 10).join("\n");
        if (res.errors.length > 10) alertMsg += `\n... và ${res.errors.length - 10} lỗi khác.`;
      }
      alert(alertMsg);
      fetchStudents();
    } catch (err) {
      alert("Lỗi nhập Excel: " + err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleUpgradeSchoolYear = async () => {
    if (!confirm("Bạn có chắc chắn muốn CHUYỂN CẤP TOÀN TRƯỜNG?\n\n- Học sinh khối 12 hiện tại sẽ tốt nghiệp (chuyển sang mục Ra trường).\n- Học sinh khối 11 sẽ lên khối 12.\n- Học sinh khối 10 sẽ lên khối 11.\n\nĐây là hành động quan trọng!")) return;
    setLoading(true);
    try {
      const res = await upgradeSchoolYear();
      alert(res.message || "Chuyển cấp toàn trường thành công.");
      fetchStudents();
    } catch (err) {
      alert("Lỗi chuyển cấp: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async (hs) => {
    if (!confirm(`Bạn có chắc muốn hạ cấp học sinh ${hs.ten} từ lớp ${hs.lop} xuống khối thấp hơn?`)) return;
    try {
      const res = await downgradeStudent(hs.id);
      alert(res.message || "Hạ cấp thành công.");
      fetchStudents();
    } catch (err) {
      alert("Lỗi hạ cấp: " + err.message);
    }
  };

  const handleTransfer = async (hs) => {
    const newLop = prompt(`Nhập tên lớp mới cho học sinh ${hs.ten} (Lớp hiện tại: ${hs.lop}):`, hs.lop);
    if (!newLop || newLop.trim().toUpperCase() === hs.lop.toUpperCase()) return;
    try {
      const res = await transferStudent(hs.id, { lop_moi: newLop });
      alert(res.message || "Chuyển lớp thành công.");
      fetchStudents();
    } catch (err) {
      alert("Lỗi chuyển lớp: " + err.message);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ ten: "", lop: "", uid_the: "", gioi_tinh: "Nam", ngay_sinh: "2010-01-01", anh_the: "" });
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      ten: student.ten,
      lop: student.lop,
      uid_the: student.uid_the,
      gioi_tinh: student.gioi_tinh,
      ngay_sinh: student.ngay_sinh,
      anh_the: student.anh_the || ""
    });
    setModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
      } else {
        await createStudent(formData);
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert("Lỗi khi lưu học sinh: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa học sinh này không? Mọi dữ liệu điểm danh sẽ bị mất.")) return;
    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  return (
    <>
      <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            className="input-control rounded-2xl px-4 py-2.5 min-w-[200px] flex-1 max-w-sm"
            placeholder="Tìm kiếm tên, lớp, mã thẻ..."
            value={search}
            onChange={handleSearchChange}
          />
          <select
            className="input-control rounded-2xl px-4 py-2.5 min-w-[150px]"
            value={filterClass}
            onChange={handleFilterClassChange}
          >
            <option value="">Tất cả các lớp</option>
            {/* Typically we would fetch the class list here. For now it's static or we can just let users type */}
            <option value="10A1">10A1</option>
            <option value="11A1">11A1</option>
            <option value="12A1">12A1</option>
          </select>
          
          <div className="ml-auto flex items-center gap-3">
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              id="excel-file-input"
              onChange={handleExcelImport}
            />
            <button
              onClick={() => document.getElementById("excel-file-input").click()}
              disabled={importing || loading}
              className="btn px-4 py-2.5 text-white bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-50"
            >
              {importing ? "Đang Nhập..." : "Nhập Từ Excel"}
            </button>
            <button
              onClick={handleUpgradeSchoolYear}
              disabled={loading}
              className="btn px-4 py-2.5 text-white bg-gradient-to-br from-amber-500 to-amber-700 border-amber-600 hover:from-amber-600 hover:to-amber-800 disabled:opacity-50"
            >
              Chuyển Cấp Toàn Trường
            </button>
            <button onClick={openAddModal} className="btn btn-primary px-4 py-2.5">
              Thêm Học Sinh
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-red-500 text-center py-6">{error}</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-[0.95rem] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Họ và Tên</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Lớp</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Mã Thẻ RFID</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Giới Tính</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Ngày Sinh</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center p-6 text-[var(--text-muted)]">Đang tải danh sách học sinh...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-6 text-[var(--text-muted)]">Không tìm thấy học sinh nào phù hợp.</td></tr>
                ) : (
                  students.map(hs => (
                    <tr key={hs.id} className="hover:bg-[var(--table-hover)] transition-colors border-b border-[var(--table-border)]">
                      <td className="p-4 font-semibold">{hs.ten}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-[var(--card-border)]">{hs.lop}</span>
                      </td>
                      <td className="p-4"><code className="text-blue-600 dark:text-blue-400 font-medium">{hs.uid_the}</code></td>
                      <td className="p-4">{hs.gioi_tinh}</td>
                      <td className="p-4">{hs.ngay_sinh}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(hs)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-blue-600 transition-colors" title="Sửa thông tin">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button onClick={() => handleTransfer(hs)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors" title="Chuyển lớp">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </button>
                          <button onClick={() => handleDowngrade(hs)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors" title="Hạ cấp">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                          </button>
                          <button onClick={() => handleDelete(hs.id)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Xóa học sinh">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-[580px] bg-[var(--modal-bg)] border border-[var(--card-border)] p-8 rounded-3xl shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--table-border)]">
              <h2 className="text-xl font-semibold">{editingStudent ? "Sửa Thông Tin Học Sinh" : "Thêm Học Sinh Mới"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleSaveStudent} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Họ và Tên</label>
                <input type="text" required value={formData.ten} onChange={(e) => setFormData({...formData, ten: e.target.value})} className="input-control rounded-xl p-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Lớp</label>
                  <input type="text" required value={formData.lop} onChange={(e) => setFormData({...formData, lop: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Mã Thẻ (UID)</label>
                  <input type="text" required value={formData.uid_the} onChange={(e) => setFormData({...formData, uid_the: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Giới Tính</label>
                  <select value={formData.gioi_tinh} onChange={(e) => setFormData({...formData, gioi_tinh: e.target.value})} className="input-control rounded-xl p-3">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Ngày Sinh</label>
                  <input type="date" required value={formData.ngay_sinh} onChange={(e) => setFormData({...formData, ngay_sinh: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--table-border)]">
                <button type="button" onClick={() => setModalOpen(false)} className="btn px-5 py-2.5">Hủy</button>
                <button type="submit" className="btn btn-primary px-5 py-2.5">Lưu Thông Tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
