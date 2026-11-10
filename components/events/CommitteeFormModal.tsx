// components/events/CommitteeFormModal.tsx — Modal formulir tambah panitia event

"use client";

import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { eventService } from "../../services/event.service";
import type { MahasiswaSearchItem, CommitteeCreatePayload, EventCommittee } from "../../types/event";

interface CommitteeFormModalProps {
  open: boolean;
  eventId: number;
  onClose: () => void;
  onSuccess: (committee: EventCommittee) => void;
}

const ROLE_OPTIONS = [
  { value: "Ketua Pelaksana", label: "Ketua Pelaksana" },
  { value: "Wakil Ketua", label: "Wakil Ketua" },
  { value: "Sekretaris", label: "Sekretaris" },
  { value: "Bendahara", label: "Bendahara" },
  { value: "Koordinator Acara", label: "Koordinator Acara" },
  { value: "Anggota Acara", label: "Anggota Acara" },
  { value: "Koordinator Logistik", label: "Koordinator Logistik" },
  { value: "Anggota Logistik", label: "Anggota Logistik" },
  { value: "Koordinator Humas & Publikasi", label: "Koordinator Humas & Publikasi" },
  { value: "Anggota Humas & Publikasi", label: "Anggota Humas & Publikasi" },
  { value: "Dokumentasi & Desain", label: "Dokumentasi & Desain" },
  { value: "Konsumsi", label: "Konsumsi" },
];

const DIVISION_OPTIONS = [
  { value: "Inti", label: "Pengurus Inti" },
  { value: "Acara", label: "Divisi Acara" },
  { value: "Perlengkapan", label: "Divisi Perlengkapan & Logistik" },
  { value: "Humas", label: "Divisi Humas & Publikasi" },
  { value: "Konsumsi", label: "Divisi Konsumsi" },
  { value: "Keamanan", label: "Divisi Keamanan" },
];

export default function CommitteeFormModal({
  open,
  eventId,
  onClose,
  onSuccess,
}: CommitteeFormModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MahasiswaSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<MahasiswaSearchItem | null>(null);

  const [role, setRole] = useState("Koordinator Acara");
  const [division, setDivision] = useState("Acara");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce pencarian mahasiswa
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const handler = setTimeout(async () => {
      try {
        const res = await eventService.searchMahasiswa(searchQuery.trim());
        setSearchResults(res);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSelectStudent = (student: MahasiswaSearchItem) => {
    setSelectedStudent(student);
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  const handleClearSelected = () => {
    setSelectedStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Silakan cari dan pilih mahasiswa terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: CommitteeCreatePayload & { name: string; email: string; phone?: string } = {
        event_id: eventId,
        member_id: selectedStudent.id,
        name: selectedStudent.nama_lengkap,
        email: selectedStudent.email,
        phone: selectedStudent.no_whatsapp,
        role,
        division,
      };

      const result = await eventService.addCommittee(payload);
      onSuccess(result);
      handleClearSelected();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan panitia");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Panitia Kegiatan"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={submitting}
            disabled={!selectedStudent}
            icon="bi-check-lg"
            onClick={handleSubmit}
          >
            Simpan Panitia
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
            <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Pemilihan Mahasiswa */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Pilih Mahasiswa <span className="text-red-500">*</span>
          </label>

          {selectedStudent ? (
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                  {selectedStudent.nama_lengkap.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {selectedStudent.nama_lengkap}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    NIM: {selectedStudent.nim} • {selectedStudent.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="bi-x-lg"
                onClick={handleClearSelected}
                aria-label="Ganti mahasiswa"
              />
            </div>
          ) : (
            <div className="relative">
              <Input
                placeholder="Ketik minimal 2 huruf nama atau NIM mahasiswa..."
                icon="bi-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {searching && (
                <div className="absolute right-3 top-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                  <i className="bi bi-arrow-repeat animate-spin text-sm" aria-hidden="true" />
                  <span>Mencari...</span>
                </div>
              )}

              {/* Dropdown Hasil Pencarian */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {searchResults.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectStudent(m)}
                      className="w-full text-left p-3 hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition flex items-center justify-between text-xs group"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600">
                          {m.nama_lengkap}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          NIM: {m.nim} • {m.email}
                        </p>
                      </div>
                      <i className="bi bi-plus-circle text-indigo-500 text-sm opacity-0 group-hover:opacity-100 transition" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                  Tidak menemukan mahasiswa dengan kata kunci tersebut.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 2. Role / Jabatan */}
        <Select
          label="Peran / Jabatan Panitia"
          required
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        {/* 3. Divisi */}
        <Select
          label="Divisi Kepanitiaan"
          required
          options={DIVISION_OPTIONS}
          value={division}
          onChange={(e) => setDivision(e.target.value)}
        />
      </form>
    </Modal>
  );
}
