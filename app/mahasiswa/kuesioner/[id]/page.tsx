"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import MahasiswaLayout from "../../../../components/MahasiswaLayout";
import api from "../../../../lib/api";
import Card, { CardBody, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import Callout from "../../../../components/ui/Callout";
import EmptyState from "../../../../components/ui/EmptyState";
import LoadingSkeleton from "../../../../components/ui/LoadingSkeleton";

export default function IsiKuesionerPage() {
  const router = useRouter();
  const params = useParams();

  let workshop_id = params.id as string;
  if (params.id) {
    try {
      workshop_id = atob(decodeURIComponent(params.id as string));
    } catch (e) {}
  }

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/mahasiswa/kuesioner/${workshop_id}`);
        setData(res.data);
      } catch (err: any) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Gagal memuat kuesioner",
          "error"
        ).then(() => router.push("/mahasiswa/sertifikat"));
      } finally {
        setLoading(false);
      }
    };
    if (workshop_id) fetch();
  }, [workshop_id]);

  const handleChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.questions) return;

    const requiredMissing = data.questions.filter(
      (q: any) => q.is_required && !answers[q.id]?.trim()
    );
    if (requiredMissing.length > 0) {
      Swal.fire("Belum Lengkap", "Silakan isi semua pertanyaan wajib.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = data.questions.map((q: any) => ({
        question_id: q.id,
        answer_text: answers[q.id] || "",
      }));
      await api.post(`/mahasiswa/kuesioner/${workshop_id}`, { answers: payload });

      Swal.fire({
        icon: "success",
        title: "Terima Kasih!",
        text: "Kuesioner berhasil disubmit. Anda kini dapat mengunduh sertifikat.",
        timer: 3000,
        showConfirmButton: false,
      }).then(() => router.push("/mahasiswa/sertifikat"));
    } catch (err: any) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal mengirim jawaban",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="text" />
          <LoadingSkeleton variant="card" count={1} />
        </div>
      </MahasiswaLayout>
    );
  }

  if (data?.already_filled) {
    return (
      <MahasiswaLayout>
        <div className="max-w-2xl mx-auto pb-10">
          <EmptyState
            icon="bi-check-circle"
            title="Anda Sudah Mengisi Kuesioner"
            message={`Kuesioner untuk event ${data.event_title} telah Anda isi sebelumnya.`}
            action={
              <Link
                href="/mahasiswa/sertifikat"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                <i className="bi bi-award" aria-hidden="true" />
                Kembali ke Sertifikat
              </Link>
            }
          />
        </div>
      </MahasiswaLayout>
    );
  }

  return (
    <MahasiswaLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <div>
          <Link
            href="/mahasiswa/sertifikat"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Kembali ke Sertifikat
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-ui-checks">Isi Kuesioner</CardTitle>
            {data?.event_title && (
              <Badge variant="primary" size="sm">
                {data.event_title}
              </Badge>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardBody className="space-y-6">
              <Callout variant="info" title="Petunjuk Pengisian" icon="bi-info-circle-fill">
                Jawab seluruh pertanyaan wajib dengan benar. Setelah dikirim, Anda dapat mengunduh
                sertifikat event ini.
              </Callout>

              {data?.questions?.map((q: any, i: number) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold mr-2">
                      {i + 1}
                    </span>
                    {q.question_text}
                    {q.is_required ? <span className="text-red-500 ml-1">*</span> : null}
                  </label>

                  {q.question_type === "textarea" ? (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                      placeholder="Tulis jawaban Anda..."
                      required={!!q.is_required}
                    />
                  ) : q.question_type === "rating" ? (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleChange(q.id, String(val))}
                          className={`w-12 h-12 rounded-lg font-bold text-sm border-2 transition-all ${
                            answers[q.id] === String(val)
                              ? "bg-amber-400 border-amber-500 text-slate-900 shadow-sm"
                              : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  ) : q.question_type === "radio" || q.question_type === "dropdown" ? (
                    <div className="space-y-2">
                      {q.options?.split(",").map((opt: string) => (
                        <label
                          key={opt.trim()}
                          className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all"
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt.trim()}
                            checked={answers[q.id] === opt.trim()}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                            className="w-4 h-4 text-indigo-600"
                            required={!!q.is_required}
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            {opt.trim()}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answers[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="Tulis jawaban Anda..."
                      required={!!q.is_required}
                    />
                  )}
                </div>
              ))}
            </CardBody>

            <CardFooter className="justify-end">
              <Button type="submit" variant="primary" icon="bi-send" loading={submitting}>
                {submitting ? "Mengirim..." : "Kirim Jawaban"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MahasiswaLayout>
  );
}
