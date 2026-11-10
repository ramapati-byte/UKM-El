"use client";

import { getBackendBaseUrl } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import MahasiswaLayout from "../../../../components/MahasiswaLayout";
import api from "../../../../lib/api";
import Card, { CardBody } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Tabs from "../../../../components/ui/Tabs";
import Callout from "../../../../components/ui/Callout";
import LoadingSkeleton from "../../../../components/ui/LoadingSkeleton";

export default function DetailEventPage() {
  const router = useRouter();
  const params = useParams();

  const event_id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  const [user, setUser] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([
    {
      nama_peserta: "",
      email_peserta: "",
      telepon_peserta: "",
      jenis_kelamin: "",
      jawaban_custom: {},
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser({ name: "Mahasiswa El Rahma", email: "mahasiswa@elrahma.ac.id", role: "mahasiswa" });
      }
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/mahasiswa/katalog/${event_id}`);
        setData(res.data);
      } catch (err: any) {
        Swal.fire("Error", "Event tidak ditemukan", "error").then(() =>
          router.push("/mahasiswa/katalog")
        );
      } finally {
        setLoading(false);
      }
    };
    if (event_id) fetch();
  }, [event_id]);

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
      if (
        !p.nama_peserta ||
        !p.email_peserta ||
        !p.telepon_peserta ||
        !p.jenis_kelamin
      ) {
        Swal.fire(
          "Error",
          `Mohon lengkapi semua data utama untuk Peserta ${i + 1}`,
          "error"
        );
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
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Pendaftaran berhasil disimpan.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          router.push("/mahasiswa/tiket");
        });
      }
    } catch (err: any) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal mendaftar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const addParticipant = () => {
    setParticipants([
      ...participants,
      {
        nama_peserta: "",
        email_peserta: "",
        telepon_peserta: "",
        jenis_kelamin: "",
        jawaban_custom: {},
      },
    ]);
  };

  const removeParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const updateParticipant = (
    index: number,
    field: string,
    value: any,
    isCustom = false
  ) => {
    const newParticipants = [...participants];
    if (isCustom) {
      newParticipants[index].jawaban_custom = {
        ...newParticipants[index].jawaban_custom,
        [field]: value,
      };
    } else {
      newParticipants[index][field] = value;
    }
    setParticipants(newParticipants);
  };

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="card" count={1} />
          <LoadingSkeleton variant="text" />
        </div>
      </MahasiswaLayout>
    );
  }

  if (!data || !data.event) {
    return (
      <MahasiswaLayout>
        <div className="flex items-center justify-center py-20 font-bold text-slate-500">
          Mengarahkan kembali...
        </div>
      </MahasiswaLayout>
    );
  }

  const event = data.event;
  const isFree = event?.tipe_event === "gratis" || event?.harga <= 0;
  const isRegistered = data?.is_registered;

  return (
    <MahasiswaLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/mahasiswa/katalog"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Katalog Event
          </Link>
          {isRegistered && (
            <Badge variant="success" size="sm" dot>
              Telah Terdaftar
            </Badge>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-2/3 space-y-6">
            <Card>
              <div className="h-56 sm:h-72 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                {event.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${getBackendBaseUrl()}/uploads/${event.poster}`}
                    className="w-full h-full object-cover"
                    alt={event.judul}
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                    <i
                      className="bi bi-calendar-event text-6xl text-indigo-300 dark:text-indigo-700"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>

              <CardBody>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="primary" size="sm">
                    {event.tipe_event ? event.tipe_event.toUpperCase() : "EVENT"}
                  </Badge>
                  <Badge variant={isFree ? "info" : "warning"} size="sm">
                    {isFree ? "GRATIS" : `Rp ${Number(event.harga).toLocaleString("id-ID")}`}
                  </Badge>
                  <Badge variant="secondary" size="sm">
                    {event.visibilitas ? event.visibilitas.toUpperCase() : "PUBLIC"}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {event.judul}
                </h2>
              </CardBody>

              <div className="px-5">
                <Tabs
                  tabs={[
                    { id: "info", label: "Informasi Utama", icon: "bi-info-circle" },
                    { id: "form", label: "Formulir Pendaftaran", icon: "bi-ticket-perforated" },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              </div>

              {activeTab === "info" && (
                <CardBody className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                        <i className="bi bi-calendar-event text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                          Jadwal Pelaksanaan
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {new Date(event.tanggal_waktu).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(event.tanggal_waktu).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB - {event.jam_selesai?.slice(0, 5)} WIB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                        <i className="bi bi-geo-alt text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                          Lokasi Event
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">
                          {event.lokasi}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                        <i className="bi bi-person text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                          Penyelenggara
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">
                          {event.ukm_penyelenggara || event.nama_penyelenggara || "BEM / UKM Kampus"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                      Deskripsi Event
                    </h3>
                    <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {event.deskripsi}
                    </div>
                  </div>

                  {data.sponsors?.length > 0 && (
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wide mb-4">
                        Didukung Oleh
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {data.sponsors.map((s: any) => (
                          <div
                            key={s.id}
                            className="w-24 h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`${getBackendBaseUrl()}/uploads/${s.logo}`}
                              alt={s.nama_sponsor}
                              className="max-w-full max-h-full object-contain"
                              title={s.nama_sponsor}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              )}

              {activeTab === "form" && (
                <CardBody className="space-y-6">
                  {isRegistered && (
                    <Callout variant="success" title="Anda sudah memiliki tiket untuk event ini.">
                      Anda tetap dapat membeli tiket tambahan untuk teman atau kerabat menggunakan
                      form di bawah.
                    </Callout>
                  )}

                  <Callout variant="info">
                    Anda dapat mendaftarkan lebih dari satu peserta sekaligus. Pastikan email setiap
                    peserta berbeda jika tiket ingin dikirim masing-masing.
                  </Callout>

                  <form onSubmit={handleRegister} className="space-y-6">
                    {participants.map((p, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 relative shadow-xs"
                      >
                        <div className="flex justify-between items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <i className="bi bi-person text-indigo-500" aria-hidden="true" />
                            Peserta {index + 1}
                          </h4>
                          {participants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParticipant(index)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:text-red-700 text-xs font-bold"
                            >
                              <i className="bi bi-trash" aria-hidden="true" />
                              Hapus
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <Input
                            label="Nama Lengkap"
                            icon="bi-person"
                            value={p.nama_peserta}
                            onChange={(e) =>
                              updateParticipant(index, "nama_peserta", e.target.value)
                            }
                            required
                          />
                          <Input
                            label="Email Aktif"
                            type="email"
                            icon="bi-envelope"
                            value={p.email_peserta}
                            onChange={(e) =>
                              updateParticipant(index, "email_peserta", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="No. WhatsApp"
                            icon="bi-telephone"
                            value={p.telepon_peserta}
                            onChange={(e) =>
                              updateParticipant(index, "telepon_peserta", e.target.value)
                            }
                            required
                          />
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                              Jenis Kelamin
                            </label>
                            <div className="flex gap-3">
                              <label className="flex-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`jk_${index}`}
                                  value="Laki-laki"
                                  checked={p.jenis_kelamin === "Laki-laki"}
                                  onChange={(e) =>
                                    updateParticipant(index, "jenis_kelamin", e.target.value)
                                  }
                                  className="peer sr-only"
                                  required
                                />
                                <div className="text-center py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-950/60 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-300 peer-checked:border-indigo-300 dark:peer-checked:border-indigo-700 transition-colors bg-white dark:bg-slate-900">
                                  Laki-laki
                                </div>
                              </label>
                              <label className="flex-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`jk_${index}`}
                                  value="Perempuan"
                                  checked={p.jenis_kelamin === "Perempuan"}
                                  onChange={(e) =>
                                    updateParticipant(index, "jenis_kelamin", e.target.value)
                                  }
                                  className="peer sr-only"
                                  required
                                />
                                <div className="text-center py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-950/60 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-300 peer-checked:border-indigo-300 dark:peer-checked:border-indigo-700 transition-colors bg-white dark:bg-slate-900">
                                  Perempuan
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>

                        {data.form_fields?.length > 0 && (
                          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
                              Informasi Tambahan
                            </h4>
                            <div className="space-y-4">
                              {data.form_fields.map((f: any) => (
                                <div key={f.id}>
                                  {f.field_type === "select" ? (
                                    <Select
                                      label={f.label}
                                      required={!!f.is_required}
                                      value={p.jawaban_custom[f.id] || ""}
                                      onChange={(e) =>
                                        updateParticipant(index, f.id, e.target.value, true)
                                      }
                                      options={[
                                        { value: "", label: "- Pilih -" },
                                        ...(f.options
                                          ? f.options.split(",").map((opt: string) => ({
                                              value: opt.trim(),
                                              label: opt.trim(),
                                            }))
                                          : []),
                                      ]}
                                    />
                                  ) : (
                                    <Input
                                      label={f.label}
                                      required={!!f.is_required}
                                      placeholder={f.placeholder}
                                      value={p.jawaban_custom[f.id] || ""}
                                      onChange={(e) =>
                                        updateParticipant(index, f.id, e.target.value, true)
                                      }
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addParticipant}
                      className="w-full border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2"
                    >
                      <i className="bi bi-plus-lg" aria-hidden="true" />
                      Tambah Peserta Lain
                    </button>

                    <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">
                          Total Bayar
                        </p>
                        <p className="text-2xl font-black text-amber-400">
                          {isFree
                            ? "Gratis"
                            : `Rp ${(Number(event.harga) * participants.length).toLocaleString(
                                "id-ID"
                              )}`}
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          {participants.length} Peserta Terpilih
                        </p>
                      </div>
                      <Button
                        type="submit"
                        variant="warning"
                        icon="bi-ticket-perforated"
                        loading={submitting}
                        className="font-extrabold"
                      >
                        {submitting ? "Memproses..." : "Bayar Sekarang"}
                      </Button>
                    </div>
                  </form>
                </CardBody>
              )}
            </Card>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="lg:sticky lg:top-20">
              <Card>
                <CardBody>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4 flex items-center gap-2">
                    <i className="bi bi-ticket-perforated text-amber-500" aria-hidden="true" />
                    Ringkasan Tiket
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Jenis Event
                      </span>
                      <Badge variant="secondary" size="sm">
                        {event.tipe_event}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Visibilitas
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">
                        {event.visibilitas}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Total Harga
                      </span>
                      <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {isFree ? "Gratis" : `Rp ${Number(event.harga).toLocaleString("id-ID")}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button
                      variant="primary"
                      icon="bi-ticket-perforated"
                      onClick={() => setActiveTab("form")}
                      className="w-full"
                    >
                      Daftar / Beli Tiket
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
}
