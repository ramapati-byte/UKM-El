"use client";
import { getBackendBaseUrl } from "@/lib/axios";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import ConflictCallout from "@/components/events/ConflictCallout";
import RoomSelect from "@/components/events/RoomSelect";
import { useEventConflict } from "@/hooks/useEventConflict";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
  CardTools,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Callout from "@/components/ui/Callout";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function EditEventPage() {
  const params = useParams();
  const { id } = params;

  let decoded_id = id as string;
  if (id) {
    try { decoded_id = atob(decodeURIComponent(id as string)); } catch (e) {}
  }

  const [user, setUser] = useState<{ name: string; email: string; role: string; ukm?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [roomId, setRoomId] = useState("");

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    type: "gratis",
    is_public: "public",
    price: 0,
    enable_penalty: false,
    penalty_fee: 0,
    maksimal_peserta: 0,
  });

  // Validasi bentrok jadwal & ruangan otomatis
  const conflictReq = eventData.start_date
    ? {
        starts_at: eventData.start_date,
        ends_at: eventData.end_date || null,
        room_id: roomId || null,
        ukm_id: user?.ukm || "ukm-bem",
        exclude_event_id: Number(decoded_id) || undefined,
      }
    : null;
  const { result: conflictResult } = useEventConflict(conflictReq, 350);

  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  interface SponsorInput {
    id?: number;
    nama: string;
    logo: File | null;
    logoPreview: string | null;
    logo_lama?: string;
  }
  const [sponsors, setSponsors] = useState<SponsorInput[]>([]);

  const handleAddSponsor = () => {
    setSponsors([...sponsors, { nama: "", logo: null, logoPreview: null }]);
  };

  const handleSponsorNameChange = (index: number, val: string) => {
    const newSponsors = [...sponsors];
    newSponsors[index].nama = val;
    setSponsors(newSponsors);
  };

  const handleSponsorLogoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newSponsors = [...sponsors];
      newSponsors[index].logo = file;
      newSponsors[index].logoPreview = URL.createObjectURL(file);
      setSponsors(newSponsors);
    }
  };

  const handleRemoveSponsor = (index: number) => {
    setSponsors(sponsors.filter((_, idx) => idx !== index));
  };

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

  // Fetch Event Data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${decoded_id}`);
        const data = res.data;

        const formatDateTime = (dateStr: string) => {
            if (!dateStr) return "";
            // Convert to YYYY-MM-DDThh:mm format for datetime-local
            const d = new Date(dateStr);
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        setEventData({
          title: data.judul || "",
          description: data.deskripsi || "",
          start_date: formatDateTime(data.tanggal_waktu),
          end_date: formatDateTime(data.jam_selesai),
          location: data.lokasi || "",
          type: data.tipe_event || "gratis",
          is_public: data.visibilitas || "public",
          price: data.harga || 0,
          enable_penalty: !!(data.jam_selesai && data.nominal_denda > 0),
          penalty_fee: data.nominal_denda || 0,
          maksimal_peserta: data.maksimal_peserta || 0,
        });

        if (data.poster) {
            setPosterPreview(`${getBackendBaseUrl()}/uploads/${data.poster}`);
        }

        if (data.sponsors && Array.isArray(data.sponsors)) {
            setSponsors(data.sponsors.map((sp: { id?: number; nama_sponsor?: string; logo?: string }) => ({
                id: sp.id,
                nama: sp.nama_sponsor || "",
                logo: null,
                logoPreview: sp.logo ? `${getBackendBaseUrl()}/uploads/${sp.logo}` : null,
                logo_lama: sp.logo || "",
            })));
        }
      } catch (err) {
        setError("Gagal memuat data event.");
      } finally {
        setFetchLoading(false);
      }
    };
    if (decoded_id) fetchEvent();
  }, [decoded_id]);

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setEventData({ ...eventData, [name]: target.checked });
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("judul", eventData.title);
      formData.append("deskripsi", eventData.description);
      formData.append("tanggal_waktu", eventData.start_date.replace("T", " ") + ":00");
      if (eventData.enable_penalty && eventData.end_date) {
        formData.append("jam_selesai", eventData.end_date.replace("T", " ") + ":00");
      }
      formData.append("lokasi", eventData.location);
      formData.append("visibilitas", eventData.is_public);
      formData.append("tipe_event", eventData.type);
      formData.append("harga", eventData.type === 'berbayar' ? eventData.price.toString() : "0");
      formData.append("nominal_denda", eventData.enable_penalty ? eventData.penalty_fee.toString() : "0");
      formData.append("maksimal_peserta", eventData.maksimal_peserta.toString());

      if (posterFile) {
        formData.append("poster", posterFile);
      }

      // Map sponsors for JSON representation
      let logoFileIndex = 0;
      const sponsorsData = sponsors.map(s => {
        const hasNewLogo = !!s.logo;
        const logoIndex = hasNewLogo ? logoFileIndex++ : -1;
        return {
          id: s.id,
          nama: s.nama,
          has_new_logo: hasNewLogo,
          logo_index: logoIndex,
          logo_lama: s.logo_lama || ""
        };
      });

      formData.append("sponsors", JSON.stringify(sponsorsData));

      // Append actual files
      sponsors.forEach(s => {
        if (s.logo) {
          formData.append("sponsor_logos", s.logo);
        }
      });

      await api.put(`/events/${decoded_id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess(true);
      setTimeout(() => { window.location.href = "/organizer/events"; }, 2000);

    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || "Terjadi kesalahan saat menyimpan event.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <DashboardLayout
        user={user}
        title="Edit Event"
        subtitle="Perbarui informasi detail event Anda."
        links={[]}
        onLogout={() => {}}
      >
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="table" rows={6} />
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout
        user={user}
        title="Edit Event"
        subtitle="Perbarui informasi detail event Anda."
        links={[]}
        onLogout={() => {}}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="max-w-md w-full">
            <CardBody className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 text-3xl">
                <i className="bi bi-check-circle-fill" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Tersimpan!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Event berhasil diperbarui. Mengarahkan ke halaman Kelola Event...
              </p>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={user}
      title="Edit Event"
      subtitle={`Perbarui informasi detail event${eventData.title ? `: ${eventData.title}` : " Anda"}.`}
      links={[]}
      onLogout={() => {}}
    >
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Informasi Event
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Perbarui detail, tiket, poster, dan sponsor event.
            </p>
          </div>
          <Link
            href="/organizer/events"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Kembali
          </Link>
        </div>

        {error && (
          <Callout variant="danger" title="Terjadi Kesalahan" icon="bi-exclamation-circle-fill">
            {error}
          </Callout>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Informasi Utama */}
          <Card>
            <CardHeader>
              <CardTitle icon="bi-info-circle">Informasi Utama</CardTitle>
            </CardHeader>

            <CardBody className="space-y-5">
              <Input
                label="Judul Event"
                name="title"
                required
                value={eventData.title}
                onChange={handleEventChange}
                placeholder="Nama event"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi Lengkap
                </label>
                <textarea
                  name="description"
                  rows={5}
                  required
                  value={eventData.description}
                  onChange={handleEventChange}
                  className="block w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Waktu Mulai"
                  type="datetime-local"
                  name="start_date"
                  required
                  value={eventData.start_date}
                  onChange={handleEventChange}
                />
                <div className="space-y-3">
                  <RoomSelect
                    value={roomId}
                    onChange={(selectedId, selectedName) => {
                      setRoomId(selectedId);
                      if (selectedName) {
                        setEventData((prev) => ({ ...prev, location: selectedName }));
                      }
                    }}
                  />
                  <Input
                    type="text"
                    name="location"
                    required
                    value={eventData.location}
                    onChange={handleEventChange}
                    placeholder="Atau ketik nama lokasi/link..."
                  />
                </div>
              </div>

              {/* Peringatan Bentrok Jadwal / Ruangan (Peringatan Saja) */}
              {conflictResult.has_conflict && (
                <ConflictCallout result={conflictResult} />
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Visibilitas
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="cursor-pointer relative">
                    <input type="radio" name="is_public" value="public" checked={eventData.is_public === 'public'} onChange={handleEventChange} className="peer sr-only" />
                    <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 dark:peer-checked:bg-indigo-950/30 transition-all">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        <i className="bi bi-globe2 text-indigo-600" aria-hidden="true" />
                        Publik
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        Ditampilkan ke semua orang di halaman depan.
                      </span>
                    </div>
                  </label>
                  <label className="cursor-pointer relative">
                    <input type="radio" name="is_public" value="internal" checked={eventData.is_public === 'internal'} onChange={handleEventChange} className="peer sr-only" />
                    <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 dark:peer-checked:bg-indigo-950/30 transition-all">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        <i className="bi bi-lock text-indigo-600" aria-hidden="true" />
                        Internal
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        Hanya untuk orang yang memiliki akun dan login.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <Input
                label="Maksimal Peserta"
                type="number"
                name="maksimal_peserta"
                min="0"
                value={eventData.maksimal_peserta}
                onChange={handleEventChange}
                placeholder="0 (Kosongkan atau isi 0 jika tidak ada batasan)"
                helper="Isi 0 jika tidak ada batasan kapasitas untuk event ini."
              />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center cursor-pointer mb-4 w-fit">
                  <div className="relative">
                    <input type="checkbox" name="enable_penalty" checked={eventData.enable_penalty} onChange={handleEventChange} className="sr-only peer" />
                    <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Aktifkan Denda Absensi
                  </span>
                </label>

                {eventData.enable_penalty && (
                  <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Batas Akhir (Jam Selesai)"
                        type="datetime-local"
                        name="end_date"
                        required={eventData.enable_penalty}
                        value={eventData.end_date}
                        onChange={handleEventChange}
                      />
                      <Input
                        label="Nominal Denda (Rp)"
                        type="number"
                        name="penalty_fee"
                        required={eventData.enable_penalty}
                        min="0"
                        value={eventData.penalty_fee}
                        onChange={handleEventChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* SECTION 2: Tiket & Harga */}
          <Card>
            <CardHeader>
              <CardTitle icon="bi-ticket-perforated">Tiket &amp; Harga</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Jenis Event"
                  name="type"
                  value={eventData.type}
                  onChange={handleEventChange}
                  options={[
                    { value: "gratis", label: "Gratis" },
                    { value: "berbayar", label: "Berbayar" },
                  ]}
                />
                {eventData.type === 'berbayar' && (
                  <Input
                    label="Harga Tiket (Rp)"
                    type="number"
                    name="price"
                    required={eventData.type === 'berbayar'}
                    min="0"
                    value={eventData.price}
                    onChange={handleEventChange}
                    placeholder="Contoh: 50000"
                  />
                )}
              </div>
            </CardBody>
          </Card>

          {/* SECTION 3: Media & Sertifikat */}
          <Card>
            <CardHeader>
              <CardTitle icon="bi-image">Media Poster</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Poster Event
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Format: JPG/PNG. Maks 2MB.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${posterPreview ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {posterPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={posterPreview} alt="Preview" className="h-40 w-auto rounded-lg object-contain shadow-md" />
                      ) : (
                        <>
                          <i className="bi bi-image text-3xl mb-3 text-slate-400" aria-hidden="true" />
                          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span className="text-indigo-600 dark:text-indigo-400">Klik untuk upload</span> atau drag and drop
                          </p>
                          <p className="text-xs text-slate-400 font-medium">PNG, JPG or GIF</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* SECTION 4: Sponsor Event */}
          <Card>
            <CardHeader>
              <CardTitle icon="bi-hand-thumbs-up">Sponsor Event</CardTitle>
              <CardTools>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon="bi-plus-lg"
                  onClick={handleAddSponsor}
                >
                  Tambah Sponsor
                </Button>
              </CardTools>
            </CardHeader>

            <CardBody className="space-y-4">
              {sponsors.length === 0 ? (
                <EmptyState
                  icon="bi-hand-thumbs-up"
                  title="Belum ada sponsor event"
                  message='Klik tombol "Tambah Sponsor" di atas untuk mulai menambahkan logo dan nama sponsor.'
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon="bi-plus-lg"
                      onClick={handleAddSponsor}
                    >
                      Tambah Sponsor
                    </Button>
                  }
                />
              ) : (
                sponsors.map((sp, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-4 md:items-end bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex-1 w-full">
                      <Input
                        label="Nama Sponsor"
                        required
                        value={sp.nama}
                        onChange={(e) => handleSponsorNameChange(idx, e.target.value)}
                        placeholder="Contoh: PT. Sponsor Abadi"
                      />
                    </div>
                    <div className="flex-grow w-full md:max-w-md">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Logo Sponsor <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        {sp.logoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sp.logoPreview} alt="Logo preview" className="h-11 w-11 object-contain rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 shrink-0" />
                        ) : (
                          <div className="h-11 w-11 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                            <i className="bi bi-image" aria-hidden="true" />
                          </div>
                        )}
                        <input
                          type="file"
                          required={!sp.logo_lama && !sp.logoPreview}
                          accept="image/*"
                          onChange={(e) => handleSponsorLogoChange(idx, e)}
                          className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 file:font-semibold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 cursor-pointer"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon="bi-trash"
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 shrink-0"
                      onClick={() => handleRemoveSponsor(idx)}
                      aria-label="Hapus sponsor"
                    />
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              icon="bi-save"
              size="lg"
            >
              {loading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
