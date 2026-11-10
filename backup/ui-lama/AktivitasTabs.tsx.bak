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
    <div className="mb-8 border-b border-gray-200">
      <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
