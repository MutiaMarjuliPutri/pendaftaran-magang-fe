import React from 'react'
import { Link } from 'react-router-dom'
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
  CheckCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const stats = [
  { 
    label: 'Total Pendaftar', 
    value: '1,284', 
    change: '+12.5%', 
    icon: Users, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10' 
  },
  { 
    label: 'Magang Aktif', 
    value: '432', 
    change: '+4.3%', 
    icon: UserCheck, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-500/10' 
  },
  { 
    label: 'Menunggu Review', 
    value: '86', 
    change: '-2.1%', 
    icon: Clock, 
    color: 'text-amber-500', 
    bg: 'bg-amber-500/10' 
  },
  { 
    label: 'Laporan Selesai', 
    value: '956', 
    change: '+18.2%', 
    icon: FileCheck, 
    color: 'text-purple-500', 
    bg: 'bg-purple-500/10' 
  },
]

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Halo, {user?.full_name?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">Berikut ringkasan aktivitas sistem pendaftaran magang hari ini.</p>
        </div>
        {user?.role?.toLowerCase() !== 'student' && user?.role !== 'Intern' && (
          <div className="flex items-center gap-3 bg-card p-1 rounded-xl border border-border shadow-sm">
            <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg shadow-sm">Hari ini</button>
            <button className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">Minggu ini</button>
            <button className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">Bulan ini</button>
          </div>
        )}
      </div>

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
            <>
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
                      <div className={`px-10 py-4 rounded-3xl text-xl font-black uppercase tracking-tighter shadow-2xl animate-pulse ${
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
            </>
          )}
        </div>
      )}

      {user?.role?.toLowerCase() !== 'student' && user?.role !== 'Intern' && (
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
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</p>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Aktivitas Pendaftaran</h3>
                  <p className="text-sm text-muted-foreground">Tren pendaftaran 7 hari terakhir</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline transition-all">
                  Lihat Detail <ArrowUpRight size={16} />
                </button>
              </div>
              
              <div className="h-[300px] flex items-end gap-3 px-2">
                {[45, 60, 35, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary transition-all duration-500 cursor-pointer relative"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {h} Pendaftar
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">H-{6-i}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Log Aktivitas</h3>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <CalendarDays size={16} className="text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { user: 'Budi Santoso', action: 'mendaftar magang', time: '2 menit yang lalu' },
                  { user: 'Siti Aminah', action: 'mengunggah laporan', time: '15 menit yang lalu' },
                  { user: 'Admin', action: 'menyetujui pendaftaran', time: '1 jam yang lalu' },
                  { user: 'Rahmat Hidayat', action: 'mengisi log book', time: '3 jam yang lalu' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0 transition-transform group-hover:scale-110">
                      {log.user.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-bold">{log.user}</span> {log.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-8 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all duration-200">
                Lihat Semua Aktivitas
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
