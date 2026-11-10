"use client";
import { getBackendBaseUrl } from "@/lib/axios";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import Swal from "sweetalert2";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Adson {
  id: number;
  nama_barang: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: string | null;
}

export default function KelolaAdsonPage() {
  const params = useParams();
  const { id } = params;
  let decoded_id = id as string;
  if (id) {
    try { decoded_id = atob(decodeURIComponent(id as string)); } catch (e) {}
  }

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [eventData, setEventData] = useState<{ judul?: string } | null>(null);
  const [adsons, setAdsons] = useState<Adson[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [fileGambar, setFileGambar] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    id: null as number | null,
    nama_barang: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    gambar: ""
  });

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const resEvent = await api.get(`/events/${decoded_id}`);
      setEventData(resEvent.data);

      const resAdsons = await api.get(`/adson/${decoded_id}`);
      setAdsons(resAdsons.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Gagal mengambil data adson.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const handleOpenModal = (adson: Adson | null = null) => {
    if (adson) {
      setIsEditing(true);
      setFormData({
        id: adson.id,
        nama_barang: adson.nama_barang,
        deskripsi: adson.deskripsi || "",
        harga: adson.harga,
        stok: adson.stok,
        gambar: adson.gambar || ""
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        nama_barang: "",
        deskripsi: "",
        harga: 0,
        stok: 0,
        gambar: ""
      });
    }
    setFileGambar(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setFileGambar(file);
          // Preview local image
          setFormData({
              ...formData,
              gambar: URL.createObjectURL(file)
          });
      }
  };

  const handleSaveAdson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('nama_barang', formData.nama_barang);
      submitData.append('deskripsi', formData.deskripsi);
      submitData.append('harga', String(formData.harga));
      submitData.append('stok', String(formData.stok));
      if (fileGambar) submitData.append('gambar', fileGambar);

      if (isEditing && formData.id) {
        await api.put(`/adson/${formData.id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Barang adson berhasil diperbarui.',
          confirmButtonColor: '#4f46e5',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post(`/adson/${decoded_id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Barang adson berhasil ditambahkan.',
          confirmButtonColor: '#4f46e5',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan data.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAdson = async (adsonId: number) => {
    const result = await Swal.fire({
      title: 'Hapus Barang?',
      text: "Barang ini akan dihapus dari daftar adson Anda secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/adson/${adsonId}`);
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Barang adson berhasil dihapus.',
          confirmButtonColor: '#4f46e5',
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menghapus data.',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  return (
    <DashboardLayout
      user={user}
      title="Kelola Adson"
      subtitle={`Souvenir & penjualan untuk event: ${eventData?.judul ?? "Memuat..."}`}
      links={[]}
      onLogout={() => {}}
    >
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Souvenir &amp; Penjualan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Atur barang tambahan (Adson) yang bisa dibeli peserta.
            </p>
          </div>
          <Button icon="bi-plus-lg" onClick={() => handleOpenModal()}>
            Tambah Barang
          </Button>
        </div>

        {loading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : adsons.length === 0 ? (
          <EmptyState
            icon="bi-gift"
            title="Belum Ada Adson"
            message='Anda belum menambahkan barang/souvenir apapun untuk event ini. Klik "Tambah Barang" untuk memulai.'
            action={
              <Button icon="bi-plus-lg" onClick={() => handleOpenModal()}>
                Tambah Barang
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {adsons.map((adson) => (
              <Card key={adson.id} className="flex flex-col">
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {adson.gambar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={adson.gambar.startsWith('blob:') ? adson.gambar : `${getBackendBaseUrl()}${adson.gambar}`} alt={adson.nama_barang} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <i className="bi bi-image text-3xl mb-2 opacity-60" aria-hidden="true" />
                      <span className="text-xs font-semibold uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon="bi-pencil-square"
                      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs"
                      onClick={() => handleOpenModal(adson)}
                      aria-label="Edit barang"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon="bi-trash"
                      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border-red-200 text-red-600 dark:border-red-900/60 dark:text-red-400"
                      onClick={() => handleDeleteAdson(adson.id)}
                      aria-label="Hapus barang"
                    />
                  </div>
                </div>

                <CardBody className="flex flex-col flex-grow">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1 line-clamp-1" title={adson.nama_barang}>
                    {adson.nama_barang}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-grow mb-4">
                    {adson.deskripsi || "Tidak ada deskripsi."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                      <i className="bi bi-cash-coin text-base" aria-hidden="true" />
                      <span className="font-bold text-base">Rp {adson.harga.toLocaleString('id-ID')}</span>
                    </div>
                    <Badge variant="info" size="sm">
                      Stok: {adson.stok}
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditing ? 'Edit Barang Adson' : 'Tambah Barang Baru'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                form="adson-form"
                loading={saveLoading}
                icon="bi-save"
              >
                Simpan Barang
              </Button>
            </>
          }
        >
          <form id="adson-form" onSubmit={handleSaveAdson} className="space-y-4">
            <Input
              label="Nama Barang"
              required
              value={formData.nama_barang}
              onChange={e => setFormData({...formData, nama_barang: e.target.value})}
              placeholder="Contoh: T-Shirt Event, Tumbler"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Deskripsi Barang
              </label>
              <textarea
                rows={3}
                value={formData.deskripsi}
                onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                className="block w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors resize-none"
                placeholder="Jelaskan detail barang ini..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Harga (Rp)"
                type="number"
                min="0"
                required
                value={formData.harga}
                onChange={e => setFormData({...formData, harga: Number(e.target.value)})}
              />
              <Input
                label="Stok Awal"
                type="number"
                min="0"
                required
                value={formData.stok}
                onChange={e => setFormData({...formData, stok: Number(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Upload Gambar Barang (Opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 file:font-semibold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 cursor-pointer"
              />
              {formData.gambar && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.gambar.startsWith('blob:') ? formData.gambar : `${getBackendBaseUrl()}${formData.gambar}`} alt="Preview" className="h-24 w-auto rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                </div>
              )}
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
