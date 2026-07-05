import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocialIcon } from 'react-social-icons';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Briefcase,
  Users,
  Building2,
  ExternalLink,
  ChevronRight,
  MapPin,
  Mail
} from 'lucide-react';
import api from '@/api/axios';

export default function Home() {
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periodStatus, setPeriodStatus] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [acceptedInterns, setAcceptedInterns] = useState([]);
  const [isLoadingAnnouncement, setIsLoadingAnnouncement] = useState(false);

  useEffect(() => {
    const fetchPeriodStatus = async () => {
      try {
        const response = await api.get('/public/current-period');
        const period = response.data?.data;
        setPeriodStatus(period?.registration_status || 'closed');
        setCurrentPeriod(period);
      } catch (error) {
        console.error('Gagal mengambil status periode', error);
        setPeriodStatus('closed');
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchPeriodStatus();
  }, []);

  const fetchAnnouncement = async () => {
    setIsAnnouncementModalOpen(true);
    setIsLoadingAnnouncement(true);
    try {
      const response = await api.get('/public/announcements');
      setAcceptedInterns(response.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data pengumuman', error);
    } finally {
      setIsLoadingAnnouncement(false);
    }
  };

  const openModal = (program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
  };

  const programs = [
    {
      id: 1,
      program_code: "FRONT-001",
      program_name: "Frontend Developer",
      description: "Belajar membangun antarmuka web modern menggunakan React.js, Tailwind CSS, dan mengintegrasikan dengan REST API.",
      quota: 10,
      registration_start: "2025-11-10",
      registration_end: "2025-11-30"
    },
    {
      id: 2,
      program_code: "BACK-001",
      program_name: "Backend Developer",
      description: "Pelajari pengembangan backend dengan Node.js, Express, dan database SQL. Bangun API yang handal dan scalable.",
      quota: 8,
      registration_start: "2025-11-10",
      registration_end: "2025-11-30"
    },
    {
      id: 3,
      program_code: "UIUX-001",
      program_name: "UI/UX Designer",
      description: "Kuasai desain antarmuka pengguna, user research, prototyping dengan Figma, dan menciptakan pengalaman digital yang menarik.",
      quota: 5,
      registration_start: "2025-11-10",
      registration_end: "2025-11-30"
    },
    {
      id: 4,
      program_code: "BA-001",
      program_name: "Business Analyst",
      description: "Pelajari analisis kebutuhan bisnis, pembuatan dokumentasi, dan kolaborasi dengan tim developer untuk menghasilkan solusi tepat guna.",
      quota: 6,
      registration_start: "2025-11-10",
      registration_end: "2025-11-30"
    },
    {
      id: 5,
      program_code: "QA-001",
      program_name: "Quality Assurance",
      description: "Pelajari proses testing, manual testing, automation testing, dan memastikan kualitas aplikasi sebelum dirilis ke pengguna.",
      quota: 7,
      registration_start: "2025-11-10",
      registration_end: "2025-11-30"
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans relative overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo rapier.jpg"
              alt="Rapier Technology Logo"
              className="h-12 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Portal Magang
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.open('/login', '_blank')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 rounded-full bg-red-900 text-white text-sm font-semibold hover:bg-red-950 transition-all shadow-lg shadow-red-900/20 active:scale-95"
            >
              Lamar Sekarang
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>



        <div className="container mx-auto px-6 relative z-10 text-center">
          {isLoadingStatus ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-muted-foreground text-xs font-semibold mb-8 animate-pulse">
              ⏳ Memuat status pendaftaran...
            </div>
          ) : periodStatus === 'open' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Pendaftaran Magang {currentPeriod?.period_name || 'Batch 1'} Dibuka tgl {currentPeriod?.registration_start && currentPeriod?.registration_end
                ? `${new Date(currentPeriod.registration_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - ${new Date(currentPeriod.registration_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : '1 Juli - 10 Juli 2026'}
            </div>
          ) : periodStatus === 'closed' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-sm font-semibold mb-8">
              🔴 Pendaftaran Magang {currentPeriod?.period_name || 'Periode'} Ditutup
              {currentPeriod?.announcement_date ? (
                <span className="ml-1 opacity-90 font-bold text-xs">
                  - Hasil seleksi akan diumumkan pada tanggal {new Date(currentPeriod.announcement_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              ) : (
                currentPeriod?.registration_end && (
                  <span className="ml-1 opacity-80 font-normal text-xs">
                    (Berakhir pada {new Date(currentPeriod.registration_end).toLocaleDateString('id-ID')})
                  </span>
                )
              )}
            </div>
          ) : periodStatus === 'announced' ? (
            <button
              onClick={fetchAnnouncement}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-50 border border-red-200 text-red-900 text-sm font-bold mb-8 hover:bg-red-100 hover:scale-105 transition-all shadow-xl shadow-red-900/10 cursor-pointer animate-bounce"
            >
              🎉 Pengumuman Peserta Magang Diterima! Klik Disini
            </button>
          ) : null}

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Mulai Karir Profesional <br />
            <span className="text-primary">Bersama Kami</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Dapatkan pengalaman kerja nyata dan bimbingan langsung dari para profesional di industri teknologi. Program magang kami dirancang untuk mengasah skill teknis dan softskill Anda.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                document.getElementById('programs').scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-red-900 text-white font-bold hover:bg-red-950 transition-all shadow-lg shadow-red-900/20 flex items-center gap-2 group text-sm"
            >
              Lihat Program <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://rapiertechnology.co.id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-card border border-border font-bold hover:bg-accent transition-all flex items-center gap-2 text-sm"
            >
              Profil Perusahaan <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 bg-accent/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold mb-4">Program Magang Tersedia</h2>
            <p className="text-muted-foreground">Pilih program yang sesuai dengan minat dan bakat Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div key={program.id} className="group relative bg-card border border-border p-8 rounded-3xl hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500">
                <div className="absolute top-8 right-8 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>

                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/60">{program.program_code}</span>
                  <h3 className="text-xl font-bold mt-1 group-hover:text-primary transition-colors">{program.program_name}</h3>
                </div>

                <p className="text-muted-foreground mb-8 line-clamp-3">
                  {program.description}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Reg: {currentPeriod?.registration_start && currentPeriod?.registration_end
                      ? `${new Date(currentPeriod.registration_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(currentPeriod.registration_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : `${new Date(program.registration_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(program.registration_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Lokasi: Tangerang & Semarang</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openModal(program)}
                    className="w-full py-3 rounded-xl border-2 border-red-900 text-red-900 font-bold hover:bg-red-50 transition-all"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Detail Program */}
      {isModalOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-card rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-6 md:p-8 flex justify-between items-center z-10">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-primary/60">{selectedProgram.program_code}</span>
                <h2 className="text-2xl font-extrabold mt-1">{selectedProgram.program_name}</h2>
              </div>
              <button onClick={closeModal} className="w-12 h-12 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center text-2xl transition-colors">✕</button>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6" /> Lokasi Penempatan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-accent/20 p-5 rounded-2xl">
                    <p className="text-base font-bold">📍 Tangerang</p>
                    <p className="text-sm text-muted-foreground mt-2">JL. Iskandar Muda No.8, Neglasari, Kec. Neglasari, Kota Tangerang, Banten 15129</p>
                  </div>
                  <div className="bg-accent/20 p-5 rounded-2xl">
                    <p className="text-base font-bold">📍 Semarang</p>
                    <p className="text-sm text-muted-foreground mt-2">JL. Mulawarman Selatan Raya No.16, Kramas, Kec. Tembalang, Kota Semarang, Jawa Tengah 50278</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">🏠 Tempat Tinggal:</span> Tidak disediakan
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-3">📋 Deskripsi Pekerjaan</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{selectedProgram.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-3">📌 Rincian Penugasan/Tanggung Jawab</h3>
                <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground">
                  {selectedProgram.id === 1 && (
                    <>
                      <li>Membangun komponen UI menggunakan React.js dan Tailwind CSS</li>
                      <li>Mengintegrasikan frontend dengan REST API</li>
                      <li>Memastikan tampilan responsif di berbagai device</li>
                      <li>Berkolaborasi dengan tim backend dan desainer</li>
                      <li>Melakukan debugging dan optimasi performa</li>
                    </>
                  )}
                  {selectedProgram.id === 2 && (
                    <>
                      <li>Mengembangkan REST API menggunakan Node.js dan Express</li>
                      <li>Merancang dan mengoptimalkan database SQL</li>
                      <li>Mengimplementasikan autentikasi dan keamanan</li>
                      <li>Melakukan unit testing dan debugging</li>
                      <li>Dokumentasi API</li>
                    </>
                  )}
                  {selectedProgram.id === 3 && (
                    <>
                      <li>Melakukan user research dan analisis kebutuhan</li>
                      <li>Membuat wireframe, mockup, dan prototype di Figma</li>
                      <li>Mendesain user interface yang intuitif dan menarik</li>
                      <li>Berkolaborasi dengan developer untuk implementasi desain</li>
                      <li>Melakukan usability testing</li>
                    </>
                  )}
                  {selectedProgram.id === 4 && (
                    <>
                      <li>Mengumpulkan dan menganalisis kebutuhan bisnis</li>
                      <li>Membuat dokumentasi BRD dan FRD</li>
                      <li>Menjadi jembatan antara klien dan tim teknis</li>
                      <li>Memvalidasi solusi yang dikembangkan</li>
                      <li>Membantu dalam proses testing UAT</li>
                    </>
                  )}
                  {selectedProgram.id === 5 && (
                    <>
                      <li>Membuat test plan dan test case</li>
                      <li>Melakukan manual testing dan regression testing</li>
                      <li>Melaporkan bug dan memastikan perbaikan</li>
                      <li>Mengimplementasikan automation testing sederhana</li>
                      <li>Memastikan kualitas produk sebelum rilis</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">💻 Kompetensi Teknis</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProgram.id === 1 && ['React.js', 'Tailwind CSS', 'JavaScript', 'REST API', 'Git'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{skill}</span>
                    ))}
                    {selectedProgram.id === 2 && ['Node.js', 'Express.js', 'PostgreSQL', 'REST API', 'Git', 'JWT'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{skill}</span>
                    ))}
                    {selectedProgram.id === 3 && ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'User Research', 'Usability Testing'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{skill}</span>
                    ))}
                    {selectedProgram.id === 4 && ['BRD/FRD', 'UML', 'BPMN', 'Analytical Thinking', 'Excel', 'JIRA'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">{skill}</span>
                    ))}
                    {selectedProgram.id === 5 && ['Manual Testing', 'Test Case', 'Bug Reporting', 'Selenium', 'Postman', 'JIRA'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">🤝 Soft Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Komunikasi', 'Kerja Tim', 'Pemecahan Masalah', 'Manajemen Waktu', 'Adaptif'].map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-3">⚠️ Persyaratan Khusus</h3>
                <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground">
                  <li>Mahasiswa aktif semester 6 atau lebih</li>
                  <li>Memiliki laptop pribadi</li>
                  <li>Kesiapan untuk belajar secara mandiri</li>
                  <li>Komitmen waktu minimal 3 bulan</li>
                  <li>Bersedia mengikuti prosedur dan aturan yang berlaku</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                <h3 className="text-lg font-bold text-green-700 mb-3">🎓 Capaian Pembelajaran</h3>
                <ul className="list-disc list-inside space-y-2 text-base text-green-700">
                  <li>Mendapat pengalaman kerja nyata di proyek perusahaan</li>
                  <li>Mendapat bimbingan dari mentor berpengalaman</li>
                  <li>Sertifikat magang setelah menyelesaikan program</li>
                  <li>Portofolio proyek yang bisa ditambahkan ke CV</li>
                  <li>Peluang menjadi karyawan tetap setelah magang</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-6 border-t border-border">
                <button
                  disabled={periodStatus !== 'open'}
                  onClick={() => {
                    closeModal();
                    navigate('/register', { state: { programCode: selectedProgram.program_code } });
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${periodStatus === 'open'
                    ? "bg-red-900 text-white hover:bg-red-950 shadow-xl shadow-red-900/20"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {periodStatus === 'open' ? 'Daftar Sekarang' : 'Pendaftaran Ditutup'}
                </button>
                <button onClick={closeModal} className="flex-1 px-6 py-3 rounded-xl border border-border font-medium hover:bg-accent transition-all">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengumuman */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsAnnouncementModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>

            {/* Header - Ukuran Normal */}
            <div className="bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">🎉 Pengumuman Peserta Magang</h2>
                <p className="text-red-100 text-sm mt-1">Selamat kepada seluruh peserta yang diterima dalam program magang kami!</p>
                {!isLoadingAnnouncement && acceptedInterns.length > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    Total {acceptedInterns.length} Peserta Diterima
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xl transition-colors shrink-0 ml-3"
              >
                ✕
              </button>
            </div>

            {/* Body - List Peserta */}
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50">
              {isLoadingAnnouncement ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-900 mb-3"></div>
                  <p className="text-gray-500 text-sm">Memuat data pengumuman...</p>
                </div>
              ) : acceptedInterns.length > 0 ? (
                <div className="space-y-2">
                  {acceptedInterns.map((intern, idx) => (
                    <div key={intern.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 hover:shadow-md hover:border-red-200 transition-all duration-200">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-700 to-red-900 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{intern.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{intern.university || '-'}</span>
                        </p>
                        {intern.major && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{intern.major}</p>
                        )}
                      </div>
                      <div className="px-2 py-1 bg-red-50 text-red-800 border border-red-100 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0">
                        ✓ DITERIMA
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-900">Belum ada data</h3>
                  <p className="text-xs text-gray-500 mt-1">Daftar peserta yang diterima belum diumumkan.</p>
                </div>
              )}
            </div>

            {/* Footer - Tombol */}
            <div className="p-4 bg-white border-t border-gray-100 flex justify-center">
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Tutup Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Details Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-2xl font-bold mb-4">Kesempatan Terbaik untuk Terjun ke Dunia IT! 💼✨</h2>
            <p className="text-muted-foreground text-lg">
              Dapatkan pengalaman langsung di lingkungan profesional dan bangun karir impian Anda bersama Rapier Technology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-card border border-border rounded-3xl p-8">
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Lokasi Penempatan
                </h3>
                <p className="text-muted-foreground">📍 Tangerang & Semarang </p>
              </div>

              <div className="mt-6 pt-2">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Periode Rekrutmen
                </h3>
                <p className="text-muted-foreground">
                  🗓️ {currentPeriod?.registration_start && currentPeriod?.registration_end
                    ? `${new Date(currentPeriod.registration_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} – ${new Date(currentPeriod.registration_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : 'Menunggu Periode Baru'}
                </p>
              </div>

              <div className="mt-8 p-5 bg-primary/5 rounded-2xl">
                <p className="text-foreground font-medium">
                  ✨ Di sini kamu akan belajar langsung dari mentor berpengalaman, terlibat di actual project,
                  membangun relasi profesional, sampai punya peluang career path ke depannya! 🎯
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col justify-between">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Lokasi Kantor</h3>
                <p className="text-muted-foreground text-sm">Kunjungi kami di dua lokasi strategis kami</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rapier Tangerang */}
                <div className="flex flex-col justify-between h-full bg-accent/10 border border-border/40 p-4 rounded-2xl">
                  <div>
                    <div className="flex items-start gap-2.5 mb-2">
                      <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Rapier Tangerang</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed min-h-[48px]">
                          JL. Iskandar Muda No.8, Neglasari, Kec. Neglasari, Kota Tangerang, Banten 15129 Indonesia
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-muted mt-2">
                    <iframe
                      title="Rapier Tangerang Map"
                      className="w-full h-full border-0"
                      src="https://maps.google.com/maps?q=JL.+Iskandar+Muda+No.8,+Neglasari,+Kec.+Neglasari,+Kota+Tangerang,+Banten+15129&output=embed"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Rapier Semarang */}
                <div className="flex flex-col justify-between h-full bg-accent/10 border border-border/40 p-4 rounded-2xl">
                  <div>
                    <div className="flex items-start gap-2.5 mb-2">
                      <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Rapier Semarang</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed min-h-[48px]">
                          JL. Mulawarman Selatan Raya No.16, Kramas, Kec. Tembalang, Kota Semarang, Jawa Tengah 50278, Indonesia
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-muted mt-2">
                    <iframe
                      title="Rapier Semarang Map"
                      className="w-full h-full border-0"
                      src="https://maps.google.com/maps?q=JL.+Mulawarman+Selatan+Raya+No.16,+Kramas,+Kec.+Tembalang,+Kota+Semarang,+Jawa+Tengah+50278&output=embed"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Social Media Section */}
      <section className="py-24 bg-accent/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">Hubungi Kami</h2>
              <p className="text-muted-foreground text-lg">
                Tanyakan, diskusikan, dan temukan solusi bersama tim kami. Kami siap mendengarkan dan membantu Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Hubungi Kami
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <a href="mailto:contact@rapiertechnology.co.id" className="text-muted-foreground hover:text-primary transition-colors">
                      contact@rapiertechnology.co.id
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <SocialIcon network="whatsapp" url="https://wa.me/6281297770484" bgColor="#25D366" fgColor="white" style={{ height: 28, width: 28 }} target="_blank" />
                    <a href="https://wa.me/6281297770484" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      +62 812-9777-0484
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-6">Ikuti Kami di Sosial Media</h3>
                <div className="flex flex-wrap gap-5">
                  <SocialIcon network="instagram" url="https://www.instagram.com/rapiertechnology" bgColor="transparent" fgColor="#E4405F" style={{ height: 45, width: 45 }} target="_blank" className="hover:scale-110 transition-transform" />
                  <SocialIcon network="linkedin" url="https://id.linkedin.com/company/rapitechindonesia" bgColor="transparent" fgColor="#0077B5" style={{ height: 45, width: 45 }} target="_blank" className="hover:scale-110 transition-transform" />
                  <SocialIcon network="youtube" url="https://www.youtube.com/@RapierTechnology" bgColor="transparent" fgColor="#FF0000" style={{ height: 45, width: 45 }} target="_blank" className="hover:scale-110 transition-transform" />
                  <SocialIcon network="tiktok" url="https://www.tiktok.com/@rapiertechnology" bgColor="transparent" fgColor="#000000" style={{ height: 45, width: 45 }} target="_blank" className="hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo rapier.jpg" alt="Rapier Technology Logo" className="h-9 w-auto object-contain" />
            <span className="font-bold">Portal Magang</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Rapier Technology. Konstributor PNP
          </p>
          <div className="flex items-center gap-4">
            <a href="https://rapiertechnology.co.id" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Website</a>
          </div>
        </div>
      </footer>
    </div>
  );
}