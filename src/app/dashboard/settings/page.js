"use client";

import { useState, useEffect } from "react";
import { 
  getActiveDbInfo, 
  listServers, 
  createServer, 
  updateServer, 
  deleteServer, 
  testServerConnection, 
  testConfigConnection, 
  activateServer 
} from "@/lib/api";

export default function SettingsDashboard() {
  const [dbInfo, setDbInfo] = useState(null);
  const [servers, setServers] = useState([]);
  const [loadingServers, setLoadingServers] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [formData, setFormData] = useState({
    name: "Server",
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: ""
  });

  useEffect(() => {
    fetchDbInfo();
    fetchServers();
  }, []);

  const fetchDbInfo = async () => {
    try {
      const data = await getActiveDbInfo();
      setDbInfo(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServers = async () => {
    setLoadingServers(true);
    try {
      const data = await listServers();
      setServers(data.servers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingServers(false);
    }
  };

  const openAddModal = () => {
    setEditingServer(null);
    setFormData({ name: "Server", host: "localhost", port: 3306, user: "root", password: "", database: "" });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingServer(s);
    setFormData({
      name: s.name,
      host: s.host,
      port: s.port,
      user: s.user,
      password: "", // do not populate password
      database: s.database
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, port: parseInt(formData.port, 10) };
      if (editingServer) {
        await updateServer(editingServer.id, payload);
      } else {
        await createServer(payload);
      }
      setModalOpen(false);
      fetchServers();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa cấu hình này?")) return;
    try {
      await deleteServer(id);
      fetchServers();
    } catch (err) {
      alert("Lỗi xóa: " + err.message);
    }
  };

  const handleTestConnection = async (id) => {
    try {
      const data = await testServerConnection(id);
      if (data.status === 'ok') {
        alert(`Kết nối thành công! Ping: ${data.latency_ms}ms, MySQL: ${data.version}`);
      } else {
        alert(`Lỗi kết nối: ${data.message}`);
      }
    } catch (err) {
      alert("Kiểm tra kết nối thất bại.");
    }
  };

  const handleTestModalConnection = async () => {
    try {
      const payload = { ...formData, port: parseInt(formData.port, 10) };
      const data = await testConfigConnection(payload);
      if (data.status === 'ok') {
        alert(`Kết nối thành công! Ping: ${data.latency_ms}ms, MySQL: ${data.version}`);
      } else {
        alert(`Lỗi kết nối: ${data.message}`);
      }
    } catch (err) {
      alert("Kiểm tra kết nối thất bại.");
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateServer(id);
      alert("Đã chuyển đổi cơ sở dữ liệu hoạt động thành công!");
      fetchDbInfo();
      fetchServers();
      // Inform the layout to refresh its status
      window.dispatchEvent(new Event('focus')); // Trigger re-focus handlers or just let interval catch it
    } catch (err) {
      alert("Không thể kích hoạt kết nối: " + err.message);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Servers List */}
        <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--card-border)]">
            <h3 className="text-lg font-semibold">Danh sách Máy Chủ</h3>
            <button onClick={openAddModal} className="btn btn-primary px-4 py-2">
              Thêm Kết Nối
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {loadingServers ? (
              <div className="text-[var(--text-muted)] text-center py-4">Đang tải danh sách kết nối...</div>
            ) : servers.length === 0 ? (
              <div className="text-[var(--text-muted)] text-center py-4">Chưa có kết nối nào.</div>
            ) : (
              servers.map(s => {
                const isActive = s.is_active;
                return (
                  <div key={s.id} className={`p-5 rounded-2xl border-[1.5px] bg-white/5 transition-all flex flex-col gap-3 ${isActive ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[var(--card-border)] hover:border-white/20'}`}>
                    <div className="flex justify-between items-center">
                      <div className="font-semibold flex items-center gap-3">
                        {s.name}
                        {isActive && <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-500">Hoạt Động</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleTestConnection(s.id)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-blue-500 bg-white/5" title="Kiểm tra kết nối">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </button>
                        <button onClick={() => openEditModal(s)} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-blue-500 bg-white/5" title="Sửa cấu hình">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(s.id)} disabled={isActive} className="btn p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed" title="Xóa cấu hình">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-[0.85rem] text-[var(--text-muted)] flex flex-wrap gap-x-6 gap-y-1">
                      <span>Máy chủ: <strong className="text-[var(--text-main)]">{s.host}:{s.port}</strong></span>
                      <span>CSDL: <strong className="text-[var(--text-main)]">{s.database}</strong></span>
                      <span>Tài khoản: <strong className="text-[var(--text-main)]">{s.user}</strong></span>
                    </div>
                    {!isActive && (
                      <div className="border-t border-[var(--card-border)] pt-3 mt-1">
                        <button onClick={() => handleActivate(s.id)} className="btn btn-primary px-3 py-1.5 text-sm">
                          Kích hoạt kết nối này
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Diagnostics Info */}
        <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
          <div className="pb-4 border-b border-[var(--card-border)]">
            <h3 className="text-lg font-semibold">Tình Trạng Kết Nối Hiện Tại</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-[var(--card-border)] rounded-2xl p-5 flex flex-col gap-1">
              <span className={`text-2xl font-bold ${dbInfo?.latency_ms ? 'text-emerald-500' : 'text-red-500'}`}>
                {dbInfo?.latency_ms ? `${dbInfo.latency_ms} ms` : 'Ngoại tuyến'}
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Độ Trễ Ping</span>
            </div>
            <div className="bg-white/5 border border-[var(--card-border)] rounded-2xl p-5 flex flex-col gap-1">
              <span className="text-2xl font-bold text-blue-500">{dbInfo?.version || 'Không rõ'}</span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Phiên Bản MySQL</span>
            </div>
            <div className="bg-white/5 border border-[var(--card-border)] rounded-2xl p-5 flex flex-col gap-1">
              <span className="text-2xl font-bold text-blue-500">{dbInfo?.database || 'Trống'}</span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Cơ Sở Dữ Liệu</span>
            </div>
            <div className="bg-white/5 border border-[var(--card-border)] rounded-2xl p-5 flex flex-col gap-1">
              <span className="text-2xl font-bold text-blue-500">{dbInfo?.total_tables || '0'}</span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Tổng Số Bảng</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-3">Dữ Liệu Bảng</h4>
            <div className="overflow-x-auto border border-[var(--card-border)] rounded-xl bg-white/5">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)] bg-black/20">
                    <th className="p-3 text-[var(--text-muted)] font-medium">Tên Bảng</th>
                    <th className="p-3 text-[var(--text-muted)] font-medium">Số Dòng</th>
                    <th className="p-3 text-[var(--text-muted)] font-medium">Kích Thước</th>
                  </tr>
                </thead>
                <tbody>
                  {!dbInfo?.tables?.length ? (
                    <tr><td colSpan="3" className="p-4 text-center text-[var(--text-muted)]">Không có dữ liệu bảng.</td></tr>
                  ) : (
                    dbInfo.tables.map((t, idx) => (
                      <tr key={idx} className="border-b border-[var(--card-border)] last:border-0 hover:bg-white/5">
                        <td className="p-3 font-mono text-indigo-400 font-medium">{t.table_name}</td>
                        <td className="p-3">{Number(t.row_count).toLocaleString()}</td>
                        <td className="p-3">{Number(t.size_kb).toLocaleString()} KB</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Setup */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-[580px] bg-[var(--modal-bg)] border border-[var(--card-border)] p-8 rounded-3xl shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <h2 className="text-xl font-semibold mb-6">{editingServer ? "Sửa Cấu Hình CSDL" : "Thêm Kết Nối MySQL"}</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Tên Gợi Nhớ (Tùy chọn)</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-control rounded-xl p-3" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Host / Địa chỉ</label>
                  <input type="text" required value={formData.host} onChange={(e) => setFormData({...formData, host: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
                <div className="col-span-1 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Cổng</label>
                  <input type="number" required value={formData.port} onChange={(e) => setFormData({...formData, port: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Tên Cơ Sở Dữ Liệu</label>
                <input type="text" required value={formData.database} onChange={(e) => setFormData({...formData, database: e.target.value})} className="input-control rounded-xl p-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Tài Khoản (User)</label>
                  <input type="text" required value={formData.user} onChange={(e) => setFormData({...formData, user: e.target.value})} className="input-control rounded-xl p-3" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Mật Khẩu</label>
                  <input type="password" required={!editingServer} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editingServer ? "••••••••" : ""} className="input-control rounded-xl p-3" />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" onClick={handleTestModalConnection} className="btn bg-white/5 border border-[var(--card-border)] px-4 py-2.5">
                  Kiểm tra thử
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn px-5 py-2.5">Hủy</button>
                  <button type="submit" className="btn btn-primary px-5 py-2.5">Lưu Cấu Hình</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
