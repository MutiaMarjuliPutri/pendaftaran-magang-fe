import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/api/axios';
import { toast } from 'react-hot-toast';
import { Loader2, GraduationCap, Briefcase, FileText, Send, Building2, ExternalLink, User, Mail, Phone, Lock, ArrowLeft } from 'lucide-react';

export default function PublicApply() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProgramCode = location.state?.programCode || '';
  
  const [programs, setPrograms] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvFileName, setCvFileName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    applicant_type: 'mahasiswa', // 'mahasiswa' atau 'siswa'
    university: '',
    major: '',
    semester: '',
    program_code: selectedProgramCode,
    position_id: '',
    duration: '6'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [programsRes, positionsRes] = await Promise.all([
          api.get('/public/programs'),
          api.get('/public/placements')
        ]);
        setPrograms(programsRes.data.data || []);
        setPositions(positionsRes.data.data || []);
      } catch (error) {
        toast.error('Gagal mengambil data pendukung.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Hanya file PDF yang diperbolehkan!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB!');
      return;
    }
    setCvFile(file);
    setCvFileName(file.name);
  };

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append('file', file);
    // Gunakan endpoint publik — tidak butuh login
    const response = await api.post('/public/upload-cv', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      toast.error('Harap upload file CV (PDF)');
      return;
    }
    if (formData.password !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok!');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Kata sandi minimal 6 karakter!');
      return;
    }
    setUploading(true);
    try {
      const cvPath = await uploadFile(cvFile);
      const payload = {
        ...formData,
        semester: parseInt(formData.semester),
        duration: parseInt(formData.duration),
        cv_file: cvPath,
      };
      const response = await api.post('/public/register', payload);
      if (response.data.success) {
        toast.success(`Pendaftaran Berhasil! Silakan login untuk memantau status Anda.`);
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pendaftaran gagal');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-red-900 animate-spin" />
          <p className="text-red-900 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/20 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-red-900/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-red-900 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Home
        </button>

        <div className="bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden">
          <div className="bg-red-900 p-8 md:p-12 text-white relative">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Gabung Program Magang</h1>
            <p className="text-red-100/80 max-w-xl">Lengkapi data Anda di bawah ini untuk membuat akun sekaligus melamar posisi magang yang Anda inginkan.</p>
            <div className="mt-8">
              <a href="https://rapiertechnology.co.id" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-all backdrop-blur-md border border-white/10">
                <Building2 size={16} /> Profil Perusahaan <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            {/* Account Information */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-8 text-red-900">
                <div className="w-10 h-10 rounded-xl bg-red-900/10 flex items-center justify-center text-red-900">
                  <User size={20} />
                </div>
                Informasi Akun & Pribadi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input pl-11 pr-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Email Aktif</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input pl-11 pr-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input pl-11 pr-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="johndoe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Nomor WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input pl-11 pr-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="0812xxxx" />
                  </div>
                </div>
              </div>
            </section>

            {/* Tipe Pendaftar */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-red-900">
                <div className="w-10 h-10 rounded-xl bg-red-900/10 flex items-center justify-center text-red-900">
                  <GraduationCap size={20} />
                </div>
                Saya adalah...
              </h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, applicant_type: 'mahasiswa', semester: '' }))}
                  className={`flex-1 flex items-center justify-center gap-3 h-16 rounded-2xl border-2 font-bold text-sm transition-all ${
                    formData.applicant_type === 'mahasiswa'
                      ? 'border-red-900 bg-red-900/10 text-red-900 shadow-md shadow-red-900/10'
                      : 'border-border text-muted-foreground hover:border-red-900/30 hover:bg-accent/50'
                  }`}
                >
                  <GraduationCap size={20} />
                  Mahasiswa / Mahasiswi
                  {formData.applicant_type === 'mahasiswa' && <span className="w-2 h-2 rounded-full bg-red-900 ml-1" />}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, applicant_type: 'siswa', semester: '' }))}
                  className={`flex-1 flex items-center justify-center gap-3 h-16 rounded-2xl border-2 font-bold text-sm transition-all ${
                    formData.applicant_type === 'siswa'
                      ? 'border-red-900 bg-red-900/10 text-red-900 shadow-md shadow-red-900/10'
                      : 'border-border text-muted-foreground hover:border-red-900/30 hover:bg-accent/50'
                  }`}
                >
                  <Briefcase size={20} />
                  Siswa / Siswi (SMA/SMK)
                  {formData.applicant_type === 'siswa' && <span className="w-2 h-2 rounded-full bg-red-900 ml-1" />}
                </button>
              </div>
            </section>

            {/* Academic - dinamis berdasarkan tipe pendaftar */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-8 text-red-900">
                <div className="w-10 h-10 rounded-xl bg-red-900/10 flex items-center justify-center text-red-900">
                  <GraduationCap size={20} />
                </div>
                {formData.applicant_type === 'siswa' ? 'Informasi Sekolah' : 'Informasi Akademik'}
              </h2>

              {formData.applicant_type === 'mahasiswa' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-semibold ml-1">Universitas / Perguruan Tinggi</label>
                    <input type="text" name="university" value={formData.university} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="Nama Kampus" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Program Studi / Jurusan</label>
                    <input type="text" name="major" value={formData.major} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="Teknik Informatika" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Semester</label>
                    <input type="number" name="semester" value={formData.semester} onChange={handleChange} required min="1" max="14" className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="1 - 14" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-semibold ml-1">Nama Sekolah (SMA/SMK)</label>
                    <input type="text" name="university" value={formData.university} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="SMK Negeri 1 ..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Jurusan / Kompetensi Keahlian</label>
                    <input type="text" name="major" value={formData.major} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" placeholder="Rekayasa Perangkat Lunak" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Kelas</label>
                    <select name="semester" value={formData.semester} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 bg-background focus:ring-2 focus:ring-red-900/20 outline-none transition-all">
                      <option value="">Pilih Kelas</option>
                      <option value="10">Kelas 10</option>
                      <option value="11">Kelas 11</option>
                      <option value="12">Kelas 12</option>
                    </select>
                  </div>
                </div>
              )}
            </section>

            {/* Program */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-8 text-red-900">
                <div className="w-10 h-10 rounded-xl bg-red-900/10 flex items-center justify-center text-red-900">
                  <Briefcase size={20} />
                </div>
                Rencana Magang
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Program Magang</label>
                  <select name="program_code" value={formData.program_code} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 bg-background outline-none transition-all">
                    <option value="">Pilih Program</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.program_code}>{p.program_name} ({p.program_code})</option>
                    ))}
                  </select>
                  {formData.program_code && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-red-900/10 text-red-900 text-[10px] font-bold uppercase">
                        Batch {programs.find(p => p.program_code === formData.program_code)?.batch || '-'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium italic">Otomatis Terdaftar di Batch Ini</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Posisi Diminati</label>
                  <select name="position_id" value={formData.position_id} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 bg-background outline-none transition-all">
                    <option value="">Pilih Posisi</option>
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Durasi Magang (Bulan)</label>
                  <input type="number" name="duration" value={formData.duration} onChange={handleChange} required min="1" max="12" className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* CV */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-8 text-red-900">
                <div className="w-10 h-10 rounded-xl bg-red-900/10 flex items-center justify-center text-red-900">
                  <FileText size={20} />
                </div>
                Dokumen Pendukung
              </h2>
              <div className="space-y-6">
                <div className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-red-900/30 transition-colors bg-accent/10">
                  <FileText size={48} className="text-muted-foreground opacity-20" />
                  <div className="text-center">
                    <p className="text-sm font-bold">Upload CV dalam format PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">Maksimal ukuran file 5MB</p>
                  </div>
                  <label className="mt-2 cursor-pointer bg-red-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-950 transition-all shadow-lg shadow-red-900/10">
                    {uploading ? 'Mengupload...' : 'Pilih File PDF'}
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" disabled={uploading} />
                  </label>
                  {cvFileName && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-lg text-sm font-bold mt-2">
                      <FileText size={16} /> {cvFileName}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Account Security */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-8 text-red-900">
                <div className="w-10 h-10 rounded-xl bg-red-900/10 flex items-center justify-center text-red-900">
                  <Lock size={20} />
                </div>
                Keamanan Akun
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Buat Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full h-12 rounded-xl border border-input pl-11 pr-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all shadow-sm"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                  {formData.password.length > 0 && formData.password.length < 6 && (
                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">⚠️ Minimal 6 karakter</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition-all shadow-sm focus:ring-2 ${
                        confirmPassword.length === 0
                          ? 'border-input focus:ring-red-900/20'
                          : confirmPassword === formData.password
                          ? 'border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50/30'
                          : 'border-red-400 focus:ring-red-400/20 bg-red-50/30'
                      }`}
                      placeholder="Ulangi kata sandi"
                    />
                    {/* Match indicator */}
                    {confirmPassword.length > 0 && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base">
                        {confirmPassword === formData.password ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                  {confirmPassword.length > 0 && confirmPassword !== formData.password && (
                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">⚠️ Kata sandi tidak cocok</p>
                  )}
                  {confirmPassword.length > 0 && confirmPassword === formData.password && (
                    <p className="text-xs text-emerald-600 ml-1 flex items-center gap-1">✓ Kata sandi cocok</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground ml-1 mt-4 flex items-center gap-2">
                <Lock size={12} /> Password ini akan digunakan untuk login ke sistem setelah pendaftaran Anda diproses.
              </p>
            </section>

            <div className="pt-8 border-t border-border flex flex-col items-center gap-6">
              <button 
                type="submit" 
                disabled={uploading} 
                className="w-full md:w-auto px-16 h-16 bg-red-900 text-white rounded-[20px] font-extrabold shadow-2xl shadow-red-900/20 hover:bg-red-950 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-xl"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                {uploading ? 'Sedang Memproses...' : 'Kirim Lamaran Sekarang'}
              </button>
              <p className="text-sm text-muted-foreground">
                Sudah memiliki akun? <button type="button" onClick={() => navigate('/login')} className="text-red-900 font-bold hover:underline">Masuk di sini</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
