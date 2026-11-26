// services/dashboard.service.ts — Kontrak & adapter Dasbor (FE-9)

import type {
  DashboardStats,
  DashboardService,
  DashboardWidget,
  TaskItem,
} from "../types/dashboard";
import api from "../lib/api";
import { isMockEnabled } from "../lib/env";
import { buildSimplePdfBlob, buildCsvBlob } from "../lib/pdf";
import { MOCK_DASHBOARD_STATS, MOCK_DASHBOARD_TASKS } from "../mocks/dashboard.mock";

class DashboardMockService implements DashboardService {
  async getStats(ukmId?: string): Promise<DashboardStats> {
    return { ...MOCK_DASHBOARD_STATS, ukmId: ukmId ?? MOCK_DASHBOARD_STATS.ukmId };
  }

  async getWidgets(_ukmId?: string): Promise<DashboardWidget[]> {
    return [
      { id: "widget-1", judul: "Total Anggota", tipe: "statcard", data: { value: MOCK_DASHBOARD_STATS.totalAnggota }, updatedAt: new Date().toISOString() },
      { id: "widget-2", judul: "Total Kegiatan", tipe: "statcard", data: { value: MOCK_DASHBOARD_STATS.totalKegiatan }, updatedAt: new Date().toISOString() },
      { id: "widget-3", judul: "Total Anggaran", tipe: "statcard", data: { value: MOCK_DASHBOARD_STATS.totalAnggaran }, updatedAt: new Date().toISOString() },
      { id: "widget-4", judul: "Tugas Tertunda", tipe: "statcard", data: { value: MOCK_DASHBOARD_STATS.tugasTertunda }, updatedAt: new Date().toISOString() },
    ];
  }

  async getTasks(_ukmId?: string): Promise<TaskItem[]> {
    return [...MOCK_DASHBOARD_TASKS];
  }

  async exportPdf(): Promise<Blob> {
    return new Blob(["PDF"], { type: "application/pdf" });
  }

  async exportExcel(): Promise<Blob> {
    return new Blob(["Excel"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
}

class DashboardRealService implements DashboardService {
  async getStats(ukmId?: string): Promise<DashboardStats> {
    try {
      const res = await api.get<{
        totalEvents?: number;
        totalParticipants?: number;
        totalRevenue?: number;
        pendingEvents?: number;
        totalMahasiswa?: number;
      }>("/admin/dashboard/stats");
      const d = res.data || {};
      return {
        totalAnggota: d.totalMahasiswa ?? d.totalParticipants ?? 0,
        totalKegiatan: d.totalEvents ?? 0,
        totalAnggaran: d.totalRevenue ?? 0,
        tugasTertunda: d.pendingEvents ?? 0,
        ukmId,
      };
    } catch {
      const res = await api.get<{
        totalEvents?: number;
        totalParticipants?: number;
        totalRevenue?: number;
        pendingEvents?: number;
      }>("/events/organizer/stats");
      const d = res.data || {};
      return {
        totalAnggota: d.totalParticipants ?? 0,
        totalKegiatan: d.totalEvents ?? 0,
        totalAnggaran: d.totalRevenue ?? 0,
        tugasTertunda: d.pendingEvents ?? 0,
        ukmId,
      };
    }
  }

  async getWidgets(ukmId?: string): Promise<DashboardWidget[]> {
    const stats = await this.getStats(ukmId);
    const now = new Date().toISOString();
    return [
      { id: "widget-1", judul: "Total Anggota", tipe: "statcard", data: { value: stats.totalAnggota }, updatedAt: now },
      { id: "widget-2", judul: "Total Kegiatan", tipe: "statcard", data: { value: stats.totalKegiatan }, updatedAt: now },
      { id: "widget-3", judul: "Total Anggaran", tipe: "statcard", data: { value: stats.totalAnggaran }, updatedAt: now },
      { id: "widget-4", judul: "Tugas Tertunda", tipe: "statcard", data: { value: stats.tugasTertunda }, updatedAt: now },
    ];
  }

  async getTasks(): Promise<TaskItem[]> {
    return [];
  }

  async exportPdf(): Promise<Blob> {
    const stats = await this.getStats();
    return buildSimplePdfBlob("Laporan Ringkasan Dashboard UKM", [
      `Tanggal Cetak  : ${new Date().toLocaleDateString("id-ID")}`,
      `Total Anggota  : ${stats.totalAnggota}`,
      `Total Kegiatan : ${stats.totalKegiatan}`,
      `Total Anggaran : Rp ${stats.totalAnggaran.toLocaleString("id-ID")}`,
      `Tugas Tertunda : ${stats.tugasTertunda}`,
    ]);
  }

  async exportExcel(): Promise<Blob> {
    const stats = await this.getStats();
    return buildCsvBlob(
      ["Metrik", "Nilai"],
      [
        ["Total Anggota", stats.totalAnggota],
        ["Total Kegiatan", stats.totalKegiatan],
        ["Total Anggaran", stats.totalAnggaran],
        ["Tugas Tertunda", stats.tugasTertunda],
      ]
    );
  }
}

const mockAdapter = new DashboardMockService();
const realAdapter = new DashboardRealService();

export const dashboardService: DashboardService = new Proxy({} as DashboardService, {
  get(_target, prop: keyof DashboardService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") return value.bind(adapter);
    return value;
  },
});