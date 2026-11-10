"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import React, { useState, useEffect } from "react";
import { LogOut, Calendar, Bell, User as UserIcon, Menu, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

interface DashboardLayoutProps {
  user: { name: string; email: string; role: string; foto_profil?: string } | null;
  title: string;
  subtitle: string;
  links: NavItem[];
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, title, subtitle, links, onLogout, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans overflow-hidden">

      {/* SIDEBAR DESKTOP */}
      <aside className={`
        hidden md:flex flex-col bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out relative z-40
        ${isSidebarCollapsed ? "w-20" : "w-64"}
      `}>
        {/* Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/logo-bem.png" alt="Logo BEM" className="w-9 h-9 object-contain drop-shadow-md shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-lg font-extrabold text-slate-800 tracking-tight whitespace-nowrap">BEM El Rahma</span>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 bg-white border border-gray-200 p-1 rounded-full shadow-sm text-gray-400 hover:text-indigo-600 z-50"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {!isSidebarCollapsed && <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Menu Utama</p>}
          {links.map((link, index) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/organizer/dashboard' && link.href !== '/student/dashboard' && link.href !== '/admin/dashboard');

            return (
              <Link
                key={index}
                href={link.href}
                title={isSidebarCollapsed ? link.label : undefined}
                className={`flex items-center gap-3 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-4'} py-3.5 rounded-xl transition-all font-medium group relative
                  ${isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <div className={`${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500 transition-colors"} shrink-0 flex items-center justify-center`}>
                  {React.isValidElement(link.icon)
                    ? React.cloneElement(link.icon as React.ReactElement<any>, { className: "w-5 h-5 shrink-0" })
                    : link.icon}
                </div>
                {!isSidebarCollapsed && <span className="text-sm whitespace-nowrap">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {links.map((link, index) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/organizer/dashboard' && link.href !== '/student/dashboard' && link.href !== '/admin/dashboard');
          return (
            <Link
              key={index}
              href={link.href}
              className={`flex flex-1 flex-col items-center justify-center h-full space-y-1 relative
                ${isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-b-full"></span>
              )}
              <div className="shrink-0 flex items-center justify-center">
                {React.isValidElement(link.icon)
                  ? React.cloneElement(link.icon as React.ReactElement<any>, { className: "w-5 h-5 shrink-0" })
                  : link.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-wide truncate max-w-[64px] text-center leading-none">
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* HEADER / TOP NAVBAR */}
        <header className="h-20 px-4 md:px-8 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <h1 className="text-xl font-extrabold text-gray-900 leading-none">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
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
                    {user.foto_profil ? (
                      <img
                        src={user.foto_profil.startsWith('http') ? user.foto_profil : `${getBackendBaseUrl()}/uploads/${user.foto_profil}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-gray-50 bg-gray-50/50 sm:hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                      </div>
                      <button
                        onClick={onLogout}
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

        {/* CONTENT (Scrollable) */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 md:p-8 flex-1">
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
        </div>
      </main>
    </div>
  );
}