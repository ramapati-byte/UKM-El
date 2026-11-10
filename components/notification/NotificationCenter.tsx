// components/notification/NotificationCenter.tsx — Pusat notifikasi header

"use client";

import { useState, useEffect } from "react";
import { notificationService } from "../../services/announcement.service";
import type { NotificationEntity } from "../../types/announcement";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

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

  const typeIcon: Record<string, string> = {
    info: "bi-info-circle text-info",
    success: "bi-check-circle text-success",
    warning: "bi-exclamation-triangle text-warning",
    danger: "bi-x-circle text-danger",
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        aria-label="Notifikasi"
      >
        <i className="bi bi-bell text-lg"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-50">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">Tidak ada notifikasi</div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`p-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!n.dibaca ? "bg-indigo-50 dark:bg-indigo-900/10" : ""}`}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      <i className={`bi ${typeIcon[n.tipe]} mt-0.5`}></i>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{n.judul}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.pesan}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.dibuatPada}</p>
                      </div>
                      {!n.dibaca && <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5"></span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}