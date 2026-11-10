"use client";
import { getBackendBaseUrl } from "@/lib/axios";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import Swal from "sweetalert2";
import CertificateCommitteeSection from "@/components/events/CertificateCommitteeSection";
import { eventService } from "@/services/event.service";
import type { EventCommittee } from "@/types/event";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Tabs from "@/components/ui/Tabs";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface CertificateEventData {
  judul?: string;
  tanggal_waktu?: string;
  lokasi?: string;
  ukm_penyelenggara?: string;
  deskripsi?: string;
  poster?: string | null;
  jam_selesai?: string | null;
  sertifikat_template?: string;
  sertifikat_orientasi?: string;
  sertifikat_prefix?: string;
  sertifikat_nomor_awal?: number;
  sertifikat_nama_fs?: number;
  sertifikat_nama_x_percent?: number | string;
  sertifikat_nama_y_percent?: number | string;
  sertifikat_nomor_fs?: number;
  sertifikat_nomor_x_percent?: number | string;
  sertifikat_nomor_y_percent?: number | string;
  sertifikat_font?: string;
  sertifikat_custom_type?: string;
  sertifikat_custom_global_text?: string;
  sertifikat_custom_fs?: number;
  sertifikat_custom_x_percent?: number | string;
  sertifikat_custom_y_percent?: number | string;
}

