"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, Receipt, Award, MessageSquare } from "lucide-react";

export default function AktivitasTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "Tiket Saya", href: "/mahasiswa/tiket", icon: Ticket },
    { name: "Riwayat Transaksi", href: "/mahasiswa/transaksi", icon: Receipt },
    { name: "E-Sertifikat", href: "/mahasiswa/sertifikat", icon: Award },
    { name: "Ruang Diskusi", href: "/mahasiswa/diskusi", icon: MessageSquare },
  ];

  return (
    <div className="mb-6 border-b border-slate-200/80 dark:border-slate-800">
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors
                ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
