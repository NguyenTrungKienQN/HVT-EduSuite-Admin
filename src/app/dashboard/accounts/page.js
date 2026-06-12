"use client";

import { useState, useEffect } from "react";
import { listUsers, deleteUser, createUser, updateUser, listGvcn, saveGvcn, deleteGvcn } from "@/lib/api";

export default function AccountsDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    accountname: "",
    role: "teacher",
    lop_quyen: "",
    email: ""
  });

  // GVCN State
  const [gvcns, setGvcns] = useState([]);
  const [loadingGvcn, setLoadingGvcn] = useState(true);
  const [gvcnModalOpen, setGvcnModalOpen] = useState(false);
  const [editingGvcn, setEditingGvcn] = useState(null);
  const [gvcnFormData, setGvcnFormData] = useState({
    lop: "",
    ten: ""
  });

  useEffect(() => {
    fetchUsers();
    fetchGvcns();
  }, []);

  const fetchGvcns = async () => {
    setLoadingGvcn(true);
    try {
      const data = await listGvcn();
      setGvcns(data.gvcn || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGvcn(false);
    }
  };

  const openAddGvcnModal = () => {
    setEditingGvcn(null);
    setGvcnFormData({ lop: "", ten: "" });
    setGvcnModalOpen(true);
  };

  const openEditGvcnModal = (g) => {
    setEditingGvcn(g);
    setGvcnFormData({ lop: g.lop, ten: g.ten });
    setGvcnModalOpen(true);
  };

  const handleSaveGvcn = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...gvcnFormData };
      await saveGvcn(payload); // Assuming saveGvcn handles both create and update via backend logic (since the backend just takes lop and ten)
      setGvcnModalOpen(false);
      fetchGvcns();
    } catch (err) {
      alert("Lỗi khi lưu GVCN: " + err.message);
    }
  };

  const handleDeleteGvcn = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa GVCN này?")) return;
    try {
      await deleteGvcn(id);
      fetchGvcns();
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ username: "", password: "", accountname: "", role: "teacher", lop_quyen: "", email: "" });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // Don't populate password, only send if changing
      accountname: user.accountname || "",
      role: user.role,
      lop_quyen: user.lop_quyen || "",
      email: user.email || ""
    });
    setModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password; // Don't update password if empty
      }
      
      if (editingUser) {
        await updateUser(editingUser.id, payload);
      } else {
        await createUser(payload);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi lưu tài khoản: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  return (
    <>
      <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--table-border)]">
          <h3 className="text-lg font-semibold">Danh Sách Tài Khoản Hệ Thống</h3>
          <button onClick={openAddModal} className="btn btn-primary px-4 py-2.5 text-sm">
            Tạo Tài Khoản Mới
          </button>
        </div>

        {error ? (
          <div className="text-red-500 py-6">{error}</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-[0.95rem] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Tên Đăng Nhập</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Tên Hiển Thị</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Vai Trò</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Lớp Quản Lý</th>
                  <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center p-6 text-[var(--text-muted)]">Đang tải danh sách...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="text-center p-6 text-[var(--text-muted)]">Chưa có tài khoản nào được tạo.</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-[var(--table-hover)] transition-colors border-b border-[var(--table-border)]">
                      <td className="p-4 font-semibold">{u.username}</td>
                      <td className="p-4">{u.accountname || "—"}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium border ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-teal-500/10 text-teal-500 border-teal-500/20'}`}>
                          {u.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.lop_quyen ? <code className="text-[var(--text-muted)]">{u.lop_quyen}</code> : <span className="text-[var(--text-muted)] text-sm">Tất cả</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(u)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-blue-600 transition-colors" title="Sửa tài khoản">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Xóa tài khoản">
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

      <div className="glass-card rounded-3xl p-8 flex flex-col gap-6 mt-8">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--table-border)]">
          <h3 className="text-lg font-semibold">Danh Sách Giáo Viên Chủ Nhiệm (GVCN)</h3>
          <button onClick={openAddGvcnModal} className="btn btn-primary px-4 py-2.5 text-sm">
            Thêm GVCN
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[0.95rem] border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Lớp</th>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Tên GVCN</th>
                <th className="p-4 border-b border-[var(--table-border)] text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loadingGvcn ? (
                <tr><td colSpan="3" className="text-center p-6 text-[var(--text-muted)]">Đang tải danh sách...</td></tr>
              ) : gvcns.length === 0 ? (
                <tr><td colSpan="3" className="text-center p-6 text-[var(--text-muted)]">Chưa có GVCN nào.</td></tr>
              ) : (
                gvcns.map(g => (
                  <tr key={g.id} className="hover:bg-[var(--table-hover)] transition-colors border-b border-[var(--table-border)]">
                    <td className="p-4 font-semibold">{g.lop}</td>
                    <td className="p-4">{g.ten}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditGvcnModal(g)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-blue-600 transition-colors" title="Sửa GVCN">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteGvcn(g.id)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Xóa GVCN">
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
      </div>

      {/* User Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-[500px] bg-[var(--modal-bg)] border border-[var(--card-border)] p-8 rounded-3xl shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <h2 className="text-xl font-semibold mb-6">{editingUser ? "Sửa Tài Khoản" : "Tạo Tài Khoản Mới"}</h2>
            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Tên đăng nhập</label>
                <input type="text" required disabled={!!editingUser} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="input-control rounded-xl p-3 disabled:opacity-50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Mật khẩu {editingUser && "(Để trống nếu không đổi)"}</label>
                <input type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-control rounded-xl p-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Tên hiển thị</label>
                  <input type="text" value={formData.accountname} onChange={(e) => setFormData({...formData, accountname: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Vai trò</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="input-control rounded-xl p-3">
                    <option value="teacher">Giáo viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              </div>
              {formData.role === "teacher" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Lớp được quản lý (VD: 10A1)</label>
                  <input type="text" required value={formData.lop_quyen} onChange={(e) => setFormData({...formData, lop_quyen: e.target.value})} className="input-control rounded-xl p-3" placeholder="Chỉ xem được lớp này" />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="btn px-5 py-2.5">Hủy</button>
                <button type="submit" className="btn btn-primary px-5 py-2.5">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* GVCN Edit Modal */}
      {gvcnModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setGvcnModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-[400px] bg-[var(--modal-bg)] border border-[var(--card-border)] p-8 rounded-3xl shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <h2 className="text-xl font-semibold mb-6">{editingGvcn ? "Sửa GVCN" : "Thêm GVCN"}</h2>
            <form onSubmit={handleSaveGvcn} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Lớp</label>
                <input type="text" required value={gvcnFormData.lop} onChange={(e) => setGvcnFormData({...gvcnFormData, lop: e.target.value})} className="input-control rounded-xl p-3" placeholder="VD: 10A1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Tên Giáo Viên</label>
                <input type="text" required value={gvcnFormData.ten} onChange={(e) => setGvcnFormData({...gvcnFormData, ten: e.target.value})} className="input-control rounded-xl p-3" placeholder="Nguyễn Văn A" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setGvcnModalOpen(false)} className="btn px-5 py-2.5">Hủy</button>
                <button type="submit" className="btn btn-primary px-5 py-2.5">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
