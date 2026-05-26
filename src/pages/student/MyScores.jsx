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

      {/* Summary Banner — sama persis dengan kartu "Nilai Akhir Magang" di dashboard student */}
      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Award size={120} className="text-primary" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Kotak Nilai */}
          <div className="w-24 h-24 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center font-black shadow-xl shadow-primary/30 shrink-0">
            <span className="text-3xl">{averageScore.toFixed(2)}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-0.5">Rata-rata</span>
          </div>
          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
              <CheckCircle2 size={13} /> Sudah dinilai
            </div>
            <p className="text-sm text-muted-foreground">
              Mentor Anda telah memberikan penilaian untuk{' '}
              <span className="font-bold text-foreground">{summary?.total_criteria}</span> parameter penilaian magang.
            </p>
          </div>
          {/* Stats kecil */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-2xl border border-primary/10 bg-background/80 px-5 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Nilai</p>
              <p className="mt-1 text-xl font-black text-primary">{summary?.total_score}</p>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-background/80 px-5 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Parameter</p>
              <p className="mt-1 text-xl font-black text-primary">{summary?.total_criteria}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Kriteria */}
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
              className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-primary/20 bg-primary/5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-snug text-foreground">{c.criteria_name}</p>
                {c.notes && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Catatan: {c.notes}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary shrink-0">
                {Number(c.score || 0).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
