// components/notification/NotificationCenter.tsx — Modern Notification Dropdown

"use client";

import { useState, useEffect, useRef } from "react";
import { notificationService } from "../../services/announcement.service";
import type { NotificationEntity } from "../../types/announcement";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await notificationService.list();
      setNotifications(res.data);
      const count = await notificationService.jumlahBelumDibaca();
      setUnreadCount(count);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    let active = true;
    notificationService
      .list()
      .then((res) => {
        if (active) {
          setNotifications(res.data);
          notificationService
            .jumlahBelumDibaca()
            .then((count) => {
              if (active) setUnreadCount(count);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (active) setNotifications([]);
      });

    return () => {
      active = false;
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.tandaiDibaca(id);
      load();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.tandaiSemuaDibaca();
      load();
    } catch {}
  };

  const typeConfig: Record<string, { icon: string; color: string }> = {
    info: { icon: "bi-info-circle-fill", color: "text-sky-500" },
    success: { icon: "bi-check-circle-fill", color: "text-emerald-500" },
    warning: { icon: "bi-exclamation-triangle-fill", color: "text-amber-500" },
    danger: { icon: "bi-x-circle-fill", color: "text-red-500" },
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        aria-label="Pusat Notifikasi"
      >
        <i className="bi bi-bell text-lg"></i>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <i className="bi bi-bell-slash text-2xl block mb-2 opacity-50" />
                Tidak ada notifikasi baru
              </div>
            ) : (
              notifications.map((n) => {
                const conf = typeConfig[n.tipe] || typeConfig.info;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3 ${
                      !n.dibaca
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20"
                        : ""
                    }`}
                  >
                    <i className={`bi ${conf.icon} ${conf.color} text-base mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {n.judul}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {n.pesan}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        {n.dibuatPada}
                      </p>
                    </div>
                    {!n.dibaca && (
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shrink-0 shadow-xs" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
