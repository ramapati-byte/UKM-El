"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
  CardTools,
} from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";

interface Answer {
  question: string;
  type: string;
  answer: string | null;
  rating: number | null;
}

interface ParticipantResult {
  participant_name: string;
  date: string;
  answers: Answer[];
}

export default function HasilKuesionerPage() {
  const params = useParams();
  const { id } = params;
  let decoded_id = id as string;
  if (id) {
    try { decoded_id = atob(decodeURIComponent(id as string)); } catch (e) {}
  }

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [eventData, setEventData] = useState<{ judul?: string } | null>(null);
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(true);

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
        const resEvent = await api.get(`/events/${decoded_id}`);
        setEventData(resEvent.data);

        const resHasil = await api.get(`/kuesioner/${decoded_id}/hasil`);
        setResults(resHasil.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
  };

  const totalAnswers = results.length > 0
    ? results.reduce((acc, curr) => acc + curr.answers.length, 0)
    : 0;

  return (
    <DashboardLayout
      user={user}
      title="Hasil Kuesioner"
      subtitle={`Evaluasi event: ${eventData?.judul ?? "Memuat..."}`}
      links={[]}
      onLogout={() => {}}
    >
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Hasil &amp; Tanggapan Peserta
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rangkuman jawaban kuesioner yang diisi oleh peserta event.
            </p>
          </div>
          <Button variant="outline" size="sm" icon="bi-download">
            Export Excel
          </Button>
        </div>

        {loading ? (
          <LoadingSkeleton variant="table" rows={4} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Total Responden"
                value={results.length}
                icon="bi-people"
                variant="primary"
              />
              <StatCard
                title="Tanggapan Diterima"
                value={totalAnswers}
                icon="bi-chat-dots"
                variant="info"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle icon="bi-bar-chart-line">
                  Detail Tanggapan Peserta
                </CardTitle>
                <CardTools>
                  <Badge variant="secondary" size="sm">
                    {results.length} responden
                  </Badge>
                </CardTools>
              </CardHeader>

              <CardBody className="p-0">
                {results.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon="bi-bar-chart-line"
                      title="Belum Ada Tanggapan"
                      message="Kuesioner belum diisi oleh peserta manapun. Peserta wajib mengisi kuesioner sebelum mengunduh sertifikat."
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.map((res, idx) => (
                      <div key={idx} className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center">
                              {res.participant_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                {res.participant_name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <i className="bi bi-calendar-event" aria-hidden="true" />
                                {formatDate(res.date)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="info" size="sm">
                            {res.answers.length} Jawaban
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {res.answers.map((ans, aIdx) => (
                            <div
                              key={aIdx}
                              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                            >
                              <p
                                className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 line-clamp-2"
                                title={ans.question}
                              >
                                {aIdx + 1}. {ans.question}
                              </p>

                              {ans.type === 'rating' ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-0.5 text-amber-400 text-base">
                                    {[1,2,3,4,5].map(star => (
                                      <i
                                        key={star}
                                        className={`bi bi-star-fill ${
                                          star <= (ans.rating || 0)
                                            ? ""
                                            : "text-slate-300 dark:text-slate-700"
                                        }`}
                                        aria-hidden="true"
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    ({ans.rating}/5)
                                  </span>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                  {ans.answer || (
                                    <span className="text-slate-400 dark:text-slate-500 italic">
                                      Tidak ada jawaban
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
