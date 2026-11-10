"use client";
import { getBackendBaseUrl } from "@/lib/axios";

import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
  CardTools,
} from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";

interface Event {
  id: number;
  judul: string;
  poster: string | null;
  tanggal_waktu: string;
}

interface Material {
  id: number;
  workshop_id: number;
  judul_materi: string;
  deskripsi: string | null;
  nama_file: string;
  uploaded_at: string;
}

interface SessionUser {
  id?: number;
  user_id?: number;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface ChatMessage {
  id: number;
  user_id: number;
  user_type: string;
  nama_pengirim: string;
  message: string;
  created_at: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function OrganizerDiskusiPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Chat state
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Materials state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form Fields
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      setUser(
        stored
          ? JSON.parse(stored)
          : { id: 2, name: "BEM El Rahma", email: "bem@elrahma.ac.id", role: "penyelenggara" }
      );
    }
  }, []);

  // Load organizer events
  const fetchEvents = async () => {
    try {
      const res = await api.get("/discussion/organizer/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Gagal memuat event diskusi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch chats and materials
  const fetchChatsAndMaterials = async (eventId: string) => {
    try {
      const chatRes = await api.get(`/discussion/messages/${eventId}`);
      setChats(chatRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async (eventId: string) => {
    try {
      setLoadingMaterials(true);
      const matRes = await api.get(`/discussion/materials/${eventId}`);
      setMaterials(matRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      setLoadingChat(true);
      fetchChatsAndMaterials(selectedEventId);
      fetchMaterials(selectedEventId);
      setLoadingChat(false);

      const interval = setInterval(() => {
        fetchChatsAndMaterials(selectedEventId);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedEventId]);

  // Scroll to bottom when new chat arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedEventId) return;

    setSendingChat(true);
    try {
      await api.post(`/discussion/messages/${selectedEventId}`, { message: chatMessage });
      setChatMessage("");
      const res = await api.get(`/discussion/messages/${selectedEventId}`);
      setChats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
    }
  };

  // Upload Material
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !uploadTitle || !uploadFile) {
      Swal.fire("Peringatan", "Mohon lengkapi judul materi dan pilih berkas file!", "warning");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("judul_materi", uploadTitle);
      formData.append("deskripsi", uploadDesc);
      formData.append("materi_file", uploadFile);

      await api.post(`/discussion/materials/${selectedEventId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire({ icon: "success", title: "Berhasil!", text: "Materi event berhasil diunggah.", timer: 1500, showConfirmButton: false });

      // Reset Form
      setUploadTitle("");
      setUploadDesc("");
      setUploadFile(null);
      setIsUploadOpen(false);

      // Refresh Materials
      fetchMaterials(selectedEventId);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      console.error(err);
      Swal.fire("Gagal", apiErr.response?.data?.message || "Terjadi kesalahan saat mengunggah materi.", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: "Hapus materi ini?",
      text: "Materi akan dihapus permanen dari server dan tidak dapat diakses mahasiswa lagi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await api.delete(`/discussion/materials/${id}`);
      Swal.fire({ icon: "success", title: "Terhapus!", text: "Materi berhasil dihapus.", timer: 1500, showConfirmButton: false });
      if (selectedEventId) fetchMaterials(selectedEventId);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      console.error(err);
      Swal.fire("Gagal", apiErr.response?.data?.message || "Gagal menghapus materi.", "error");
    }
  };

  const selectedEvent = events.find(e => e.id.toString() === selectedEventId);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <DashboardLayout
        user={user as { name: string; email: string; role: string } | null}
        title="Diskusi Kelas & Materi"
        subtitle="Interaksi dengan peserta dan bagikan materi untuk setiap event."
        links={[]}
        onLogout={handleLogout}
      >
        <LoadingSkeleton variant="table" rows={5} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={user as { name: string; email: string; role: string } | null}
      title="Diskusi Kelas & Materi"
      subtitle="Interaksi dengan peserta dan bagikan materi untuk setiap event."
      links={[]}
      onLogout={handleLogout}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 lg:h-[calc(100vh-14rem)] lg:min-h-[600px]">
        {/* Left Sidebar: Event List */}
        <Card
          className={`${
            selectedEventId ? "hidden lg:flex" : "flex"
          } lg:col-span-4 xl:col-span-3 flex-col min-h-0 max-h-[70vh] lg:max-h-none`}
        >
          <CardHeader>
            <CardTitle icon="bi-chat-dots">Ruang Diskusi UKM</CardTitle>
          </CardHeader>

          <CardBody className="p-0 flex-1 overflow-y-auto min-h-0">
            {events.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((e: Event) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEventId(e.id.toString())}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-3 ${
                      selectedEventId === e.id.toString()
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-r-4 border-indigo-600"
                        : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center text-slate-400">
                      {e.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${getBackendBaseUrl()}/uploads/${e.poster}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="bi bi-calendar-event text-lg" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-xs truncate ${
                          selectedEventId === e.id.toString()
                            ? "text-indigo-800 dark:text-indigo-300"
                            : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {e.judul}
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(e.tanggal_waktu).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState
                  icon="bi-chat-square-text"
                  title="Belum ada event diskusi"
                  message="Event yang Anda kelola akan muncul di sini sebagai ruang diskusi."
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Center Content: Chat Room */}
        <Card
          className={`${
            !selectedEventId ? "hidden lg:flex" : "flex"
          } lg:col-span-8 xl:col-span-6 flex-col min-h-0 h-[70vh] lg:h-auto`}
        >
          {!selectedEventId ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-md">
                <EmptyState
                  icon="bi-chat-dots"
                  title="Pilih Kelas Diskusi"
                  message="Pilih salah satu event yang Anda kelola untuk memulai diskusi dan mengunggah materi."
                />
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <CardHeader>
                <div className="flex items-center gap-3 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-arrow-left"
                    className="lg:hidden"
                    onClick={() => setSelectedEventId(null)}
                    aria-label="Kembali ke daftar event"
                  />
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center text-slate-400">
                    {selectedEvent?.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${getBackendBaseUrl()}/uploads/${selectedEvent.poster}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="bi bi-calendar-event text-lg" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug truncate">
                      {selectedEvent?.judul}
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Interaksi Publik & Mahasiswa Terdaftar
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
                {loadingChat ? (
                  <LoadingSkeleton variant="text" />
                ) : chats.length === 0 ? (
                  <EmptyState
                    icon="bi-chat-square-dots"
                    title="Belum ada obrolan"
                    message="Belum ada obrolan di kelas ini. Sapa mahasiswa Anda!"
                  />
                ) : (
                  chats.map((c: ChatMessage) => {
                    const isMe = c.user_id === user?.id && c.user_type === "admin";
                    const isMhs = c.user_type === "mahasiswa";
                    return (
                      <div key={c.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1 mx-1 flex items-center gap-1.5">
                          {isMe ? "Anda (Penyelenggara)" : c.nama_pengirim}
                          {!isMhs && !isMe && (
                            <Badge variant="primary" size="sm">
                              Admin/Panitia
                            </Badge>
                          )}
                        </span>
                        <div
                          className={`px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-[70%] text-xs shadow-xs leading-relaxed ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none"
                          }`}
                        >
                          {c.message}
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 mx-1">
                          {new Date(c.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={sendChat} className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-end gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Tulis instruksi atau sapa forum..."
                    icon="bi-chat-left-text"
                  />
                  <Button
                    type="submit"
                    size="md"
                    icon="bi-send"
                    loading={sendingChat}
                    disabled={sendingChat || !chatMessage.trim()}
                    className="!px-3 shrink-0"
                    aria-label="Kirim pesan"
                  />
                </div>
              </form>
            </>
          )}
        </Card>

        {/* Right Sidebar: Materials Upload & List */}
        {selectedEventId && (
          <Card className="lg:col-span-12 xl:col-span-3 flex flex-col min-h-0 max-h-[70vh] lg:max-h-none">
            <CardHeader>
              <CardTitle icon="bi-file-earmark-text">Materi & File</CardTitle>
              <CardTools>
                <Button
                  variant="outline"
                  size="sm"
                  icon={isUploadOpen ? "bi-x-lg" : "bi-plus-lg"}
                  onClick={() => setIsUploadOpen(!isUploadOpen)}
                  aria-label="Unggah materi"
                />
              </CardTools>
            </CardHeader>

            <CardBody className="p-4 flex-1 overflow-y-auto min-h-0">
              {loadingMaterials ? (
                <LoadingSkeleton variant="text" />
              ) : materials.length === 0 ? (
                <EmptyState
                  icon="bi-file-earmark-arrow-up"
                  title="Belum ada materi"
                  message="Gunakan tombol + di atas untuk mengunggah PDF/file materi."
                />
              ) : (
                <div className="space-y-3">
                  {materials.map((m: Material) => (
                    <div
                      key={m.id}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex items-start gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <i className="bi bi-file-earmark-arrow-down" aria-hidden="true" />
                      </div>

                      <div className="flex-grow min-w-0">
                        <h4
                          className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate"
                          title={m.judul_materi}
                        >
                          {m.judul_materi}
                        </h4>
                        {m.deskripsi ? (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {m.deskripsi}
                          </p>
                        ) : null}

                        <div className="flex items-center gap-3 mt-2">
                          <a
                            href={`${getBackendBaseUrl()}/uploads/${m.nama_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                          >
                            <i className="bi bi-download" aria-hidden="true" /> Unduh
                          </a>

                          <button
                            onClick={() => handleDeleteMaterial(m.id)}
                            className="text-[10px] font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
                          >
                            <i className="bi bi-trash" aria-hidden="true" /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Unggah Materi"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              form="upload-material-form"
              icon="bi-cloud-arrow-up"
              loading={uploadLoading}
            >
              Simpan & Kirim
            </Button>
          </>
        }
      >
        <form id="upload-material-form" onSubmit={handleUploadMaterial} className="space-y-4">
          <Input
            label="Judul Materi"
            required
            icon="bi-type"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder="Contoh: PDF Slide Modul 1"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi Singkat
            </label>
            <textarea
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              rows={3}
              placeholder="Penjelasan materi (opsional)..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Berkas File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              required
              onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-xs text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 cursor-pointer file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 file:font-semibold"
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