export default function SertifikatSettingPage() {
  const params = useParams();
  const { id } = params;
  let decoded_id = id as string;
  if (id) {
    try { decoded_id = atob(decodeURIComponent(id as string)); } catch (e) {}
  }

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [eventData, setEventData] = useState<CertificateEventData | null>(null);
  const [committees, setCommittees] = useState<EventCommittee[]>([]);
  const [activeCertTab, setActiveCertTab] = useState<"peserta" | "panitia">("peserta");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    sertifikat_template: "",
    sertifikat_orientasi: "portrait",
    sertifikat_prefix: "",
    sertifikat_nomor_awal: 1,
    sertifikat_nama_fs: 120,
    sertifikat_nama_x_percent: 50.00,
    sertifikat_nama_y_percent: 50.00,
    sertifikat_nomor_fs: 40,
    sertifikat_nomor_x_percent: 50.00,
    sertifikat_nomor_y_percent: 60.00,
    sertifikat_font: "Poppins-SemiBold.ttf",
    sertifikat_custom_type: "none",
    sertifikat_custom_global_text: "",
    sertifikat_custom_fs: 30,
    sertifikat_custom_x_percent: 50.00,
    sertifikat_custom_y_percent: 70.00
  });

  const [fileSertifikat, setFileSertifikat] = useState<File | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'nama' | 'nomor' | 'custom' | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    if (dragging === 'nama') setFormData(prev => ({...prev, sertifikat_nama_x_percent: parseFloat(x.toFixed(2)), sertifikat_nama_y_percent: parseFloat(y.toFixed(2))}));
    else if (dragging === 'nomor') setFormData(prev => ({...prev, sertifikat_nomor_x_percent: parseFloat(x.toFixed(2)), sertifikat_nomor_y_percent: parseFloat(y.toFixed(2))}));
    else if (dragging === 'custom') setFormData(prev => ({...prev, sertifikat_custom_x_percent: parseFloat(x.toFixed(2)), sertifikat_custom_y_percent: parseFloat(y.toFixed(2))}));
  };

  const stopDrag = () => setDragging(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(
        storedUser
          ? JSON.parse(storedUser)
          : { id: 2, name: "BEM El Rahma", email: "bem@elrahma.ac.id", role: "penyelenggara" }
      );
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resEvent, comms] = await Promise.all([
          api.get(`/events/${decoded_id}`),
          eventService.getCommittees(Number(decoded_id)).catch(() => []),
        ]);
        setEventData(resEvent.data);
        setCommittees(comms);
        const ev = resEvent.data;

        setFormData({
            sertifikat_template: ev.sertifikat_template || "",
            sertifikat_orientasi: ev.sertifikat_orientasi || "portrait",
            sertifikat_prefix: ev.sertifikat_prefix || "",
            sertifikat_nomor_awal: ev.sertifikat_nomor_awal || 1,
            sertifikat_nama_fs: ev.sertifikat_nama_fs || 120,
            sertifikat_nama_x_percent: Number(ev.sertifikat_nama_x_percent) || 50.00,
            sertifikat_nama_y_percent: Number(ev.sertifikat_nama_y_percent) || 50.00,
            sertifikat_nomor_fs: ev.sertifikat_nomor_fs || 40,
            sertifikat_nomor_x_percent: Number(ev.sertifikat_nomor_x_percent) || 50.00,
            sertifikat_nomor_y_percent: Number(ev.sertifikat_nomor_y_percent) || 60.00,
            sertifikat_font: ev.sertifikat_font || "Poppins-SemiBold.ttf",
            sertifikat_custom_type: ev.sertifikat_custom_type || "none",
            sertifikat_custom_global_text: ev.sertifikat_custom_global_text || "",
            sertifikat_custom_fs: ev.sertifikat_custom_fs || 30,
            sertifikat_custom_x_percent: Number(ev.sertifikat_custom_x_percent) || 50.00,
            sertifikat_custom_y_percent: Number(ev.sertifikat_custom_y_percent) || 70.00
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setFileSertifikat(file);
          // Buat URL untuk preview
          setFormData({
              ...formData,
              sertifikat_template: URL.createObjectURL(file)
          });
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaveLoading(true);
      try {
          const submitData = new FormData();
          if (fileSertifikat) submitData.append('sertifikat_template', fileSertifikat);
          submitData.append('sertifikat_orientasi', formData.sertifikat_orientasi);
          submitData.append('sertifikat_prefix', formData.sertifikat_prefix);
          submitData.append('sertifikat_nomor_awal', String(formData.sertifikat_nomor_awal));
          submitData.append('sertifikat_nama_fs', String(formData.sertifikat_nama_fs));
          submitData.append('sertifikat_nama_x_percent', String(formData.sertifikat_nama_x_percent));
          submitData.append('sertifikat_nama_y_percent', String(formData.sertifikat_nama_y_percent));
          submitData.append('sertifikat_nomor_fs', String(formData.sertifikat_nomor_fs));
          submitData.append('sertifikat_nomor_x_percent', String(formData.sertifikat_nomor_x_percent));
          submitData.append('sertifikat_nomor_y_percent', String(formData.sertifikat_nomor_y_percent));
          submitData.append('sertifikat_font', formData.sertifikat_font);
          submitData.append('sertifikat_custom_type', formData.sertifikat_custom_type);
          submitData.append('sertifikat_custom_global_text', formData.sertifikat_custom_global_text);
          submitData.append('sertifikat_custom_fs', String(formData.sertifikat_custom_fs));
          submitData.append('sertifikat_custom_x_percent', String(formData.sertifikat_custom_x_percent));
          submitData.append('sertifikat_custom_y_percent', String(formData.sertifikat_custom_y_percent));

          await api.put(`/events/${decoded_id}/sertifikat`, submitData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          Swal.fire({
              icon: 'success',
              title: 'Tersimpan!',
              text: 'Konfigurasi sertifikat berhasil diperbarui.',
              confirmButtonColor: '#4f46e5',
              timer: 2000,
              showConfirmButton: false
          });
      } catch (error) {
          Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Gagal menyimpan pengaturan.',
              confirmButtonColor: '#4f46e5'
          });
      } finally {
          setSaveLoading(false);
      }
  };

  return (
    <DashboardLayout
      user={user}
      title="Sertifikat Event"
      subtitle={`Atur template dan posisi teks sertifikat untuk event: ${eventData?.judul ?? "Memuat..."}`}
      links={[]}
      onLogout={() => {}}
    >
      <div className="space-y-6 pb-10">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Desain Sertifikat
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sesuaikan template, penomoran, dan posisi teks sertifikat peserta maupun panitia.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: "peserta", label: "Sertifikat Peserta Event", icon: "bi-file-earmark-image" },
            { id: "panitia", label: "Sertifikat Panitia Pelaksana", icon: "bi-people", count: committees.length },
          ]}
          activeTab={activeCertTab}
          onChange={(tabId) => setActiveCertTab(tabId as "peserta" | "panitia")}
        />

        {loading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : activeCertTab === "panitia" ? (
          <Card>
            <CardHeader>
              <CardTitle icon="bi-people">Sertifikat Panitia Pelaksana</CardTitle>
            </CardHeader>
            <CardBody>
              <CertificateCommitteeSection
                event={{
                    id: Number(decoded_id),
                    title: eventData?.judul || "Event",
                    starts_at: eventData?.tanggal_waktu || new Date().toISOString(),
                    location: eventData?.lokasi || "Kampus",
                    ukm_name: eventData?.ukm_penyelenggara || user?.name || "BEM El Rahma",
                    ukm_id: "ukm-default",
                    description: eventData?.deskripsi || "",
                    poster_url: eventData?.poster || null,
                    ends_at: eventData?.jam_selesai || null,
                    visibility: "public",
                    type: "free",
                    price: 0,
                    penalty_amount: 0,
                    max_participants: 0,
                    status: "approved",
                    created_by: 1,
                    created_at: new Date().toISOString(),
                }}
                committees={committees}
              />
            </CardBody>
          </Card>
        ) : (
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* KIRI: Upload & Preview Simulasi */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle icon="bi-image">Template Sertifikat</CardTitle>
                </CardHeader>
                <CardBody className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Gambar Template (A4)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 file:font-semibold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Orientasi Kertas
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.sertifikat_orientasi === 'landscape' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800'}`}>
                        <input type="radio" name="orientasi" value="landscape" checked={formData.sertifikat_orientasi === 'landscape'} onChange={e => setFormData({...formData, sertifikat_orientasi: e.target.value})} className="sr-only" />
                        <div className="w-12 h-8 border-2 border-slate-400 dark:border-slate-500 rounded bg-white dark:bg-slate-900"></div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Landscape</span>
                      </label>
                      <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.sertifikat_orientasi === 'portrait' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800'}`}>
                        <input type="radio" name="orientasi" value="portrait" checked={formData.sertifikat_orientasi === 'portrait'} onChange={e => setFormData({...formData, sertifikat_orientasi: e.target.value})} className="sr-only" />
                        <div className="w-8 h-12 border-2 border-slate-400 dark:border-slate-500 rounded bg-white dark:bg-slate-900"></div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Portrait</span>
                      </label>
                    </div>
                  </div>

                  <div
                    className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl h-64 bg-slate-50 dark:bg-slate-800/40 relative flex items-center justify-center overflow-hidden"
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDrag}
                    onMouseLeave={stopDrag}
                  >
                    {formData.sertifikat_template ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.sertifikat_template.startsWith('blob:') ? formData.sertifikat_template : `${getBackendBaseUrl()}${formData.sertifikat_template}`} alt="Preview" className="object-contain w-full h-full opacity-50 select-none pointer-events-none" />
                    ) : (
                      <span className="text-slate-400 font-medium text-sm">Pratinjau Gambar</span>
                    )}
                    {/* Titik Koordinat Kasar Simulasi */}
                    <div
                      onMouseDown={() => setDragging('nama')}
                      className="absolute flex items-center justify-center w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full cursor-move shadow-lg shadow-red-500/40 transition-transform hover:scale-125 z-10"
                      style={{ left: `calc(${formData.sertifikat_nama_x_percent}% - 12px)`, top: `calc(${formData.sertifikat_nama_y_percent}% - 12px)` }}
                    >N</div>
                    <div
                      onMouseDown={() => setDragging('nomor')}
                      className="absolute flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-[10px] font-bold rounded-full cursor-move shadow-lg shadow-blue-500/40 transition-transform hover:scale-125 z-10"
                      style={{ left: `calc(${formData.sertifikat_nomor_x_percent}% - 12px)`, top: `calc(${formData.sertifikat_nomor_y_percent}% - 12px)` }}
                    >#</div>
                    {formData.sertifikat_custom_type !== 'none' && (
                      <div
                        onMouseDown={() => setDragging('custom')}
                        className="absolute flex items-center justify-center w-6 h-6 bg-green-500 text-white text-[10px] font-bold rounded-full cursor-move shadow-lg shadow-green-500/40 transition-transform hover:scale-125 z-10"
                        style={{ left: `calc(${formData.sertifikat_custom_x_percent}% - 12px)`, top: `calc(${formData.sertifikat_custom_y_percent}% - 12px)` }}
                      >C</div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 px-1 text-xs font-semibold">
                    <span className="text-red-500 flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Nama</span>
                    <span className="text-blue-500 flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Nomor</span>
                    {formData.sertifikat_custom_type !== 'none' && <span className="text-green-500 flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Custom</span>}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* KANAN: Koordinat & Angka */}
            <div className="lg:col-span-7 space-y-6">
              {/* Penomoran */}
              <Card>
                <CardHeader>
                  <CardTitle icon="bi-hash">Format Penomoran</CardTitle>
                </CardHeader>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Awalan (Prefix)"
                    type="text"
                    value={formData.sertifikat_prefix}
                    onChange={e => setFormData({...formData, sertifikat_prefix: e.target.value})}
                    placeholder="Misal: EVT-001-"
                  />
                  <Input
                    label="Nomor Urut Awal"
                    type="number"
                    value={formData.sertifikat_nomor_awal}
                    onChange={e => setFormData({...formData, sertifikat_nomor_awal: Number(e.target.value)})}
                  />
                </CardBody>
              </Card>

              {/* Posisi Nama & Nomor */}
              <Card>
                <CardHeader>
                  <CardTitle icon="bi-geo-alt">Koordinat Teks (Persentase)</CardTitle>
                </CardHeader>
                <CardBody className="space-y-5">
                  {/* NAMA */}
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 relative">
                    <span className="inline-block mb-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-md">
                      POSISI NAMA
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="Ukuran Font (px)"
                        type="number"
                        value={formData.sertifikat_nama_fs}
                        onChange={e => setFormData({...formData, sertifikat_nama_fs: Number(e.target.value)})}
                      />
                      <Input
                        label="Sumbu X (%)"
                        type="number"
                        step="0.01"
                        value={formData.sertifikat_nama_x_percent}
                        onChange={e => setFormData({...formData, sertifikat_nama_x_percent: Number(e.target.value)})}
                      />
                      <Input
                        label="Sumbu Y (%)"
                        type="number"
                        step="0.01"
                        value={formData.sertifikat_nama_y_percent}
                        onChange={e => setFormData({...formData, sertifikat_nama_y_percent: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  {/* NOMOR */}
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 relative">
                    <span className="inline-block mb-3 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-md">
                      POSISI NOMOR
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="Ukuran Font (px)"
                        type="number"
                        value={formData.sertifikat_nomor_fs}
                        onChange={e => setFormData({...formData, sertifikat_nomor_fs: Number(e.target.value)})}
                      />
                      <Input
                        label="Sumbu X (%)"
                        type="number"
                        step="0.01"
                        value={formData.sertifikat_nomor_x_percent}
                        onChange={e => setFormData({...formData, sertifikat_nomor_x_percent: Number(e.target.value)})}
                      />
                      <Input
                        label="Sumbu Y (%)"
                        type="number"
                        step="0.01"
                        value={formData.sertifikat_nomor_y_percent}
                        onChange={e => setFormData({...formData, sertifikat_nomor_y_percent: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  {/* CUSTOM TEXT */}
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 relative">
                    <span className="inline-block mb-3 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-md">
                      TEKS KUSTOM (PREDIKAT)
                    </span>
                    <div className="space-y-4">
                      <Select
                        label="Tipe Teks Kustom"
                        value={formData.sertifikat_custom_type}
                        onChange={e => setFormData({...formData, sertifikat_custom_type: e.target.value})}
                        options={[
                          { value: "none", label: "Tidak Ada" },
                          { value: "global", label: "Sama Untuk Semua Peserta" },
                          { value: "per_peserta", label: "Berbeda Tiap Peserta (Predikat)" },
                        ]}
                      />
                      {formData.sertifikat_custom_type === 'global' && (
                        <Input
                          label="Teks"
                          type="text"
                          value={formData.sertifikat_custom_global_text}
                          onChange={e => setFormData({...formData, sertifikat_custom_global_text: e.target.value})}
                          placeholder="Misal: Peserta Terbaik"
                        />
                      )}
                      {formData.sertifikat_custom_type !== 'none' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Input
                            label="Font Size (px)"
                            type="number"
                            value={formData.sertifikat_custom_fs}
                            onChange={e => setFormData({...formData, sertifikat_custom_fs: Number(e.target.value)})}
                          />
                          <Input
                            label="Sumbu X (%)"
                            type="number"
                            step="0.01"
                            value={formData.sertifikat_custom_x_percent}
                            onChange={e => setFormData({...formData, sertifikat_custom_x_percent: Number(e.target.value)})}
                          />
                          <Input
                            label="Sumbu Y (%)"
                            type="number"
                            step="0.01"
                            value={formData.sertifikat_custom_y_percent}
                            onChange={e => setFormData({...formData, sertifikat_custom_y_percent: Number(e.target.value)})}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Button
                type="submit"
                loading={saveLoading}
                icon="bi-save"
                size="lg"
                className="w-full"
              >
                Simpan Konfigurasi
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
