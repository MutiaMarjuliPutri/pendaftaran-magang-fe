import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  UserCheck, 
  Clock, 
  FileCheck,
  TrendingUp,
  ArrowUpRight,
  CalendarDays,
  Briefcase,
  Star,
  Bell,
  FileText,
  CheckCircle,
  ClipboardList,
  CheckCircle2,
  Award,
  UserCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axios'
import { cn } from '@/lib/utils'

const numberFormatter = new Intl.NumberFormat('id-ID')

const formatNumber = (value) => numberFormatter.format(Number(value || 0))

const formatStatus = (value) => {
  if (!value) return '-'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const statusStyles = {
  pending: {
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    bar: 'from-amber-400 to-orange-500'
  },
  documents_review: {
    dot: 'bg-sky-500',
    text: 'text-sky-600',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    bar: 'from-sky-400 to-blue-500'
  },
  interview1: {
    dot: 'bg-indigo-500',
    text: 'text-indigo-600',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    bar: 'from-indigo-400 to-violet-500'
  },
  interview2: {
    dot: 'bg-violet-500',
    text: 'text-violet-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    bar: 'from-violet-400 to-fuchsia-500'
  },
  accepted: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    bar: 'from-emerald-400 to-teal-500'
  },
  rejected: {
    dot: 'bg-rose-500',
    text: 'text-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    bar: 'from-rose-400 to-red-500'
  },
  default: {
    dot: 'bg-slate-500',
    text: 'text-slate-600',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    bar: 'from-slate-400 to-slate-600'
  }
}

const getStatusStyle = (status) => statusStyles[status] || statusStyles.default

