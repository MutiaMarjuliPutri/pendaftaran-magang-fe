import React from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import { useQuery } from '@tanstack/react-query';
import { Award, CheckCircle2, ClipboardList, TrendingUp, Star, FileText } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <FileText size={32} className="text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Belum Ada Pendaftaran</h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          Anda belum memiliki pendaftaran magang. Ajukan pendaftaran terlebih dahulu untuk melihat nilai Anda.
        </p>
        <Link to="/apply" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          Ajukan Pendaftaran Magang
        </Link>
      </div>
    );
  }

  if (status !== 'accepted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
          <Award size={32} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Nilai Belum Tersedia</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Nilai hanya dapat dilihat setelah status pendaftaran Anda <span className="font-bold text-foreground">"Diterima"</span>.
          Silakan pantau status pendaftaran Anda secara berkala.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground text-sm">Memuat nilai Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <Award size={32} className="text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Gagal Memuat Nilai</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Terjadi kesalahan saat memuat data nilai. Silakan coba lagi nanti.
        </p>
      </div>
    );
  }

  const summary = scoreData?.summary;
  const criteriaScores = scoreData?.criteria_scores || [];
  const averageScore = Number(summary?.average_score || 0);
  const maxScore = 100;

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <ClipboardList size={32} className="text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Belum Ada Penilaian</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Mentor Anda belum memberikan penilaian. Penilaian akan muncul di sini setelah mentor melakukan evaluasi.
        </p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    // Using consistent maroon theme colors for a more elegant and cohesive look
    return { 
      bg: 'bg-red-900', 
      text: 'text-red-900', 
      light: 'bg-red-900/10', 
      border: 'border-red-900/20', 
      bar: 'from-red-800 to-red-900' 
    };
  };

  const getGradeLabel = (score) => {
    if (score >= 85) return { label: 'Sangat Baik', emoji: '🌟' };
    if (score >= 70) return { label: 'Baik', emoji: '👍' };
    if (score >= 55) return { label: 'Cukup', emoji: '📝' };
    return { label: 'Perlu Perbaikan', emoji: '💪' };
  };

  const avgColor = getScoreColor(averageScore);
  const avgGrade = getGradeLabel(averageScore);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-1">
          <div className="w-8 h-[2px] bg-primary rounded-full"></div>
          Nilai Saya
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Nilai Akhir Magang</h1>
        <p className="text-muted-foreground mt-1 text-sm">Ringkasan penilaian dari mentor Anda selama program magang.</p>
      </div>

      {/* Score Summary Card - Premium Design */}
      <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden relative group">
        <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <Award size={120} />
        </div>

        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 p-4 md:p-5 text-white relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-100/70 text-[10px] font-bold uppercase tracking-[0.2em]">
                <div className="w-4 h-[2px] bg-red-100/50"></div> Skor Rata-rata
              </div>
              <div className="flex items-baseline gap-1">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{averageScore.toFixed(1)}</h2>
                <span className="text-red-100/50 text-sm font-bold">/ {maxScore}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold backdrop-blur-md">
                  {avgGrade.emoji} {avgGrade.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-red-50">
                  <CheckCircle2 size={10} className="inline mr-1" /> Sudah Dinilai
                </span>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="flex gap-2">
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 text-center border border-white/10 w-20">
                <p className="text-[8px] font-bold uppercase tracking-wider text-red-100/70">Total</p>
                <p className="mt-0.5 text-base font-black">{summary?.total_score}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 text-center border border-white/10 w-20">
                <p className="text-[8px] font-bold uppercase tracking-wider text-red-100/70">Params</p>
                <p className="mt-0.5 text-base font-black">{summary?.total_criteria}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="px-4 md:px-5 py-3 bg-card">
          <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
            <span className="text-muted-foreground uppercase tracking-wider">Progress Nilai</span>
            <span className={avgColor.text}>{Math.round(averageScore)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${avgColor.bar} transition-all duration-1000`}
              style={{ width: `${Math.min(averageScore, 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Mentor Anda telah memberikan penilaian untuk <span className="font-bold text-foreground">{summary?.total_criteria}</span> parameter penilaian magang.
          </p>
        </div>
      </div>

      {/* Detail Kriteria Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            <div>
              <h2 className="text-xl font-bold">Detail Penilaian</h2>
              <p className="text-xs text-muted-foreground">Rincian skor untuk setiap kriteria penilaian.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <TrendingUp size={12} />
            {criteriaScores.length} Kriteria
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {criteriaScores.map((c, idx) => {
            const score = Number(c.score || 0);
            const scoreColor = getScoreColor(score);
            return (
              <div
                key={c.id}
                className="group bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle accent bar */}
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${scoreColor.bar} rounded-r-full`}></div>

                <div className="pl-3">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">#{idx + 1}</span>
                      </div>
                      <p className="font-bold leading-snug text-foreground text-sm">{c.criteria_name}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-xl ${scoreColor.light} ${scoreColor.text} flex flex-col items-center justify-center font-black shrink-0 border ${scoreColor.border}`}>
                      <span className="text-xl leading-none">{score}</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 mt-0.5">poin</span>
                    </div>
                  </div>



                  {c.notes && (
                    <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <span className="font-bold text-foreground">📝 Catatan:</span> {c.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hover effect bottom bar */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer Note */}
      <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Star size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Tentang Penilaian</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nilai ini diberikan oleh mentor Anda berdasarkan performa selama program magang berlangsung. 
            Jika Anda memiliki pertanyaan terkait penilaian, silakan hubungi mentor Anda secara langsung.
          </p>
        </div>
      </div>
    </div>
  );
}
