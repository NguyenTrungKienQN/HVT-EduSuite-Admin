"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync theme
    const saved = localStorage.getItem("admin-theme") || "light";
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(username, password);
      if (data.role !== "admin") {
        throw new Error("Tài khoản của bạn không có quyền truy cập trang quản trị này.");
      }
      if (data && data.session_id) {
        localStorage.setItem("admin_session", data.session_id);
      }
      localStorage.setItem("admin_logged_in", "true");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Lỗi đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div 
        className="absolute w-[300px] h-[300px] rounded-full blur-[100px] z-0 top-[20%] left-[15%] bg-[#2563eb] opacity-[0.08] dark:bg-[#4f46e5] dark:opacity-[0.12]"
      />
      <div 
        className="absolute w-[300px] h-[300px] rounded-full blur-[100px] z-0 bottom-[20%] right-[15%] bg-[#10b981] opacity-[0.06] dark:opacity-[0.08]"
      />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-[420px] p-10 glass-card rounded-3xl animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <img src="/logo.png" alt="Logo" className="h-[50px] w-auto object-contain" />
          </div>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
            Đăng nhập tài khoản quản trị hệ thống
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-6 p-3 rounded-2xl text-sm bg-red-50 border border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tên đăng nhập</label>
            <input
              type="text"
              required
              autoComplete="username"
              className="input-control w-full p-3.5 rounded-2xl text-sm"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="input-control w-full p-3.5 rounded-2xl text-sm"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.3)] dark:shadow-[0_4px_12px_rgba(79,70,229,0.3)] bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-indigo-600 dark:to-blue-500 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-[18px] h-[18px] rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : null}
            <span>{loading ? "Đang xử lý..." : "Đăng Nhập"}</span>
          </button>
        </form>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 dark:text-gray-400 text-sm z-10">
        Admin Panel
      </div>
      
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
