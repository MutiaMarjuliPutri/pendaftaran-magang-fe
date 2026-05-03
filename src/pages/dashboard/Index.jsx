import React from 'react'
import { 
  Users, 
  UserCheck, 
  Clock, 
  FileCheck,
  TrendingUp,
  ArrowUpRight,
  CalendarDays
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
        <div className="flex items-center gap-3 bg-card p-1 rounded-xl border border-border shadow-sm">
          <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg shadow-sm">Hari ini</button>
          <button className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">Minggu ini</button>
          <button className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">Bulan ini</button>
        </div>
      </div>

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
    </div>
  )
}
