import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, UserCircle, Users, Briefcase, Calendar, ClipboardList, LogOut, ChevronRight, Menu, X, Bell, Search, Building2, CheckCircle2, MapPin, ClipboardCheck, Star, Award, FileBarChart } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api, { FILE_URL } from "@/api/axios";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: LayoutDashboard, label: "Beranda", path: "/dashboard" },
    { icon: UserCircle, label: "Profil Saya", path: "/profile" },
    { icon: Briefcase, label: "Lamar Magang", path: "/apply", roles: ["student"] },
    { icon: Building2, label: "Divisi", path: "/master/divisions", roles: ["admin"] },
    { icon: Calendar, label: "Periode Magang", path: "/master/internship-periods", roles: ["admin"] },
    { icon: Briefcase, label: "Program Magang", path: "/master/internship-programs", roles: ["admin"] },
    { icon: ClipboardCheck, label: "Status Pendaftaran", path: "/master/registration-statuses", roles: ["admin"] },
    { icon: MapPin, label: "Penempatan", path: "/master/placements", roles: ["admin"] },
    { icon: ClipboardList, label: "Pendaftaran", path: "/master/registrations", roles: ["admin"] },
    { icon: Users, label: "Peserta Magang", path: "/master/interns", roles: ["admin", "mentor"] },
    { icon: CheckCircle2, label: "Penugasan Mentor", path: "/master/mentor-interns", roles: ["admin"] },
    { icon: Star, label: "Kriteria Penilaian", path: "/master/assessment-criteria", roles: ["admin", "mentor"] },
    { icon: Award, label: "Penilaian Magang", path: "/master/scores", roles: ["admin", "mentor"] },
    { icon: FileBarChart, label: "Laporan & Sertifikat", path: "/master/reports", roles: ["admin", "mentor", "student", "intern"] },
    { icon: FileBarChart, label: "Log Book", path: "/master/log-books", roles: ["admin", "mentor", "student", "intern"] },
  ];

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.data);
      } catch (err) {
        console.error("Gagal refresh profil", err);
      }
    };
    fetchMe();
  }, [setUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredMenuItems = menuItems.filter(item => {
    const rawRole = typeof user?.role === 'object' ? user.role?.name : user?.role;
    const userRole = rawRole?.toLowerCase();
    
    // Jika menu memiliki batasan role
    if (item.roles && !item.roles.some(r => r.toLowerCase() === userRole)) {
      return false;
    }
    
    // Jika menu "Lamar Magang", sembunyikan kalau sudah diterima (jadi intern)
    if (item.path === "/apply") {
      if (userRole === 'intern' || user?.registration?.status?.toLowerCase() === 'accepted' || user?.registration?.intern_id) {
        return false;
      }
    }

    // Jika menu "Log Book" atau "Laporan & Sertifikat", sembunyikan untuk student yang belum diterima
    if (item.path === "/master/log-books" || item.path === "/master/reports") {
      if ((userRole === 'student' || userRole === 'intern') && user?.registration?.status?.toLowerCase() !== 'accepted') {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsLogoutConfirmOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-2xl p-6 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                <LogOut size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Konfirmasi Keluar</h3>
                <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin keluar dari aplikasi? Sesi Anda akan diakhiri.</p>
              </div>

              <div className="flex gap-3 w-full pt-4">
                <button onClick={() => setIsLogoutConfirmOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-muted transition-all">
                  Batal
                </button>
                <button onClick={handleLogout} className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold shadow-sm hover:bg-destructive/90 transition-all">
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-border bg-card", isSidebarOpen ? "w-72" : "w-20")}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <img 
                src="/logo rapier.jpg" 
                alt="Rapier Technology" 
                className="w-16 h-16 object-contain rounded-lg"
              />
              <span className="font-bold text-lg tracking-tight">Magang Hub</span>
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center">
              <img 
                src="/logo-rapier.png" 
                alt="Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("shrink-0", isSidebarOpen ? "w-5 h-5" : "w-6 h-6 mx-auto")} />
                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                {isActive && isSidebarOpen && <ChevronRight size={14} className="ml-auto opacity-70" />}
                {!isSidebarOpen && (
                  <div className="absolute left-16 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-100">{item.label}</div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-auto border-t border-border">
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className={cn("flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 group relative", !isSidebarOpen && "justify-center")}
          >
            <LogOut className={cn("shrink-0", isSidebarOpen ? "w-5 h-5" : "w-6 h-6")} />
            {isSidebarOpen && <span className="font-medium text-sm">Keluar</span>}
            {!isSidebarOpen && <div className="absolute left-16 bg-destructive text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-100">Keluar</div>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col transition-all duration-300 ease-in-out h-full overflow-hidden", isSidebarOpen ? "ml-72" : "ml-20")}>
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Cari sesuatu..."
                className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-10 pl-10 pr-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl hover:bg-muted relative transition-colors">
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </button>
            <div className="h-8 w-px bg-border mx-2"></div>
            <Link to="/profile" className="flex items-center gap-3 pl-2 hover:bg-muted p-1.5 rounded-xl transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.role || "Guest"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm overflow-hidden">
                {user?.photo ? (
                  <img 
                    src={`${FILE_URL}${user.photo}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=" + (user?.full_name || "User");
                    }}
                  />
                ) : (
                  (user?.full_name || "U").charAt(0).toUpperCase()
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}