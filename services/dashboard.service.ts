// services/dashboard.service.ts — Kontrak & adapter Dasbor (FE-9)

import type {
  DashboardStats,
  DashboardService,
} from "../types/dashboard";
import { isMockEnabled } from "../lib/env";
import { MOCK_DASHBOARD_STATS } from "../mocks/dashboard.mock";

class DashboardMockService implements DashboardService {
  async getStats(ukmId?: string): Promise<DashboardStats> {
    return { ...MOCK_DASHBOARD_STATS, ukmId: ukmId ?? MOCK_DASHBOARD_STATS.ukmId };
  }

  async getWidgets(_ukmId?: string): Promise<Record<string, unknown>[]> {
    return [
      { id: "widget-1", judul: "Total Anggota", tipe: "statcard", data: { value: MOCK_DASHBOARD_STATS.totalAnggota }, updatedAt: new Date().toISOString() },
      { id: "widget-2", judul: "Total Kegiatan", tipe: "statcard", data: { value: MOCK_DASHBOARD_STATS.totalKegiatan }, updatedAt: new Date().toISOString() },
      { id: "widget-3", judul: "Total Anggaran", tipe: "statcard", data: { value: MOCK_DASHBOARD_STATS.totalAnggaran }, updatedAt: new Date().toISOString() },
      { id: "widget-4", judul: "Tugas Tertunda", tipe: "statcard", data: { value: MOCK_DASHBOARD_STATS.tugasTertunda }, updatedAt: new Date().toISOString() },
    ];
  }

  async getTasks(_ukmId?: string): Promise<Record<string, unknown>[]> {
    return [];
  }

  async exportPdf(): Promise<Blob> {
    return new Blob(["PDF"], { type: "application/pdf" });
  }

  async exportExcel(): Promise<Blob> {
    return new Blob(["Excel"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
}

class DashboardRealService implements DashboardService {
  async getStats(): Promise<DashboardStats> {
    throw new Error("Real adapter belum tersedia");
  }
  async getWidgets(): Promise<Record<string, unknown>[]> {
    throw new Error("Real adapter belum tersedia");
  }
  async getTasks(): Promise<Record<string, unknown>[]> {
    throw new Error("Real adapter belum tersedia");
  }
  async exportPdf(): Promise<Blob> {
    throw new Error("Real adapter belum tersedia");
  }
  async exportExcel(): Promise<Blob> {
    throw new Error("Real adapter belum tersedia");
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