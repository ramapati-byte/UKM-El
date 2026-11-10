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
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Callout from "@/components/ui/Callout";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string | null;
}

const QUESTION_TYPE_OPTIONS = [
  { value: "text", label: "Teks Singkat" },
  { value: "textarea", label: "Paragraf Panjang" },
  { value: "rating", label: "Rating Bintang (1-5)" },
  { value: "radio", label: "Pilihan Ganda (Radio)" },
  { value: "dropdown", label: "Dropdown Menu" },
];

export default function KelolaKuesionerPage() {
  const params = useParams();
  const { id } = params;
  let decoded_id = id as string;
  if (id) {
    try { decoded_id = atob(decodeURIComponent(id as string)); } catch (e) {}
  }

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [eventData, setEventData] = useState<{ judul?: string; is_kuesioner_active?: boolean } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isKuesionerActive, setIsKuesionerActive] = useState(false);

  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "text",
    options: ""
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

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
      setIsKuesionerActive(!!resEvent.data.is_kuesioner_active);

      const resQ = await api.get(`/kuesioner/${decoded_id}`);
      setQuestions(resQ.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const handleToggleStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setToggleLoading(true);
    try {
      await api.put(`/kuesioner/${decoded_id}/toggle`, { is_active: isKuesionerActive });
      alert("Status kuesioner diperbarui!");
    } catch (err) {
      alert("Gagal mengubah status.");
    } finally {
      setToggleLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await api.post(`/kuesioner/${decoded_id}`, formData);
      setFormData({ question_text: "", question_type: "text", options: "" });
      fetchData();
    } catch (err) {
      alert("Gagal menambahkan pertanyaan!");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (confirm("Yakin ingin menghapus pertanyaan ini?")) {
      try {
        await api.delete(`/kuesioner/${qId}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus!");
      }
    }
  };

  return (
    <DashboardLayout
      user={user}
      title="Kelola Kuesioner"
      subtitle={`Atur pertanyaan evaluasi untuk event: ${eventData?.judul ?? "Memuat..."}`}
      links={[]}
      onLogout={() => {}}
    >
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Kuesioner Event
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Peserta wajib mengisi kuesioner sebelum mengunduh sertifikat.
            </p>
          </div>
          <Badge variant={isKuesionerActive ? "success" : "secondary"} dot>
            {isKuesionerActive ? "Aktif" : "Tidak Aktif"}
          </Badge>
        </div>

        {loading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle icon="bi-power">Status Kuesioner</CardTitle>
                </CardHeader>
                <CardBody className="space-y-5">
                  <Callout variant="warning" icon="bi-exclamation-triangle-fill">
                    Jika aktif, peserta <strong>wajib</strong> mengisi kuesioner ini sebelum bisa mengunduh sertifikat mereka.
                  </Callout>
                  <form onSubmit={handleToggleStatus} className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Aktifkan Kuesioner
                      </span>
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={isKuesionerActive}
                          onChange={e => setIsKuesionerActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </div>
                    </label>
                    <Button
                      type="submit"
                      loading={toggleLoading}
                      icon="bi-save"
                      className="w-full"
                    >
                      Simpan Status
                    </Button>
                  </form>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle icon="bi-plus-lg">Buat Pertanyaan</CardTitle>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleAddQuestion} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Pertanyaan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.question_text}
                        onChange={e => setFormData({...formData, question_text: e.target.value})}
                        className="block w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors resize-none"
                        placeholder="Tulis pertanyaan Anda di sini..."
                      ></textarea>
                    </div>

                    <Select
                      label="Tipe Jawaban"
                      options={QUESTION_TYPE_OPTIONS}
                      value={formData.question_type}
                      onChange={e => setFormData({...formData, question_type: e.target.value})}
                    />

                    {(formData.question_type === 'radio' || formData.question_type === 'dropdown') && (
                      <Input
                        label="Opsi Jawaban"
                        required
                        value={formData.options}
                        onChange={e => setFormData({...formData, options: e.target.value})}
                        placeholder="Pisahkan dengan koma (Misal: Ya, Tidak)"
                      />
                    )}

                    <Button
                      type="submit"
                      variant="secondary"
                      loading={saveLoading}
                      icon="bi-plus-lg"
                      className="w-full"
                    >
                      Tambahkan
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle icon="bi-clipboard-check">Daftar Pertanyaan Kuesioner</CardTitle>
                  <CardTools>
                    <Badge variant="primary" size="sm">
                      {questions.length} pertanyaan
                    </Badge>
                  </CardTools>
                </CardHeader>

                <CardBody className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Preview bagaimana kuesioner akan terlihat oleh peserta.
                  </p>

                  {questions.length === 0 ? (
                    <EmptyState
                      icon="bi-clipboard-check"
                      title="Belum Ada Pertanyaan"
                      message="Kuesioner ini masih kosong. Gunakan form di samping untuk mulai menambahkan pertanyaan."
                    />
                  ) : (
                    questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30"
                      >
                        <div className="flex justify-between items-start mb-3 gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <Badge variant="secondary" size="sm">
                              {q.question_type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="bi-trash"
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => handleDeleteQuestion(q.id)}
                            aria-label="Hapus pertanyaan"
                          />
                        </div>

                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
                          {q.question_text}
                        </h4>

                        {(q.question_type === 'radio' || q.question_type === 'dropdown') ? (
                          <div className="space-y-2">
                            {q.options?.split(',').map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                              >
                                <div className={`w-4 h-4 border-2 border-indigo-400 shrink-0 ${q.question_type === 'radio' ? 'rounded-full' : 'rounded'}`}></div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{opt.trim()}</span>
                              </div>
                            ))}
                          </div>
                        ) : q.question_type === 'rating' ? (
                          <div className="flex gap-1.5 text-amber-400 text-lg">
                            {[1,2,3,4,5].map(star => (
                              <i key={star} className="bi bi-star-fill" aria-hidden="true" />
                            ))}
                          </div>
                        ) : q.question_type === 'textarea' ? (
                          <div className="w-full h-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                            Area Teks Panjang
                          </div>
                        ) : (
                          <div className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center px-3 text-slate-400 text-xs">
                            Input Teks Singkat
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
