// types/dashboard.ts — Tipe domain Dasbor & Pelaporan (FE-9)

import type { BaseQuery } from "./common";

export type WidgetType = "statcard" | "chart" | "tasklist" | "progress";

export interface DashboardWidget {
  id: string;
  judul: string;
  tipe: WidgetType;
  data: any;
  updatedAt: string;
}

export interface DashboardStats {
  totalAnggota: number;
  totalKegiatan: number;
  totalAnggaran: number;
  tugasTertunda: number;
  ukmId?: string;
}

export interface WidgetData {
  label: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TaskItem {
  id: string;
  judul: string;
  deadline: string;
  status: "belum" | "proses" | "selesai";
  prioritas: "rendah" | "normal" | "tinggi";
}

export interface DashboardService {
  getStats(ukmId?: string): Promise<DashboardStats>;
  getWidgets(ukmId?: string): Promise<DashboardWidget[]>;
  getTasks(ukmId?: string): Promise<TaskItem[]>;
  exportPdf(): Promise<Blob>;
  exportExcel(): Promise<Blob>;
}