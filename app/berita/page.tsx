"use client";

import AppShell from "@/components/shell/PublicShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { announcementService } from "@/services/announcement.service";
import { useEffect, useState } from "react";
import type { AnnouncementEntity } from "@/types/announcement";

export default function BeritaPage() {
  const [news, setNews] = useState<AnnouncementEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await announcementService.list({ audience: "semua", isActive: true });
      setNews(res.data);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Portal Berita" subtitle="Informasi terbaru dari UKM" />
      {loading ? (
        <div className="text-center py-12">Memuat berita...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Belum ada berita</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.judul}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">{item.isi}</p>
              <p className="text-xs text-slate-400">{item.tanggalMulai}</p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}