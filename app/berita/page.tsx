"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/shell/PublicShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { announcementService } from "@/services/announcement.service";
import type { AnnouncementEntity } from "@/types/announcement";
import { formatDateLong, formatDateShort } from "@/lib/format";

export default function BeritaPage() {
  const [news, setNews] = useState<AnnouncementEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNews, setSelectedNews] = useState<AnnouncementEntity | null>(
    null
  );

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await announcementService.list({
        isActive: true,
      });
      setNews(res.data);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = news.filter((item) => {
    return (
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.isi.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <PublicShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <PageHeader
            title="Warta & Berita Kampus"
            subtitle="Informasi dan pengumuman resmi kegiatan organisasi mahasiswa"
          />
          <div className="w-full md:w-72">
            <Input
              placeholder="Cari berita atau pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 animate-pulse"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
            <i
              className="bi bi-newspaper text-5xl text-slate-300 dark:text-slate-600 mb-3 block"
              aria-hidden="true"
            />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Tidak Ada Berita
            </h3>
            <p className="text-sm text-slate-500">
              Belum ada informasi yang dipublikasikan saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col justify-between p-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={item.audience === "semua" ? "primary" : "info"}
                      size="sm"
                    >
                      {item.audience === "semua" ? "Pengumuman Kampus" : "Internal UKM"}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {formatDateShort(item.tanggalMulai)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
                    {item.judul}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.isi}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Oleh: {item.dibuatOleh}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedNews(item)}
                  >
                    Baca Selengkapnya
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Baca Berita Lengkap */}
        <Modal
          open={!!selectedNews}
          onClose={() => setSelectedNews(null)}
          title={selectedNews?.judul || "Detail Pengumuman"}
        >
          {selectedNews && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Badge
                  variant={selectedNews.audience === "semua" ? "primary" : "info"}
                >
                  {selectedNews.audience === "semua"
                    ? "Pengumuman Kampus"
                    : "Internal UKM"}
                </Badge>
                <span>Dipublikasi: {formatDateLong(selectedNews.tanggalMulai)}</span>
              </div>

              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedNews.isi}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedNews(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PublicShell>
  );
}
