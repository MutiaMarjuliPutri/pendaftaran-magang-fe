import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, UserCircle, Users, Briefcase, Calendar, ClipboardList, LogOut, ChevronRight, Menu, X, Bell, Search, Building2, CheckCircle2, MapPin, ClipboardCheck, Star, Award, FileBarChart, UserCog } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api, { FILE_URL } from "@/api/axios";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

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
  { icon: FileBarChart, label: "Log Book", path: "/master/log-books", roles: ["mentor", "student", "intern"] },
  { icon: Award, label: "Nilai Saya", path: "/my-scores", roles: ["student", "intern"] },
  { icon: UserCog, label: "Manajemen User", path: "/master/users", roles: ["admin"] },
];

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/master/notifications");
      return response.data.data;
    },
    refetchInterval: 30000,
    enabled: !!user
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch("/master/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/master/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });

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

    if (item.roles && !item.roles.some(r => r.toLowerCase() === userRole)) {
      return false;
    }

    if (item.path === "/apply") {
      if (userRole === 'intern' || user?.registration?.status?.toLowerCase() === 'accepted' || user?.registration?.intern_id) {
        return false;
      }
    }

    if (item.path === "/master/log-books" || item.path === "/master/reports") {
      if ((userRole === 'student' || userRole === 'intern') && user?.registration?.status?.toLowerCase() !== 'accepted') {
        return false;
      }
    }

    if (item.path === "/my-scores") {
      if (user?.registration?.status?.toLowerCase() !== 'accepted') {
        return false;
      }
    }

    return true;
  });

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Logo Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
        {(mobile || isSidebarOpen) ? (
          <div className="flex items-center gap-3">
            <img
              src="/logo rapier.jpg"
              alt="Rapier Technology"
              className="w-10 h-10 object-contain rounded-lg"
            />
            <span className="font-bold text-base tracking-tight">Portal Magang</span>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center">
            <img
              src="/logo-rapier.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
        )}
        {mobile ? (
          <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        ) : (
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
              <item.icon className={cn("shrink-0", (mobile || isSidebarOpen) ? "w-5 h-5" : "w-6 h-6 mx-auto")} />
              {(mobile || isSidebarOpen) && <span className="font-medium text-sm">{item.label}</span>}
              {isActive && (mobile || isSidebarOpen) && <ChevronRight size={14} className="ml-auto opacity-70" />}
              {!mobile && !isSidebarOpen && (
                <div className="absolute left-16 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">{item.label}</div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 mt-auto border-t border-border shrink-0">
        <button
          onClick={() => setIsLogoutConfirmOpen(true)}
          className={cn("flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 group relative", (!mobile && !isSidebarOpen) && "justify-center")}
        >
          <LogOut className={cn("shrink-0", (mobile || isSidebarOpen) ? "w-5 h-5" : "w-6 h-6")} />
          {(mobile || isSidebarOpen) && <span className="font-medium text-sm">Keluar</span>}
          {!mobile && !isSidebarOpen && <div className="absolute left-16 bg-destructive text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">Keluar</div>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ===== Logout Confirmation Modal ===== */}
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

      {/* ===== MOBILE Sidebar Overlay ===== */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ===== MOBILE Sidebar Drawer ===== */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] flex flex-col w-72 border-r border-border bg-card transition-transform duration-300 ease-in-out lg:hidden",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent mobile={true} />
      </aside>

      {/* ===== DESKTOP Sidebar ===== */}
      <aside className={cn(
        "hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col transition-all duration-300 ease-in-out border-r border-border bg-card",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <SidebarContent mobile={false} />
      </aside>

      {/* ===== Main Content ===== */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out h-full overflow-hidden",
        // Desktop: shift berdasarkan sidebar
        isSidebarOpen ? "lg:ml-72" : "lg:ml-20",
        // Mobile: tidak ada margin, sidebar overlay di atas
        "ml-0"
      )}>

        {/* Header */}
        <header className="h-14 lg:h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 gap-3">
          {/* Hamburger for mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors shrink-0"
          >
            <Menu size={20} className="text-muted-foreground" />
          </button>

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 flex-1 min-w-0">
            <img src="/logo rapier.jpg" alt="Logo" className="w-7 h-7 object-contain rounded" />
            <span className="font-bold text-sm truncate">Portal Magang</span>
          </div>

          {/* Desktop spacer */}
          <div className="hidden lg:flex flex-1" />

          {/* Right side: notifications + user */}
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-xl hover:bg-muted relative transition-colors"
              >
                <Bell size={18} className="text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-destructive text-white text-[9px] font-bold rounded-full border-2 border-card flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <>
                  {/* Backdrop untuk menutup notifikasi */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-card border border-border shadow-xl rounded-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                      <h3 className="font-bold text-sm">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllReadMutation.mutate()}
                          className="text-[10px] text-primary hover:underline font-semibold"
                        >
                          Tandai semua dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications?.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <Bell size={24} className="mx-auto mb-2 opacity-20" />
                          <p className="text-xs">Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        notifications?.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.is_read) markReadMutation.mutate(n.id);
                              setIsNotificationOpen(false);
                              if (n.type === 'registration') navigate('/master/registrations');
                              else if (n.type === 'log_book') navigate('/master/log-books');
                              else if (n.type === 'report') navigate('/master/reports');
                              else if (n.type === 'intern') navigate('/master/interns');
                            }}
                            className={cn(
                              "p-4 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors last:border-0",
                              !n.is_read && "bg-primary/5"
                            )}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-xs font-bold">{n.title}</p>
                              {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                            <p className="text-[9px] text-muted-foreground mt-2 font-medium">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: id })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-border" />

            {/* User profile */}
            <Link to="/profile" className="flex items-center gap-2 hover:bg-muted p-1.5 rounded-xl transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none">{user?.full_name?.split(' ').slice(0, 2).join(' ') || "User"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{user?.role || "Guest"}</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm overflow-hidden text-sm">
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
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}