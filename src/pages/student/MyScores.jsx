import React from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import { useQuery } from '@tanstack/react-query';
import { Award, CheckCircle2, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyScores() {
  const { user } = useAuthStore();
  const registrationId = user?.registration?.id;
  const status = user?.registration?.status?.toLowerCase();

  const { data: scoreData, isLoading, error } = useQuery({
    queryKey: ['my-score', user?.id],
    queryFn: async () => {
      const res = await api.get(`/master/registrations/${user?.id}/with-score`);
      return res.data.data;
    },
    enabled: !!user?.id && status === 'accepted',
    staleTime: 5 * 60 * 1000,
  });

  if (!registrationId) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Anda belum memiliki pendaftaran magang.</p>
        <Link to="/apply" className="mt-4 inline-block text-primary hover:underline">
          Ajukan pendaftaran magang
        </Link>
      </div>
    );
  }

  if (status !== 'accepted') {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">
          Nilai hanya dapat dilihat setelah status pendaftaran Anda "Diterima".
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Memuat nilai Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive">Gagal memuat nilai. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  const summary = scoreData?.summary;
  const criteriaScores = scoreData?.criteria_scores || [];
  const averageScore = Number(summary?.average_score || 0);

  if (!summary) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Belum ada penilaian yang tersedia.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">Nilai Saya</p>
        <h1 className="mt-1 text-2xl font-black text-foreground">Nilai Akhir Magang</h1>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-rose-50 to-white px-5 py-5 shadow-sm">
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 text-primary/10 md:block">
          <Award size={92} strokeWidth={1.6} />
        </div>

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <span className="text-2xl font-black">{averageScore.toFixed(2)}</span>
            </div>
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-xs font-bold text-primary">
                <CheckCircle2 size={14} />
                Sudah dinilai
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Mentor Anda telah memberikan penilaian untuk{' '}
                <span className="font-bold text-primary">{summary?.total_criteria}</span> parameter.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:mr-24">
            <div className="rounded-xl border border-primary/10 bg-white/75 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Nilai</p>
              <p className="mt-1 text-lg font-black text-primary">{summary?.total_score}</p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-white/75 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Parameter</p>
              <p className="mt-1 text-lg font-black text-primary">{summary?.total_criteria}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black">Detail Penilaian</h2>
            <p className="text-xs text-muted-foreground">Rincian skor untuk setiap kriteria penilaian.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {criteriaScores.map((c) => (
            <div
              key={c.id}
              className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold leading-snug text-primary">{c.criteria_name}</p>
                  {c.notes && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Catatan: {c.notes}
                    </p>
                  )}
                </div>
                <div className="flex h-12 min-w-14 items-center justify-center rounded-xl bg-primary/10 px-3 text-lg font-black text-primary">
                  {Number(c.score || 0).toFixed(0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