const getRelativeTime = (date) => {
  if (!date) return '-'
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.max(Math.floor(diff / 60000), 0)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit yang lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`
  return `${Math.floor(hours / 24)} hari yang lalu`
}

const periodOptions = [
  { key: 'today', label: 'Hari ini', helper: 'hari ini' },
  { key: 'week', label: 'Minggu ini', helper: 'minggu ini' },
  { key: 'month', label: 'Bulan ini', helper: 'bulan ini' },
  { key: 'all', label: 'Seluruh Waktu', helper: 'seluruh waktu' },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const rawRole = typeof user?.role === 'object' ? user.role?.name : user?.role
  const userRole = rawRole?.toLowerCase()
  const isAdmin = userRole === 'admin'
  const isMentor = userRole === 'mentor'
  const isStaff = isAdmin || isMentor

  const [period, setPeriod] = useState('today')
  const selectedPeriod = periodOptions.find((item) => item.key === period) || periodOptions[0]

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard-summary', period],
    queryFn: async () => (await api.get('/master/dashboard', { params: { period } })).data.data,
    enabled: isStaff,
  })

  const overview = dashboard?.overview || {}
  const charts = dashboard?.charts || {}
  
  // Debug role detection
  console.log('Dashboard Debug:', { userRole, isAdmin, isMentor, isStaff, overview })
  const statusChart = charts.registrations_by_status || []
  const topPrograms = charts.top_programs_by_registrations || []
  const latestRegistrations = dashboard?.latest_registrations || []
  const bestInterns = dashboard?.best_interns || []
  const pendingLists = dashboard?.pending_lists || { log_books: [], reports: [] }
  const totalStatusRegistrations = statusChart.reduce((total, item) => total + Number(item.total || 0), 0)
  const maxStatusTotal = Math.max(...statusChart.map((item) => Number(item.total || 0)), 1)

  const stats = isMentor ? [
    {
      label: 'Peserta Bimbingan',
      value: formatNumber(overview.global_active_interns),
      helper: `Total peserta yang Anda bimbing`,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Logbook Baru',
      value: formatNumber(overview.waiting_log_books),
      helper: `Perlu validasi ${selectedPeriod.helper}`,
      icon: ClipboardList,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      label: 'Laporan Masuk',
      value: formatNumber(overview.submitted_reports),
      helper: `Laporan baru ${selectedPeriod.helper}`,
      icon: FileText,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    {
      label: 'Penilaian Selesai',
      value: formatNumber(overview.global_graduated_interns),
      helper: `Peserta yang sudah lulus`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
  ] : [
    {
      label: 'Total Pendaftar',
      value: formatNumber(overview.total_registrations),
      helper: `${formatNumber(overview.total_registrations)} ${selectedPeriod.helper}`,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Peserta Aktif',
      value: formatNumber(overview.global_active_interns),
      helper: `Total seluruh peserta aktif`,
      icon: UserCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Peserta Non-Aktif',
      value: formatNumber(overview.global_inactive_interns),
      helper: `Selesai/Dikeluarkan: ${formatNumber(Number(overview.global_graduated_interns || 0) + Number(overview.global_dropped_interns || 0))}`,
      icon: Clock,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      label: 'Review Pending',
      value: formatNumber(overview.pending_review),
      helper: `${formatNumber(overview.submitted_reports)} laporan perlu dicek`,
      icon: FileCheck,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Halo, {user?.full_name?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">Berikut ringkasan aktivitas sistem pendaftaran magang {selectedPeriod.helper}.</p>
        </div>
        {isStaff && (
          <div className="flex items-center gap-3 bg-card p-1 rounded-xl border border-border shadow-sm">
            {periodOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPeriod(item.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  period === item.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {bestInterns.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Star size={16} className="fill-amber-400 text-amber-400" /> Intern Terbaik Per Batch
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bestInterns.map((intern) => (
              <div key={intern.id} className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-amber-500/10 group-hover:scale-110 transition-transform">
                  <Star size={80} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Batch {intern.batch}</p>
                  <h5 className="font-bold text-foreground mb-1 truncate">{intern.name}</h5>
                  <p className="text-xs text-muted-foreground truncate">{intern.university}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(user?.role?.toLowerCase() === 'student' || user?.role === 'Intern') && (
        <div className="space-y-8">
          {!user?.registration ? (
            <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-[40px] p-10 text-white shadow-2xl shadow-red-900/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <Star size={12} className="fill-white" /> Karir Masa Depan
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter leading-tight">Mulai Perjalanan<br />Profesionalmu Sekarang.</h2>
                  <p className="text-red-100/80 max-w-lg text-lg leading-relaxed">
                    Kesempatan magang terbaik menantimu. Bergabunglah dengan tim profesional kami dan asah bakatmu di industri nyata.
                  </p>
                </div>
                <Link 
                  to="/apply" 
                  className="px-10 py-5 bg-white text-red-900 rounded-[24px] font-black text-lg shadow-2xl hover:bg-red-50 hover:-translate-y-2 active:scale-95 transition-all flex items-center gap-3 shrink-0"
                >
                  Daftar Magang <ArrowUpRight size={24} strokeWidth={3} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Status Card Utama */}
              <div className="bg-card rounded-[40px] border border-border shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Briefcase size={200} />
                </div>
                <div className="bg-gradient-to-r from-red-900 to-red-800 p-10 text-white relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-100/60 text-xs font-bold uppercase tracking-[0.2em]">
                        <div className="w-8 h-[2px] bg-red-400"></div> Status Pendaftaran
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{user.registration?.program || 'Program Magang'}</h2>
                      <div className="flex items-center gap-3 mt-4">
                         <span className="px-3 py-1 rounded-lg bg-white/10 text-red-100 text-xs font-mono">{user.registration?.number || '-'}</span>
                         <span className="text-red-100/50 text-xs italic">• Terdaftar pada {user.registration?.date ? new Date(user.registration.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <div className={`px-6 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-wide shadow-xl animate-pulse ${
                        user.registration?.status === 'accepted' ? 'bg-emerald-500 text-white' :
                        user.registration?.status === 'rejected' ? 'bg-rose-500 text-white' :
                        'bg-amber-400 text-amber-950'
                      }`}>
                        {user.registration?.status_label || user.registration?.status?.replace('_', ' ') || 'Sedang Diproses'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-10 bg-card">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                          <div className="w-2 h-6 bg-primary rounded-full"></div>
                          Langkah Selanjutnya
                        </h4>
                        <div className="space-y-4">
                           {(() => {
                             const status = user.registration?.status;
                             let steps = [];
                             
                             if (status === 'accepted') {
                               steps = [
                                 { step: 1, label: 'Onboarding', desc: 'Selesaikan proses administrasi dan pengenalan tim.', active: true, done: true },
                                 { step: 2, label: 'Aktivitas Magang', desc: 'Mulai mengisi log book harian dan laporan mingguan.', active: true },
                                 { step: 3, label: 'Klaim Sertifikat', desc: 'Unggah laporan akhir Anda untuk mendapatkan sertifikat magang resmi.', active: false },
                               ];
                             } else if (status === 'interview') {
                               steps = [
                                 { step: 1, label: 'Sesi Wawancara', desc: 'Siapkan diri Anda untuk diskusi teknis dengan mentor.', active: true },
                                 { step: 2, label: 'Pengumuman Akhir', desc: 'Hasil seleksi wawancara akan diinfokan segera.', active: false },
                                 { step: 3, label: 'Persiapan Masuk', desc: 'Persiapkan dokumen onboarding jika diterima.', active: false },
                               ];
                             } else if (status === 'rejected') {
                               steps = [
                                 { step: 1, label: 'Evaluasi', desc: 'Tinjau kembali kualifikasi dan pengalaman Anda.', active: true, done: true },
                                 { step: 2, label: 'Tingkatkan Skill', desc: 'Gunakan waktu untuk belajar dan mencoba lagi nanti.', active: true },
                                 { step: 3, label: 'Kesempatan Lain', desc: 'Pantau program magang di periode berikutnya.', active: false },
                               ];
                             } else {
                               // Default / Pending
                               steps = [
                                 { step: 1, label: 'Tinjauan Berkas', desc: 'Tim rekrutmen memeriksa CV dan portofolio Anda.', active: true },
                                 { step: 2, label: 'Wawancara', desc: 'Sesi perkenalan dan diskusi teknis lebih lanjut.', active: false },
                                 { step: 3, label: 'Pengumuman Akhir', desc: 'Keputusan akhir penerimaan peserta magang.', active: false },
                               ];
                             }

                             return steps.map((item, idx) => (
                               <div key={idx} className={`flex gap-4 p-4 rounded-2xl border transition-all ${item.active ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-muted/30 border-transparent opacity-50'}`}>
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${item.done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : item.active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                                   {item.done ? <CheckCircle size={18} /> : item.step}
                                 </div>
                                 <div>
                                   <p className="font-bold text-sm uppercase tracking-tight">{item.label}</p>
                                   <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                                 </div>
                                 {item.active && !item.done && idx === 0 && (
                                   <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                     <div className="w-1 h-1 bg-primary rounded-full animate-ping"></div> PROSES
                                   </div>
                                 )}
                               </div>
                             ));
                           })()}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                          <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                          Catatan Untukmu
                        </h4>
                        <div className="bg-muted/30 rounded-3xl p-8 border border-border/50 relative overflow-hidden">
                           <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                             <FileCheck size={120} />
                           </div>
                           <p className="text-base leading-relaxed text-foreground/80 italic relative z-10">
                               "{user.registration?.status === 'pending' ? 'Harap bersabar. Tim kami sedang meninjau ribuan berkas yang masuk untuk memilih talenta terbaik seperti Anda.' :
                                 user.registration?.status === 'accepted' ? 'Selamat! Anda terpilih. Mohon siapkan dokumen identitas asli Anda untuk proses administrasi selanjutnya.' :
                                 user.registration?.status === 'rejected' ? 'Terima kasih atas minat Anda. Jangan berkecil hati, asah terus kemampuan Anda dan coba lagi di gelombang berikutnya.' :
                                 'Cek email Anda secara berkala untuk jadwal interview atau informasi tambahan lainnya.'}"
                           </p>

                           {user.registration?.status === 'accepted' && (
                             <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                               <Link to="/master/log-books" className="flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                                 <CalendarDays size={20} /> Isi Log Book
                               </Link>
                               <Link to="/master/reports" className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-indigo-600/20">
                                 <FileText size={20} /> Kirim Laporan
                               </Link>
                             </div>
                           )}

                           <div className="mt-8 flex items-center gap-4 p-4 bg-background rounded-2xl border border-border/50 shadow-sm">
                             <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                               <Bell size={20} />
                             </div>
                             <div>
                               <p className="text-xs font-bold">Butuh Bantuan?</p>
                               <p className="text-[10px] text-muted-foreground">Hubungi kami di hr@rapiertechnology.co.id</p>
                             </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

      {isStaff && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="group bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className={stat.bg + " p-3 rounded-xl transition-colors group-hover:bg-primary/20"}>
                    <stat.icon className={stat.color + " w-6 h-6"} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <TrendingUp size={12} />
                    Live
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">{isDashboardLoading ? '...' : stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{stat.helper}</p>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {isAdmin ? (
              <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6 overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold">Status Pendaftaran</h3>
                    <p className="text-sm text-muted-foreground">Sebaran proses seleksi saat ini</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total proses</p>
                      <p className="text-2xl font-black tracking-tight">{formatNumber(totalStatusRegistrations)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Users size={22} />
                    </div>
                  </div>
                  <Link to="/master/registrations" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline transition-all">
                    Lihat Detail <ArrowUpRight size={16} />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-6">
                  <div className="rounded-2xl bg-muted/40 border border-border p-5 flex flex-col justify-between min-h-[260px]">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Konversi Seleksi</p>
                      <p className="text-4xl font-black mt-2">
                        {totalStatusRegistrations
                          ? `${Math.round((Number(overview.accepted_registrations || 0) / totalStatusRegistrations) * 100)}%`
                          : '0%'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Diterima dari total pendaftar yang masuk.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Diterima</span>
                        <span className="font-bold text-emerald-600">{formatNumber(overview.accepted_registrations)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ditolak</span>
                        <span className="font-bold text-rose-600">{formatNumber(overview.rejected_registrations)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Menunggu</span>
                        <span className="font-bold text-amber-600">{formatNumber(overview.pending_review)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(statusChart.length ? statusChart : [{ name: 'Belum ada data', total: 0 }]).map((item, i) => {
                      const style = getStatusStyle(item.name)
                      const total = Number(item.total || 0)
                      const percent = totalStatusRegistrations ? Math.round((total / totalStatusRegistrations) * 100) : 0
                      const width = Math.max((total / maxStatusTotal) * 100, total ? 10 : 2)
                      return (
                        <div key={item.id || item.name || i} className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`}></span>
                                <p className="font-bold truncate">{formatStatus(item.name)}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{percent}% dari total pendaftaran</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-2xl font-black ${style.text}`}>{formatNumber(total)}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">data</p>
                            </div>
                          </div>
                          <div className="mt-5 h-2.5 rounded-full bg-background/80 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                              style={{ width: `${width}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-xl font-bold mb-6">Tugas Bimbingan</h3>

                
                {isMentor && (
                  <div className="mt-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Logbook Perlu Validasi</h4>
                        <Link to="/master/log-books" className="text-xs font-bold text-primary hover:underline">Lihat Semua</Link>
                      </div>
                      <div className="grid gap-3">
                        {pendingLists.log_books.map((lb) => (
                          <div key={lb.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 group hover:bg-muted/50 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <ClipboardList size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{lb.title}</p>
                                <p className="text-xs text-muted-foreground">Oleh: {lb.user?.full_name}</p>
                              </div>
                            </div>
                            <Link to="/master/log-books" className="p-2 rounded-lg bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        ))}
                        {!pendingLists.log_books.length && (
                          <div className="text-center py-6 border border-dashed rounded-xl text-xs text-muted-foreground">
                            Tidak ada logbook yang perlu divalidasi.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Laporan Baru</h4>
                        <Link to="/master/reports" className="text-xs font-bold text-primary hover:underline">Lihat Semua</Link>
                      </div>
                      <div className="grid gap-3">
                        {pendingLists.reports.map((r) => (
                          <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 group hover:bg-muted/50 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{r.title}</p>
                                <p className="text-xs text-muted-foreground">Oleh: {r.intern?.name}</p>
                              </div>
                            </div>
                            <Link to="/master/reports" className="p-2 rounded-lg bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        ))}
                        {!pendingLists.reports.length && (
                          <div className="text-center py-6 border border-dashed rounded-xl text-xs text-muted-foreground">
                            Tidak ada laporan baru.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Akses Cepat</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Link to="/master/interns" className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">
                      <Users size={16} className="text-blue-500" /> Daftar Peserta
                    </Link>
                    <Link to="/master/scores" className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">
                      <Award size={16} className="text-emerald-500" /> Penilaian
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">
                      <UserCircle size={16} className="text-purple-500" /> Edit Profil
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{isAdmin ? 'Pendaftaran Terbaru' : 'Aktivitas Terbaru'}</h3>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <CalendarDays size={16} className="text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-6">
                {latestRegistrations.map((log, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0 transition-transform group-hover:scale-110">
                      {(log.intern?.name || log.registration_number || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-bold">{log.intern?.name || log.registration_number}</span> {isAdmin ? 'mendaftar' : 'aktivitas'} {log.program?.program_name || 'program magang'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{formatStatus(log.status?.name)} - {getRelativeTime(log.registration_date)}</p>
                    </div>
                  </div>
                ))}
                {!latestRegistrations.length && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Belum ada aktivitas terbaru.
                  </div>
                )}
              </div>
              
              <Link to={isAdmin ? "/master/registrations" : "/master/interns"} className="block text-center w-full mt-8 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all duration-200">
                Lihat Semua {isAdmin ? 'Pendaftaran' : 'Peserta'}
              </Link>
            </div>
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-xl font-bold">Program Paling Diminati</h3>
                <p className="text-sm text-muted-foreground mb-6">Top program berdasarkan jumlah pendaftar</p>
                <div className="space-y-4">
                  {topPrograms.map((program) => (
                    <div key={program.id} className="flex flex-col gap-4 rounded-2xl border border-border p-5 hover:border-primary/20 transition-colors bg-card/50">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold truncate text-sm">{program.program_name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{program.program_code}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black tracking-tighter">{formatNumber(program.total_registrations)}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Pendaftar</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground uppercase">Kapasitas Terisi</span>
                          <span className={((program.quota || 0) - (program.total_accepted || 0)) <= 0 ? "text-rose-500" : "text-primary"}>
                            {program.total_accepted || 0} / {program.quota || 0}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-1000",
                              (program.total_accepted / program.quota) >= 1 ? "bg-rose-500" : "bg-primary"
                            )}
                            style={{ width: `${Math.min(((program.total_accepted || 0) / (program.quota || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!topPrograms.length && (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Belum ada data program.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-xl font-bold">Perlu Dicek</h3>
                <p className="text-sm text-muted-foreground mb-6">Antrian pekerjaan superadmin</p>
                <div className="space-y-4">
                  <Link to="/master/registrations" className="flex items-center justify-between rounded-xl bg-amber-500/10 p-4 hover:bg-amber-500/15 transition-colors">
                    <span className="font-semibold text-sm">Review pendaftaran</span>
                    <span className="font-bold">{formatNumber(overview.pending_review)}</span>
                  </Link>
                  <Link to="/master/log-books" className="flex items-center justify-between rounded-xl bg-blue-500/10 p-4 hover:bg-blue-500/15 transition-colors">
                    <span className="font-semibold text-sm">Validasi logbook</span>
                    <span className="font-bold">{formatNumber(overview.waiting_log_books)}</span>
                  </Link>
                  <Link to="/master/reports" className="flex items-center justify-between rounded-xl bg-purple-500/10 p-4 hover:bg-purple-500/15 transition-colors">
                    <span className="font-semibold text-sm">Review laporan</span>
                    <span className="font-bold">{formatNumber(overview.submitted_reports)}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
