"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Search, ChevronLeft, ChevronRight,
  MapPin, Globe, Lock, ChevronDown, Edit3, FileText,
  HelpCircle, BarChart2, Users, QrCode, Download, Trash2, Plus, Image as ImageIcon,
  Loader2, MessageSquare
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

interface Workshop {
  id: number;
  judul: string;
  deskripsi: string;
  poster: string | null;
  tanggal_waktu: string;
  lokasi: string;
  visibilitas: 'public' | 'internal';
  tipe_event: 'gratis' | 'berbayar';
  status: 'draft' | 'approved' | 'rejected';
  total_participants: number;
}

interface Pagination {
  total_records: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

export default function KelolaEventPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [events, setEvents] = useState<Workshop[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (openDropdownId === null) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest("[data-dropdown-container]")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdownId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/manage?search=${searchTerm}&page=${currentPage}&limit=10`);
      setEvents(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Gagal mengambil data event", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Implement debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage]);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus event ini? Semua data pendaftaran terkait juga akan terhapus.")) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
      } catch (err) {
        alert("Gagal menghapus event.");
      }
    }
  };

  const navLinks = [
    { href: "/organizer/dashboard", icon: <Calendar className="w-5 h-5" />, label: "Dashboard" },
    { href: "/organizer/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola Event", active: true },
    { href: "/organizer/pendaftar", icon: <Users className="w-5 h-5" />, label: "Kelola Pendaftar" },
    { href: "/organizer/tim", icon: <Users className="w-5 h-5" />, label: "Kelola Tim" },
    { href: "/organizer/diskusi", icon: <MessageSquare className="w-5 h-5" />, label: "Diskusi Kelas" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const formatTanggal = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatJam = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  return (
    <DashboardLayout
      user={user}
      title=""
      subtitle=""
      links={navLinks}
      onLogout={handleLogout}
    >
      <div className="pb-20">

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl -mx-4 md:-mx-8 -mt-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl" />

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="w-full text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-semibold tracking-wide uppercase text-indigo-100">Manajemen Event</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
                Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Event</span>
              </h1>
              <p className="text-indigo-100/80 text-sm md:text-base max-w-xl leading-relaxed">
                Atur jadwal, pantau pendaftaran, dan kelola materi event Anda dalam satu tampilan.
              </p>
            </div>
            <div className="flex justify-start md:justify-end shrink-0">
              <Link href="/organizer/create-event"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105"
              >
                <Plus className="w-6 h-6" /> <span>Buat Event Baru</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-6">
          {/* Search & Filter Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Ketik judul event untuk mencari..."
                className="block w-full pl-11 pr-10 py-4 bg-slate-50 border-transparent text-slate-900 placeholder-slate-400 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {loading && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
              </div>
            </div>
          </div>



          {/* Container Data */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-visible">
            <div className="hidden md:block max-md:overflow-x-auto min-h-[400px] pb-10">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-5 rounded-tl-3xl">Detail Event</th>
                    <th className="px-6 py-5">Waktu & Tempat</th>
                    <th className="px-6 py-5 text-center">Visibilitas</th>
                    <th className="px-6 py-5 text-center">Kategori</th>
                    <th className="px-6 py-5 text-center">Persetujuan</th>
                    <th className="px-6 py-5 text-center rounded-tr-3xl">Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!loading && events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                        Tidak ada event ditemukan.
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.id} className={`hover:bg-indigo-50/40 transition-colors duration-200 group relative ${openDropdownId === event.id ? 'z-50' : 'z-0'}`}>
                        {/* Kolom Event */}
                        <td className="px-6 py-5">
                          <div className="flex gap-4 items-center">
                            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg shadow-md border border-gray-200 group-hover:shadow-lg transition-all">
                              {event.poster ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={`${getBackendBaseUrl()}/uploads/${event.poster}`} alt="poster" className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                  <ImageIcon className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-indigo-700 transition-colors">
                                {event.judul}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                                {event.deskripsi?.substring(0, 50)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Kolom Jadwal */}
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-sm text-gray-700 font-medium">
                              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                              {formatTanggal(event.tanggal_waktu)}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 ml-6">
                              {formatJam(event.tanggal_waktu)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                              <span className="truncate max-w-[150px]" title={event.lokasi}>
                                {event.lokasi}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Kolom Visibilitas */}
                        <td className="px-6 py-5 text-center text-xs">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${event.visibilitas === 'public' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                            {event.visibilitas === 'public' ? <Globe className="w-3.5 h-3.5 mr-1" /> : <Lock className="w-3.5 h-3.5 mr-1" />}
                            {event.visibilitas === 'public' ? 'Public' : 'Internal'}
                          </span>
                        </td>

                        {/* Kolom Tipe */}
                        <td className="px-6 py-5 text-center text-xs">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${event.tipe_event === 'berbayar' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                            {event.tipe_event === 'berbayar' ? 'Berbayar' : 'Gratis'}
                          </span>
                        </td>

                        {/* Kolom Persetujuan */}
                        <td className="px-6 py-5 text-center text-xs">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${event.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              event.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                            {event.status === 'approved' ? 'Disetujui' :
                              event.status === 'rejected' ? 'Ditolak' :
                                'Pending (Draft)'}
                          </span>
                        </td>

                        {/* Kolom Aksi */}
                        <td className="px-6 py-5 text-center">
                          <div className="relative inline-block text-left" data-dropdown-container>
                            <button
                              type="button"
                              onClick={() => setOpenDropdownId(openDropdownId === event.id ? null : event.id)}
                              className="inline-flex justify-center items-center w-full rounded-lg border border-gray-200 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                            >
                              Menu <ChevronDown className={`w-4 h-4 ml-2 mt-0.5 transition-transform ${openDropdownId === event.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu - Menimpa Tabel secara Absolute */}
                            {openDropdownId === event.id && (
                              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 z-50">
                                <div className="p-1">
                                  <Link
                                    href={`/organizer/events/edit/${btoa(event.id.toString())}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full group flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4 mr-3 text-gray-400 group-hover:text-indigo-500" /> Edit Event
                                  </Link>
                                  <Link
                                    href={`/organizer/events/form/${btoa(event.id.toString())}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full group flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                  >
                                    <FileText className="w-4 h-4 mr-3 text-gray-400 group-hover:text-indigo-500" /> Atur Form
                                  </Link>
                                  <Link
                                    href={`/organizer/events/kuesioner/${btoa(event.id.toString())}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full group flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                  >
                                    <HelpCircle className="w-4 h-4 mr-3 text-gray-400 group-hover:text-indigo-500" /> Kuesioner
                                  </Link>
                                  <Link
                                    href={`/organizer/events/hasil-kuesioner/${btoa(event.id.toString())}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full group flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                  >
                                    <BarChart2 className="w-4 h-4 mr-3 text-gray-400 group-hover:text-indigo-500" /> Hasil Kuesioner
                                  </Link>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <Link
                                    href={`/organizer/events/adson/${btoa(event.id.toString())}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full group flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                  >
                                    <span className="w-4 h-4 mr-3 flex items-center justify-center text-lg">🎁</span> Kelola Adson
                                  </Link>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <Link
                                    href={`/organizer/events/sertifikat/${btoa(event.id.toString())}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full group flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                  >
                                    <Download className="w-4 h-4 mr-3 text-gray-400 group-hover:text-indigo-500" /> Sertifikat
                                  </Link>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button
                                    type="button"
                                    onClick={() => { setOpenDropdownId(null); handleDelete(event.id); }}
                                    className="w-full text-left group flex items-center px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-600" /> Hapus Event
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {!loading && events.length === 0 ? (
                <div className="py-12 text-center text-gray-500 font-medium text-sm">
                  Tidak ada event ditemukan.
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4 relative">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg shadow-sm border border-gray-200">
                        {event.poster ? (
                          <img src={`${getBackendBaseUrl()}/uploads/${event.poster}`} alt="poster" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm mb-1 leading-tight">{event.judul}</h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${event.visibilitas === 'public' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {event.visibilitas === 'public' ? 'Public' : 'Internal'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${event.tipe_event === 'berbayar' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {event.tipe_event === 'berbayar' ? 'Berbayar' : 'Gratis'}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${event.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : event.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                          {event.status === 'approved' ? 'Disetujui' : event.status === 'rejected' ? 'Ditolak' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500 shrink-0" />
                        <span>{formatTanggal(event.tanggal_waktu)} • {formatJam(event.tanggal_waktu)}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-indigo-500 shrink-0" />
                        <span className="truncate">{event.lokasi}</span>
                      </div>
                    </div>
                    <div className="relative" data-dropdown-container>
                      <button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === event.id ? null : event.id)}
                        className="w-full flex justify-center items-center rounded-lg border border-gray-200 px-4 py-2 bg-white text-xs font-bold text-gray-700 hover:bg-slate-50 transition-colors"
                      >
                        Menu Kontrol <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${openDropdownId === event.id ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdownId === event.id && (
                        <div className="absolute right-0 bottom-full mb-2 w-full sm:w-56 rounded-xl shadow-xl bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 z-50">
                          <div className="p-1">
                            <Link
                              href={`/organizer/events/edit/${btoa(event.id.toString())}`}
                              onClick={() => setOpenDropdownId(null)}
                              className="w-full flex items-center px-3 py-2 text-xs text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Event
                            </Link>
                            <Link
                              href={`/organizer/events/form/${btoa(event.id.toString())}`}
                              onClick={() => setOpenDropdownId(null)}
                              className="w-full flex items-center px-3 py-2 text-xs text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 mr-2" /> Atur Form
                            </Link>
                            <Link
                              href={`/organizer/events/kuesioner/${btoa(event.id.toString())}`}
                              onClick={() => setOpenDropdownId(null)}
                              className="w-full flex items-center px-3 py-2 text-xs text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5 mr-2" /> Kuesioner
                            </Link>
                            <Link
                              href={`/organizer/events/hasil-kuesioner/${btoa(event.id.toString())}`}
                              onClick={() => setOpenDropdownId(null)}
                              className="w-full flex items-center px-3 py-2 text-xs text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              <BarChart2 className="w-3.5 h-3.5 mr-2" /> Hasil Kuesioner
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <Link
                              href={`/organizer/events/adson/${btoa(event.id.toString())}`}
                              onClick={() => setOpenDropdownId(null)}
                              className="w-full flex items-center px-3 py-2 text-xs text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              <span className="w-3.5 h-3.5 mr-2 flex items-center justify-center text-sm">🎁</span> Kelola Adson
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <Link
                              href={`/organizer/events/sertifikat/${btoa(event.id.toString())}`}
                              onClick={() => setOpenDropdownId(null)}
                              className="w-full flex items-center px-3 py-2 text-xs text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 mr-2" /> Sertifikat
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              type="button"
                              onClick={() => { setOpenDropdownId(null); handleDelete(event.id); }}
                              className="w-full text-left flex items-center px-3 py-2 text-xs text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Hapus Event
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Footer */}
            {pagination && pagination.total_pages > 1 && (
              <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 rounded-b-2xl">
                <span className="text-sm text-gray-500 font-medium">
                  Halaman {pagination.current_page} dari {pagination.total_pages} (Total {pagination.total_records} Event)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-40 transition-all shadow-sm bg-white"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(pagination.total_pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
                    disabled={currentPage === pagination.total_pages}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-40 transition-all shadow-sm bg-white"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}