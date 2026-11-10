"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Grid3X3, Ticket, Receipt, Award, User,
  LogOut, Menu, X, ChevronRight, MessageSquare, Bell, ChevronDown, ChevronLeft, Activity, Users
} from "lucide-react";
import React from "react";
import api from "../lib/api";

interface MahasiswaLayoutProps {
  children: React.ReactNode;
}

export default function MahasiswaLayout({ children }: MahasiswaLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role?: string; foto_mahasiswa?: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPanitia, setIsPanitia] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
      
      // Cek apakah mahasiswa ini adalah panitia aktif
      const checkPanitia = async () => {
        try {
          const res = await api.get('/mahasiswa/panitia-events');
          if (res.data && res.data.length > 0) {
            setIsPanitia(true);
          }
        } catch (err) {
          console.error("Gagal mengecek status panitia:", err);
        }
      };
      
      if (stored) {
        checkPanitia();
      }
    }
  }, []);

  const menuItems = [
    {
      section: "MENU UTAMA", items: [
        { href: "/mahasiswa/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/mahasiswa/katalog", icon: Grid3X3, label: "Katalog Event" },
      ]
    },
    {
      section: "AKTIVITAS", items: [
        { href: "/mahasiswa/tiket", icon: Activity, label: "Aktivitas" },
      ]
    },
    // Tambahkan menu Kepanitiaan jika ia panitia
    ...(isPanitia ? [{
      section: "KEPANITIAAN", items: [
        { href: "/mahasiswa/kelola-pendaftar", icon: Users, label: "Kelola Pendaftar" },
      ]
    }] : []),
    {
      section: "AKUN", items: [
        { href: "/mahasiswa/profil", icon: User, label: "Profil Saya" },
      ]
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const isActive = (href: string) => {
    if (href === "/mahasiswa/tiket") {
      const activityPages = ["/mahasiswa/tiket", "/mahasiswa/transaksi", "/mahasiswa/sertifikat", "/mahasiswa/diskusi"];
      return activityPages.some(page => pathname === page || pathname.startsWith(page + "/"));
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Flat menu items for mobile bottom nav
  const flatMenuItems = menuItems.flatMap(group => group.items);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">

      {/* SIDEBAR DESKTOP */}
      <aside className={`
        hidden md:flex flex-col bg-white border-r border-slate-200 
        transition-all duration-300 ease-in-out relative z-40
        ${isSidebarCollapsed ? "w-20" : "w-72"}
      `}>
        {/* Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 shrink-0">
          <Link href="/mahasiswa/dashboard" className="flex items-center gap-3 overflow-hidden">
            <img src="/logo-bem.png" alt="Logo BEM" className="w-9 h-9 object-contain drop-shadow-md shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-lg font-extrabold text-slate-800 tracking-tight whitespace-nowrap">BEM El Rahma</span>
            )}
          </Link>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 bg-white border border-gray-200 p-1 rounded-full shadow-sm text-gray-400 hover:text-indigo-600 z-50"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 overflow-x-hidden scrollbar-hide">
          {menuItems.map((group) => (
            <div key={group.section}>
              {!isSidebarCollapsed && <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{group.section}</p>}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${active
                          ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <div className={`${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"} shrink-0 flex items-center justify-center`}>
                        <Icon className="w-[18px] h-[18px]" />
                      </div>
                      {!isSidebarCollapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                      {active && !isSidebarCollapsed && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-1">
        {flatMenuItems.map((item, index) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center h-full space-y-1 relative shrink-0
                ${active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-b-full"></span>
              )}
              <div className="shrink-0 flex items-center justify-center">
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[10px] font-semibold tracking-wide truncate max-w-full text-center leading-none px-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* HEADER / TOP NAVBAR */}
        <header className="h-20 px-4 md:px-8 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <h1 className="text-xl font-extrabold text-gray-900 leading-none">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Sistem Informasi Event Kampus</p>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <img src="/logo-bem.png" alt="Logo BEM" className="w-8 h-8 object-contain drop-shadow-md shrink-0" />
              <span className="text-lg font-extrabold text-slate-800 tracking-tight">BEM El Rahma</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex p-2.5 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors relative group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                    {user.foto_mahasiswa ? (
                      <img
                        src={user.foto_mahasiswa.startsWith('http') ? user.foto_mahasiswa : `${getBackendBaseUrl()}/uploads/${user.foto_mahasiswa}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role || 'Mahasiswa'}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-gray-50 bg-gray-50/50 sm:hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user.role || 'Mahasiswa'}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold"
                      >
                        <LogOut className="w-4 h-4" /> Keluar Akun
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 md:p-8 pb-8 flex-1">
            {children}
          </div>

          <footer className="px-4 md:px-8 py-5 border-t border-gray-200/60 flex items-center justify-between text-sm text-gray-500 shrink-0 pb-24 md:pb-6 mt-auto">
            <div>
              &copy; 2026 <Link href="https://github.com/abayyydev" target="_blank" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">AbayyyDev</Link>. All rights reserved.
            </div>
            <div className="font-bold text-gray-400">
              V.2.0
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
