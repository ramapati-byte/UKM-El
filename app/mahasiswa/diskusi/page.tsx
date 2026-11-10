"use client";

import { getBackendBaseUrl } from "@/lib/axios";
import { useEffect, useState, useRef } from "react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";
import AktivitasTabs from "../../../components/AktivitasTabs";
import Card, { CardBody } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";

export default function DiskusiPage() {
  const [user, setUser] = useState<any>(null);
  const [tikets, setTikets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [chats, setChats] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      setUser(
        stored
          ? JSON.parse(stored)
          : { id: 1, name: "Ahmad Fauzi", email: "ahmad.fauzi@elrahma.ac.id", role: "mahasiswa" }
      );
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/mahasiswa/tiket");
        setTikets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const fetchMaterials = async (eventId: string) => {
    try {
      setLoadingMaterials(true);
      const res = await api.get(`/mahasiswa/materials/${eventId}`);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      setLoadingChat(true);
      const fetchChats = async () => {
        try {
          const res = await api.get(`/mahasiswa/diskusi/${selectedEventId}`);
          setChats(res.data);
          setLoadingChat(false);
        } catch (err) {
          console.error(err);
        }
      };
      fetchChats();
      fetchMaterials(selectedEventId);
      const interval = setInterval(fetchChats, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedEventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedEventId) return;

    setSendingChat(true);
    try {
      await api.post(`/mahasiswa/diskusi/${selectedEventId}`, { message: chatMessage });
      setChatMessage("");
      const res = await api.get(`/mahasiswa/diskusi/${selectedEventId}`);
      setChats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="card" count={1} />
          <LoadingSkeleton variant="table" rows={5} />
        </div>
      </MahasiswaLayout>
    );
  }

  const selectedEvent = tikets.find((t) => t.workshop_id.toString() === selectedEventId);

  return (
    <MahasiswaLayout>
      <div className="space-y-6 pb-6">
        <Card>
          <CardBody className="p-4">
            <AktivitasTabs />
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[calc(100vh-18rem)] min-h-[560px] flex flex-col md:flex-row">
            <div
              className={`w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
                selectedEventId ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <i className="bi bi-chat-dots text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  Ruang Diskusi
                </h2>
                <div className="relative">
                  <i
                    className="bi bi-search text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Cari kelas..."
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {tikets.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tikets.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedEventId(t.workshop_id.toString())}
                        className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4 ${
                          selectedEventId === t.workshop_id.toString()
                            ? "bg-indigo-50 dark:bg-indigo-950/40 border-r-4 border-indigo-600"
                            : ""
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                          {t.poster ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`${getBackendBaseUrl()}/uploads/${t.poster}`}
                              alt={t.judul}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
                              <i className="bi bi-calendar-event text-indigo-400" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-sm truncate ${
                              selectedEventId === t.workshop_id.toString()
                                ? "text-indigo-800 dark:text-indigo-300"
                                : "text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {t.judul}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                            {new Date(t.tanggal_waktu).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <i className="bi bi-people text-4xl block mb-3 opacity-30" aria-hidden="true" />
                    <p className="text-sm">Belum ada kelas yang Anda ikuti.</p>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/40 ${
                !selectedEventId ? "hidden md:flex" : "flex"
              }`}
            >
              {!selectedEventId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 rounded-full flex items-center justify-center mb-5">
                    <i className="bi bi-chat-dots text-4xl text-indigo-300 dark:text-indigo-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
                    Pilih Kelas
                  </h3>
                  <p className="text-sm max-w-sm text-center">
                    Pilih salah satu event/kelas di sebelah kiri untuk mulai berdiskusi dengan
                    peserta lain dan instruktur.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <button
                      onClick={() => setSelectedEventId(null)}
                      className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      aria-label="Kembali"
                    >
                      <i className="bi bi-arrow-left" aria-hidden="true" />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                      {selectedEvent?.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${getBackendBaseUrl()}/uploads/${selectedEvent.poster}`}
                          alt={selectedEvent?.judul}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
                          <i className="bi bi-calendar-event text-indigo-400" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-1">
                        {selectedEvent?.judul}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ruang Diskusi Resmi
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {loadingChat ? (
                      <div className="flex justify-center py-10">
                        <i className="bi bi-arrow-repeat animate-spin text-2xl text-indigo-400" aria-hidden="true" />
                      </div>
                    ) : chats.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <i className="bi bi-chat-dots text-4xl mb-3 opacity-30" aria-hidden="true" />
                        <p className="text-sm">Belum ada obrolan. Jadilah yang pertama menyapa!</p>
                      </div>
                    ) : (
                      chats.map((c: any) => {
                        const isMe = c.user_id === user?.id && c.user_type === "mahasiswa";
                        const isAdmin = c.user_type !== "mahasiswa";
                        return (
                          <div
                            key={c.id}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                          >
                            <span className="text-[10px] text-slate-400 font-bold mb-1 ml-1 mr-1 flex items-center gap-2">
                              {isMe ? "Anda" : c.nama_pengirim}
                              {isAdmin && (
                                <Badge variant="primary" size="sm">
                                  Admin / Instruktur
                                </Badge>
                              )}
                            </span>
                            <div
                              className={`px-4 py-3 rounded-2xl max-w-[85%] md:max-w-[70%] text-sm shadow-xs ${
                                isMe
                                  ? "bg-indigo-600 text-white rounded-br-none"
                                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
                              }`}
                            >
                              {c.message}
                            </div>
                            <span className="text-[9px] text-slate-400 mt-1">
                              {new Date(c.created_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={sendChat}
                    className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-end gap-2 max-w-4xl mx-auto">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Tulis pesan ke forum..."
                          className="w-full px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        icon="bi-send"
                        loading={sendingChat}
                        disabled={!chatMessage.trim()}
                        className="w-12 h-12 !px-0 shrink-0"
                        aria-label="Kirim pesan"
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {selectedEventId && (
              <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                    <i className="bi bi-file-earmark-text text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    Materi &amp; Berkas Event
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {loadingMaterials ? (
                    <div className="flex justify-center py-6">
                      <i className="bi bi-arrow-repeat animate-spin text-xl text-slate-400" aria-hidden="true" />
                    </div>
                  ) : materials.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <i className="bi bi-file-earmark-text text-3xl block mb-2 opacity-30" aria-hidden="true" />
                      <p className="text-[11px] font-bold">Belum ada materi dibagikan.</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Penyelenggara belum mengunggah berkas untuk event ini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {materials.map((m: any) => (
                        <div
                          key={m.id}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-start gap-2.5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                            <i className="bi bi-file-earmark-arrow-down text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                          </div>

                          <div className="flex-grow min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={m.judul_materi}>
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
                                className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                              >
                                <i className="bi bi-download" aria-hidden="true" />
                                Unduh Materi
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </MahasiswaLayout>
  );
}
