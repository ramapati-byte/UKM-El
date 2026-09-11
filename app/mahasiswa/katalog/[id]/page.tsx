"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Loader2, Info, Users, User, Clock, MessageSquare, Ticket, Download, Send, CheckCircle, Plus, Trash2 } from "lucide-react";
import MahasiswaLayout from "../../../../components/MahasiswaLayout";
import api from "../../../../lib/api";
import Swal from "sweetalert2";

export default function DetailEventPage() {
  const router = useRouter();
  const params = useParams();
  
  let event_id = params.id as string;
  if (params.id) {
    try { event_id = atob(decodeURIComponent(params.id as string)); } catch (e) {}
  }

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info"); // info, form

  // Form Registration State
  const [user, setUser] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([{
    nama_peserta: "", email_peserta: "", telepon_peserta: "", jenis_kelamin: "", jawaban_custom: {}
  }]);
  const [submitting, setSubmitting] = useState(false);



  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (!stored || JSON.parse(stored).role !== "mahasiswa") router.replace("/login");
      else setUser(JSON.parse(stored));
    }
  }, [router]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/mahasiswa/katalog/${event_id}`);
        setData(res.data);
      } catch (err: any) {
        Swal.fire("Error", "Event tidak ditemukan", "error").then(() => router.push("/mahasiswa/katalog"));
      } finally { setLoading(false); }
    };
    if (event_id) fetch();
  }, [event_id]);



  // Pre-fill form when user loads
  useEffect(() => {
    if (user && participants.length === 1 && participants[0].nama_peserta === "") {
      const newParticipants = [...participants];
      newParticipants[0] = {
        ...newParticipants[0],
        nama_peserta: user.name,
        email_peserta: user.email || "",
      };
      setParticipants(newParticipants);
    }
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (!p.nama_peserta || !p.email_peserta || !p.telepon_peserta || !p.jenis_kelamin) {
            Swal.fire("Error", `Mohon lengkapi semua data utama untuk Peserta ${i+1}`, "error"); 
            return;
        }
    }

    setSubmitting(true);
    try {
      const payload = { participants };
      const res = await api.post(`/mahasiswa/katalog/${event_id}/daftar`, payload);
      
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Pendaftaran berhasil disimpan.", timer: 2000, showConfirmButton: false })
          .then(() => {
            router.push("/mahasiswa/tiket");
          });
      }
    } catch (err: any) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal mendaftar", "error");
    } finally { setSubmitting(false); }
  };

  const addParticipant = () => {
    setParticipants([...participants, { nama_peserta: "", email_peserta: "", telepon_peserta: "", jenis_kelamin: "", jawaban_custom: {} }]);
  };
  
  const removeParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const updateParticipant = (index: number, field: string, value: any, isCustom = false) => {
    const newParticipants = [...participants];
    if (isCustom) {
      newParticipants[index].jawaban_custom = { ...newParticipants[index].jawaban_custom, [field]: value };
    } else {
      newParticipants[index][field] = value;
    }
    setParticipants(newParticipants);
  };



  if (loading) return <MahasiswaLayout><div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div></MahasiswaLayout>;

  if (!data || !data.event) {
    return <MahasiswaLayout><div className="flex items-center justify-center min-h-[80vh] font-bold text-slate-500">Mengarahkan kembali...</div></MahasiswaLayout>;
  }

  const event = data.event;
  const isFree = event?.tipe_event === "gratis" || event?.harga <= 0;
  const isRegistered = data?.is_registered;

  return (
    <MahasiswaLayout>
      <div className="pb-20">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 pb-20 pt-8 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden -mx-4 md:-mx-8 -mt-8 mb-12">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-40 blur-3xl" />
          <div className="max-w-6xl mx-auto relative z-10 flex items-center justify-between">
            <Link href="/mahasiswa/katalog" className="text-indigo-200 hover:text-white transition flex items-center gap-2 text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <ArrowLeft className="w-4 h-4" /> Katalog Event
            </Link>
            {isRegistered && <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Telah Terdaftar</span>}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Content */}
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Event Header Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="h-[300px] bg-slate-200 relative overflow-hidden">
                  {event.poster ? (
                    <img src={`${getBackendBaseUrl()}/uploads/${event.poster}`} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-800 to-indigo-900 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md mb-3 inline-block uppercase tracking-wide">
                      {event.tipe_event}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2 shadow-sm">{event.judul}</h1>
                  </div>
                </div>

                {/* Tabs Menu */}
                <div className="flex border-b border-slate-100 overflow-x-auto">
                  <button onClick={() => setActiveTab("info")} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === "info" ? "text-indigo-600 border-indigo-600 bg-indigo-50/50" : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"}`}>
                    <Info className="w-4 h-4" /> Informasi Utama
                  </button>
                  <button onClick={() => setActiveTab("form")} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === "form" ? "text-indigo-600 border-indigo-600 bg-indigo-50/50" : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"}`}>
                    <Ticket className="w-4 h-4" /> Formulir Pendaftaran
                  </button>
                </div>

                {/* Tab Content: Info */}
                {activeTab === "info" && (
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Jadwal Pelaksanaan</p>
                          <p className="font-semibold text-slate-800 text-sm">{new Date(event.tanggal_waktu).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(event.tanggal_waktu).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB - {event.jam_selesai?.slice(0,5)} WIB</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Lokasi Event</p>
                          <p className="font-semibold text-slate-800 text-sm leading-snug">{event.lokasi}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Penyelenggara</p>
                          <p className="font-semibold text-slate-800 text-sm leading-snug">{event.ukm_penyelenggara || event.nama_penyelenggara || 'BEM / UKM Kampus'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-lg">Deskripsi Event</h3>
                      <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {event.deskripsi}
                      </div>
                    </div>

                    {data.sponsors?.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-slate-100">
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-4">Didukung Oleh</h3>
                        <div className="flex flex-wrap gap-4">
                          {data.sponsors.map((s: any) => (
                            <div key={s.id} className="w-24 h-24 bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center">
                              <img src={`${getBackendBaseUrl()}/uploads/${s.logo}`} alt={s.nama_sponsor} className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition" title={s.nama_sponsor} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content: Form */}
                {activeTab === "form" && (
                  <div className="p-6 md:p-8">
                    {isRegistered && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-emerald-800">Anda sudah memiliki tiket untuk event ini.</p>
                          <p className="text-xs text-emerald-700/80 mt-1">Anda tetap dapat membeli tiket tambahan untuk teman atau kerabat menggunakan form di bawah.</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-800/80 leading-relaxed">Anda dapat mendaftarkan lebih dari satu peserta sekaligus. Pastikan email setiap peserta berbeda jika tiket ingin dikirim masing-masing.</p>
                      </div>

                      {participants.map((p, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 relative shadow-sm">
                          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                              <User className="w-4 h-4 text-indigo-500" /> Peserta {index + 1}
                            </h4>
                            {participants.length > 1 && (
                              <button type="button" onClick={() => removeParticipant(index)} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
                                <Trash2 className="w-3 h-3" /> Hapus
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Nama Lengkap</label>
                              <input type="text" value={p.nama_peserta} onChange={(e) => updateParticipant(index, 'nama_peserta', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-black" required />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email Aktif</label>
                              <input type="email" value={p.email_peserta} onChange={(e) => updateParticipant(index, 'email_peserta', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-black" required />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">No. WhatsApp</label>
                              <input type="text" value={p.telepon_peserta} onChange={(e) => updateParticipant(index, 'telepon_peserta', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-black" required />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Jenis Kelamin</label>
                              <div className="flex gap-3">
                                <label className="flex-1 cursor-pointer">
                                  <input type="radio" name={`jk_${index}`} value="Laki-laki" checked={p.jenis_kelamin === 'Laki-laki'} onChange={(e) => updateParticipant(index, 'jenis_kelamin', e.target.value)} className="peer sr-only" required />
                                  <div className="text-center py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 peer-checked:border-indigo-300 transition-colors bg-white">Laki-laki</div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                  <input type="radio" name={`jk_${index}`} value="Perempuan" checked={p.jenis_kelamin === 'Perempuan'} onChange={(e) => updateParticipant(index, 'jenis_kelamin', e.target.value)} className="peer sr-only" required />
                                  <div className="text-center py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 peer-checked:border-indigo-300 transition-colors bg-white">Perempuan</div>
                                </label>
                              </div>
                            </div>
                          </div>

                          {data.form_fields?.length > 0 && (
                            <div className="pt-5 border-t border-slate-100 mt-5">
                              <h4 className="text-sm font-bold text-slate-800 mb-4">Informasi Tambahan</h4>
                              <div className="space-y-4">
                                {data.form_fields.map((f: any) => (
                                  <div key={f.id}>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">
                                      {f.label} {f.is_required ? <span className="text-red-500">*</span> : null}
                                    </label>
                                    {f.field_type === "select" ? (
                                      <select required={!!f.is_required} value={p.jawaban_custom[f.id] || ""} onChange={(e) => updateParticipant(index, f.id, e.target.value, true)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm appearance-none text-black">
                                        <option value="">- Pilih -</option>
                                        {f.options?.split(",").map((opt: string) => (
                                          <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input type="text" required={!!f.is_required} placeholder={f.placeholder} value={p.jawaban_custom[f.id] || ""} onChange={(e) => updateParticipant(index, f.id, e.target.value, true)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-black" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <button type="button" onClick={addParticipant} className="w-full border-2 border-dashed border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 mb-6">
                        <Plus className="w-5 h-5" /> Tambah Peserta Lain
                      </button>

                      <div className="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-xl">
                        <div>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Total Bayar</p>
                          <p className="text-2xl font-black text-amber-400">
                            {isFree ? "Gratis" : `Rp ${(Number(event.harga) * participants.length).toLocaleString("id-ID")}`}
                          </p>
                          <p className="text-xs text-slate-300 mt-1">{participants.length} Peserta Terpilih</p>
                        </div>
                        <button type="submit" disabled={submitting}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-extrabold py-3.5 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ticket className="w-5 h-5" />}
                          {submitting ? "Memproses..." : "Bayar Sekarang"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            </div>

            {/* Right Sidebar: Summary */}
            <div className="w-full lg:w-1/3">
              <div className="sticky top-6">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -mt-10 -mr-10" />
                  
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center">
                    <Ticket className="w-5 h-5 text-amber-500 mr-2" /> Ringkasan Tiket
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 border-dashed">
                      <span className="text-sm text-slate-500 font-medium">Jenis Event</span>
                      <span className="text-sm font-bold text-slate-800 capitalize bg-slate-100 px-3 py-1 rounded-lg">{event.tipe_event}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 border-dashed">
                      <span className="text-sm text-slate-500 font-medium">Visibilitas</span>
                      <span className="text-sm font-bold text-slate-800 capitalize">{event.visibilitas}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-slate-500 font-medium">Total Harga</span>
                      <span className="text-2xl font-extrabold text-indigo-600">
                        {isFree ? "Gratis" : `Rp ${Number(event.harga).toLocaleString("id-ID")}`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-8">
                    <button onClick={() => setActiveTab("form")}
                      className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md">
                      Daftar / Beli Tiket
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
}
