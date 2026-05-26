import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { Loader2, GraduationCap, Briefcase, FileText, Send, Building2, ExternalLink } from 'lucide-react';

export default function ApplyInternship() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [programs, setPrograms] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvFileName, setCvFileName] = useState('');
  const [formData, setFormData] = useState({
    university: '',
    major: '',
    semester: '',
    program_code: '',
    position_id: '',
    duration: '6',
    start_month: '',
    end_month: '',
    start_date: '',
    end_date: ''
  });

  const today = new Date().toISOString().split('T')[0];

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
    const response = await api.post('/upload', data, {
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
    if (formData.start_date && formData.start_date < today) {
      toast.error('Tanggal mulai tidak boleh di masa lalu!');
      return;
    }
    if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('Tanggal selesai tidak boleh sebelum tanggal mulai!');
      return;
    }
    setUploading(true);
    try {
      const cvPath = await uploadFile(cvFile);
      const payload = {
        ...formData,
        name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        semester: parseInt(formData.semester),
        duration: parseInt(formData.duration),
        cv_file: cvPath,
      };
      const response = await api.post('/public/register', payload);
      if (response.data.success) {
        toast.success(`Pendaftaran berhasil! No. Registrasi: ${response.data.data.registration_number}`);
        navigate('/dashboard');
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
          <p className="text-red-900 font-medium">Memuat data program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden overflow-y-auto">
          <div className="bg-red-900 p-8 md:p-12 text-white relative">
            <h1 className="text-3xl font-bold mb-2">Formulir Pendaftaran Magang</h1>
            <p className="text-red-100 opacity-80">Lengkapi data akademik dan rencana magang Anda.</p>
            <div className="mt-6">
              <a href="https://rapiertechnology.co.id" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl text-sm font-semibold hover:bg-white/30 transition-all">
                <Building2 className="w-4 h-4" /> Cek Profil Perusahaan <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-red-900">
                <GraduationCap className="w-6 h-6" /> Informasi Akademik
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Universitas</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none" placeholder="Contoh: Universitas Indonesia" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jurusan</label>
                    <input type="text" name="major" value={formData.major} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none" placeholder="Informatika" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <input type="number" name="semester" value={formData.semester} onChange={handleChange} required min="1" max="14" className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none" placeholder="1-14" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-red-900">
                <Briefcase className="w-6 h-6" /> Rencana Magang
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Program Magang</label>
                  <select name="program_code" value={formData.program_code} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 bg-background outline-none">
                    <option value="">Pilih Program</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.program_code}>{p.program_name} ({p.program_code})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Posisi Diminati</label>
                  <select name="position_id" value={formData.position_id} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 bg-background outline-none">
                    <option value="">Pilih Posisi</option>
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Durasi (Bulan)</label>
                  <input type="number" name="duration" value={formData.duration} onChange={handleChange} required min="1" max="12" className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none" />
                </div>
                
                {/* Detail Durasi Baru */}
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dari Bulan</label>
                    <select name="start_month" value={formData.start_month} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 bg-background outline-none transition-all">
                      <option value="">Pilih Bulan Mulai</option>
                      {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sampai Bulan</label>
                    <select name="end_month" value={formData.end_month} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 bg-background outline-none transition-all">
                      <option value="">Pilih Bulan Selesai</option>
                      {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal Mulai</label>
                    <input type="date" name="start_date" value={formData.start_date} min={today} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal Selesai</label>
                    <input type="date" name="end_date" value={formData.end_date} min={formData.start_date} onChange={handleChange} required className="w-full h-12 rounded-xl border border-input px-4 focus:ring-2 focus:ring-red-900/20 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-red-900">
                <FileText className="w-6 h-6" /> Dokumen Pendukung
              </h2>
              <div className="space-y-4">
                <label className="text-sm font-medium">Upload CV (PDF)</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-red-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-950 transition-all">
                    {uploading ? 'Mengupload...' : 'Pilih File PDF'}
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" disabled={uploading} />
                  </label>
                  {cvFileName && <span className="text-emerald-600 font-medium">✓ {cvFileName}</span>}
                </div>
                {!cvFileName && <p className="text-xs text-muted-foreground italic">* Format PDF, maksimal 5MB</p>}
              </div>
            </section>

            <button type="submit" disabled={uploading} className="w-full h-14 bg-red-900 text-white rounded-2xl font-bold shadow-xl shadow-red-900/20 hover:bg-red-950 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
              {uploading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              {uploading ? 'Sedang memproses...' : 'Kirim Lamaran Sekarang'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
