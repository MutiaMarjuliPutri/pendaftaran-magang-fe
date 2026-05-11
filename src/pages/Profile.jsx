import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/api/axios";
import { toast } from "react-hot-toast";
import { UserCircle, Mail, Phone, GraduationCap, Lock, Save, Camera, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILE_URL } from "@/api/axios";

const profileSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  university: z.string().optional(),
  major: z.string().optional(),
  semester: z.string().optional().or(z.number().optional()),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  new_password: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
  confirm_password: z.string().min(6, "Konfirmasi kata sandi wajib diisi"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirm_password"],
});

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const isStudent = user?.role?.toLowerCase() === "student" || user?.role?.toLowerCase() === "intern";

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    getValues: getProfileValues,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      university: user?.registration?.university || user?.university || "",
      major: user?.registration?.major || user?.major || "",
      semester: user?.registration?.semester || user?.semester || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        university: user.registration?.university || user.university || "",
        major: user.registration?.major || user.major || "",
        semester: user.registration?.semester || user.semester || "",
      });
    }
  }, [user, resetProfile]);

  const onUpdateProfile = async (data) => {
    setLoading(true);
    try {
      const response = await api.put("/auth/update-profile", {
        ...data,
        photo: user?.photo
      });
      setUser(response.data.data);
      toast.success("Profil berhasil diperbarui");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const onPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Hanya file JPG dan PNG yang diperbolehkan");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const photoPath = response.data.path;
      
      const updateResponse = await api.put("/auth/update-profile", {
        ...getProfileValues(),
        photo: photoPath
      });
      
      setUser(updateResponse.data.data);
      toast.success("Foto profil berhasil diperbarui");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengupload foto");
    } finally {
      setUploading(false);
    }
  };

  const onChangePassword = async (data) => {
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      toast.success("Kata sandi berhasil diubah");
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengubah kata sandi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative h-48 rounded-3xl bg-gradient-to-r from-primary to-purple-600 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -bottom-1 left-8 flex items-end gap-6 pb-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-primary/10 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              ) : user?.photo ? (
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
                <UserCircle className="w-16 h-16 text-primary" />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            >
              <Camera size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={onPhotoChange}
            />
          </div>
          <div className="mb-2 text-white">
            <h1 className="text-2xl font-bold">{user?.full_name}</h1>
            <p className="text-white/80 text-sm flex items-center gap-2">
              <ShieldCheck size={14} />
              <span className="capitalize">{user?.role}</span>
              {user?.registration?.status && (
                 <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider backdrop-blur-md">
                   {user.registration.status}
                 </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
              activeTab === "profile" ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <UserCircle size={18} /> Profil Saya
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
              activeTab === "password" ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Lock size={18} /> Keamanan
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeTab === "profile" ? (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                  <h2 className="text-xl font-bold">Informasi Pribadi</h2>
                  <p className="text-sm text-muted-foreground mt-1">Kelola informasi identitas Anda di sini.</p>
                </div>
                <div className="hidden sm:block">
                   <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Terverifikasi</span>
                   </div>
                </div>
              </div>

              <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <UserCircle size={16} className="text-muted-foreground" /> Nama Lengkap
                    </label>
                    <input
                      {...registerProfile("full_name")}
                      className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                    />
                    {profileErrors.full_name && <p className="text-xs text-destructive font-medium">{profileErrors.full_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" /> Alamat Email
                    </label>
                    <input
                      {...registerProfile("email")}
                      className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                    />
                    {profileErrors.email && <p className="text-xs text-destructive font-medium">{profileErrors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" /> Nomor Telepon
                    </label>
                    <input
                      {...registerProfile("phone")}
                      className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                    />
                    {profileErrors.phone && <p className="text-xs text-destructive font-medium">{profileErrors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      Username (Tetap)
                    </label>
                    <input
                      value={user?.username || ""}
                      disabled
                      className="w-full bg-muted/30 border-transparent h-11 px-4 rounded-xl text-sm cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>

                {isStudent && (
                  <>
                    <div className="pt-4 border-t border-border mt-8">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <GraduationCap className="text-primary" /> Informasi Akademik
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Universitas</label>
                        <input
                          {...registerProfile("university")}
                          className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                          placeholder="Masukkan universitas"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Jurusan</label>
                        <input
                          {...registerProfile("major")}
                          className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                          placeholder="Masukkan jurusan"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Semester</label>
                        <input
                          type="number"
                          {...registerProfile("semester")}
                          className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                          placeholder="Semester saat ini"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-6 border-t border-border mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? "Menyimpan..." : <><Save size={18} /> Simpan Perubahan</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-border pb-6">
                <h2 className="text-xl font-bold">Ubah Kata Sandi</h2>
                <p className="text-sm text-muted-foreground mt-1">Pastikan kata sandi Anda kuat untuk menjaga keamanan akun.</p>
              </div>

              <form onSubmit={handleSubmitPassword(onChangePassword)} className="max-w-md space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    {...registerPassword("current_password")}
                    className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                    placeholder="••••••••"
                  />
                  {passwordErrors.current_password && <p className="text-xs text-destructive font-medium">{passwordErrors.current_password.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Kata Sandi Baru</label>
                  <input
                    type="password"
                    {...registerPassword("new_password")}
                    className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                    placeholder="Minimal 6 karakter"
                  />
                  {passwordErrors.new_password && <p className="text-xs text-destructive font-medium">{passwordErrors.new_password.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    {...registerPassword("confirm_password")}
                    className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 h-11 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/5 outline-none"
                    placeholder="Ulangi kata sandi baru"
                  />
                  {passwordErrors.confirm_password && <p className="text-xs text-destructive font-medium">{passwordErrors.confirm_password.message}</p>}
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : <><Lock size={18} /> Perbarui Kata Sandi</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
