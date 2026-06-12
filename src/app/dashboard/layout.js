"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { logout, getActiveDbInfo } from "@/lib/api";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");
  const [dbStatus, setDbStatus] = useState("checking");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    const savedTheme = localStorage.getItem("admin-theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    checkDbStatus();
    const interval = setInterval(checkDbStatus, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const checkDbStatus = async () => {
    try {
      const info = await getActiveDbInfo();
      if (info && info.host) {
        setDbStatus("online");
      } else {
        setDbStatus("offline");
      }
    } catch (e) {
      setDbStatus("offline");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("admin-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("admin_logged_in");
      localStorage.removeItem("admin_session");
      router.push("/");
    }
  };

  const navItems = [
    { name: "Quản lý Học Sinh", path: "/dashboard", icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path> },
    { name: "Học Sinh Ra Trường", path: "/dashboard/graduated", icon: <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path> },
    { name: "Quản lý Tài Khoản", path: "/dashboard/accounts", icon: <path d="M7 11V7a5 5 0 0 1 10 0v4"></path> },
    { name: "Lịch Học Tuần", path: "/dashboard/schedules", icon: <line x1="16" y1="2" x2="16" y2="6"></line> },
    { name: "Nghỉ Học / Tạm Dừng", path: "/dashboard/holidays", icon: <rect x="6" y="4" width="4" height="16"></rect> },
    { name: "Sự Kiện Trường", path: "/dashboard/events", icon: <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path> },
    { name: "Kết Nối CSDL", path: "/dashboard/settings", icon: <circle cx="12" cy="12" r="3"></circle> },
  ];

  const currentPageName = navItems.find((item) => item.path === pathname)?.name || "Dashboard";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-[260px] bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] backdrop-blur-[20px] shadow-lg flex flex-col z-30 transition-all">
        <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-center gap-3 h-[80px]">
          <img src="/logo.png" alt="Logo" className="h-full max-h-[50px] w-auto object-contain" />
        </div>
        <ul className="flex flex-col py-4 gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-[0.95rem] ${
                    isActive 
                      ? "bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] border-l-[3px] border-[var(--nav-active-border)] pl-[calc(1rem-3px)]" 
                      : "text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-main)]"
                  }`}
                >
                  <svg 
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`opacity-70 ${isActive ? "opacity-100 stroke-[var(--nav-active-text)]" : ""}`}
                  >
                    {item.icon}
                    {item.name === "Quản lý Học Sinh" && <circle cx="9" cy="7" r="4"></circle>}
                    {item.name === "Quản lý Tài Khoản" && <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>}
                    {item.name === "Lịch Học Tuần" && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></>}
                    {item.name === "Học Sinh Ra Trường" && <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>}
                    {item.name === "Sự Kiện Trường" && <line x1="4" y1="22" x2="4" y2="15"></line>}
                    {item.name === "Nghỉ Học / Tạm Dừng" && <rect x="14" y="4" width="4" height="16"></rect>}
                    {item.name === "Kết Nối CSDL" && <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>}
                  </svg>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 flex justify-between items-center py-4 px-10 bg-[var(--header-bg)] border-b border-[var(--card-border)] backdrop-blur-[40px] transition-colors">
          <h1 className="text-2xl font-semibold">{currentPageName}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-[var(--card-border)] px-4 py-1.5 rounded-full text-[0.82rem] font-medium">
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${
                dbStatus === 'online' ? 'bg-emerald-500 text-emerald-500' :
                dbStatus === 'offline' ? 'bg-red-500 text-red-500' :
                'bg-amber-500 text-amber-500 animate-pulse'
              }`} />
              <span>
                {dbStatus === 'online' ? 'Đã kết nối CSDL' :
                 dbStatus === 'offline' ? 'Mất kết nối' :
                 'Đang kiểm tra...'}
              </span>
            </div>
            
            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-bg)] transition-colors">
              {theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>
            
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-10 flex flex-col gap-8 animate-[fadeIn_0.25s_ease-out]">
          {children}
        </main>
      </div>
    </div>
  );
}
