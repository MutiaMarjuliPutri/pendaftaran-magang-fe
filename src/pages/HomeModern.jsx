import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocialIcon } from 'react-social-icons';
import {
  ArrowRight,
  Calendar,
  Briefcase,
  Users,
  Building2,
  MapPin,
  Mail,
  CheckCircle2,
  Database,
  PenTool,
  LayoutTemplate
} from 'lucide-react';
import api from '@/api/axios';

export default function HomeModern() {
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periodStatus, setPeriodStatus] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [acceptedInterns, setAcceptedInterns] = useState([]);
  const [isLoadingAnnouncement, setIsLoadingAnnouncement] = useState(false);

  // Theme Colors - using Maroon
  const primaryColor = "text-red-900";
  const bgPrimary = "bg-red-900";
  const hoverBgPrimary = "hover:bg-red-950";

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

  const [programs, setPrograms] = useState([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get('/public/programs');
        setPrograms(response.data?.data || []);
      } catch (error) {
        console.error('Gagal mengambil data program', error);
      } finally {
        setIsLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans relative overflow-x-hidden text-[#111827]">
      {/* Background Grid Pattern (Art By Code Style adapted to Maroon) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#7f1d1d 1px, transparent 1px), linear-gradient(90deg, #7f1d1d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo rapier.jpg"
              alt="Rapier Technology Logo"
              className="h-10 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Portal Magang
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#programs" className="hover:text-gray-900 transition-colors">Program</a>
            <a href="#benefits" className="hover:text-gray-900 transition-colors">Benefit</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">Kontak</a>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => window.open('/login', '_blank')}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`px-5 py-2.5 rounded-full ${bgPrimary} text-white text-sm font-medium ${hoverBgPrimary} transition-all flex items-center gap-2 shadow-lg shadow-red-900/20`}
            >
              Daftar Magang <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 lg:pt-20 pb-8 lg:pb-12 z-10 flex items-center xl:min-h-[75vh]">
        <div className="container mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              {isLoadingStatus ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-semibold tracking-wide mb-6 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Memuat status...
                </div>
              ) : periodStatus === 'open' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-900 text-[11px] font-semibold tracking-wide mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-900 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-900"></span>
                  </span>
                  Pendaftaran Magang {currentPeriod?.period_name || 'Batch 1'} Dibuka tgl 1 Juli-10 Juli 2026
                </div>
              ) : periodStatus === 'announcement' || periodStatus === 'announced' ? (
                <button onClick={fetchAnnouncement} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-900 text-[11px] font-bold tracking-wide mb-6 hover:bg-red-100 transition-colors cursor-pointer shadow-sm shadow-red-900/10">
                  🎉 Pengumuman Peserta Diterima
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-semibold tracking-wide mb-6">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Pendaftaran Ditutup
                </div>
              )}

              <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-[#111827] mb-6 leading-[1.05]">
                Mulai Karir Profesional <br />
                <span className={primaryColor}>Bersama Kami</span>
              </h1>

              <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-xl">
                Dapatkan pengalaman kerja nyata dan bimbingan langsung dari para profesional di industri teknologi. Program magang kami dirancang untuk mengasah skill teknis dan softskill Anda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
                  className={`px-8 py-4 rounded-xl ${bgPrimary} text-white font-bold ${hoverBgPrimary} transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20`}
                >
                  Jelajahi Program <ArrowRight className="w-4 h-4" />
                </button>
                {periodStatus === 'announcement' || periodStatus === 'announced' ? (
                  <button
                    onClick={fetchAnnouncement}
                    className="px-8 py-4 rounded-xl bg-white border border-red-200 text-red-900 font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-red-900/5 animate-bounce"
                  >
                    Lihat Pengumuman
                  </button>
                ) : (
                  <a
                    href="https://rapiertechnology.co.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    Lihat Profil Perusahaan
                  </a>
                )}
              </div>

              {/* Stats/Trusted By */}
              <div className="mt-16 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">— BENEFIT UTAMA</p>
                <div className="flex flex-wrap gap-8 text-sm font-bold text-gray-500">
                  <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${bgPrimary}`}></div> Real Project</span>
                  <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${bgPrimary}`}></div> Dedicated Mentor</span>
                  <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${bgPrimary}`}></div> Sertifikat Industri</span>
                </div>
              </div>
            </div>

            {/* Right Illustration/Image */}
            <div className="hidden lg:flex justify-end relative">
              <div className="relative w-[95%] max-w-[500px]">
                <div className="absolute inset-0 bg-red-100 rounded-[2rem] transform rotate-3 scale-105 opacity-50"></div>
                <img
                  src="/rapier.jpeg"
                  alt="Rapier Technology"
                  className="relative z-10 rounded-[2rem] shadow-xl object-cover object-center aspect-video w-full border border-gray-100"
                />

                {/* Decorative Accent */}
                <div className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-900">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className={`text-[11px] font-bold ${primaryColor} tracking-widest uppercase mb-4`}>— APA YANG KAMI KERJAKAN</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#111827] tracking-tight max-w-2xl leading-[1.1]">
              Satu tim. Beragam peran.<br />
              Ratusan keputusan engineering yang tepat.
            </h3>
            <p className="mt-6 text-gray-500 max-w-2xl text-lg">
              Dari belajar konsep dasar hingga ikut mendeploy aplikasi untuk ribuan user — kami siapkan role sesuai dengan passion kamu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div key={program.id} className="group bg-white border border-gray-100 p-8 rounded-[2rem] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${primaryColor} bg-red-900/5`}>
                      {program.program_code?.includes('FRONT') && <LayoutTemplate className="w-5 h-5" />}
                      {program.program_code?.includes('BACK') && <Database className="w-5 h-5" />}
                      {program.program_code?.includes('UIUX') && <PenTool className="w-5 h-5" />}
                      {program.program_code?.includes('BA') && <Briefcase className="w-5 h-5" />}
                      {program.program_code?.includes('QA') && <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-900/60 bg-red-50 px-2 py-1 rounded-md">{program.program_code}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{program.program_name}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                    {program.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8 mt-2">

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <MapPin className="w-4 h-4 text-red-900" />
                    <span>Tangerang & Semarang</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <button onClick={() => openModal(program)} className={`flex-1 py-2.5 rounded-xl border border-red-900 text-red-900 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center`}>
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keuntungan Magang */}
      <section id="benefits" className="py-24 bg-white relative z-10 border-t border-gray-50">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className={`text-[11px] font-bold ${primaryColor} tracking-widest uppercase mb-4`}>— MENGAPA MEMILIH KAMI</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#111827] tracking-tight max-w-2xl leading-[1.1]">
              Lebih dari sekadar magang. <br /> Ini langkah pertamamu ke industri.
            </h3>
            <p className="mt-4 text-gray-500 max-w-xl text-lg">
              Kami merancang program magang ini agar kamu mendapatkan ilmu praktis, bukan sekadar teori.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center ${primaryColor} mb-6 shadow-sm`}>
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-3">Terlibat di Real Project</h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Tinggalkan simulasi kampus. Di sini kamu akan ikut membangun fitur yang benar-benar digunakan oleh pengguna aktif (production level).
              </p>
            </div>
            <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center ${primaryColor} mb-6 shadow-sm`}>
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-3">Dedicated Mentor</h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Kamu tidak akan dibiarkan kebingungan sendiri. Engineer senior kami siap menjadi mentormu, memberikan review, dan membagikan best practices industri.
              </p>
            </div>
            <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center ${primaryColor} mb-6 shadow-sm`}>
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-3">Office Nyaman & Modern</h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Fasilitas kantor didesain senyaman mungkin untuk mendukung kolaborasi. Kami berupaya membangun lingkungan kerja yang fun tapi tetap profesional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran */}
      <section className="py-24 bg-white relative z-10 border-t border-gray-50">
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className={`text-[11px] font-bold ${primaryColor} tracking-widest uppercase mb-4`}>— CARA BERGABUNG</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-[#111827] tracking-tight">
              Alur Pendaftaran Magang
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-[1.5px] bg-red-100 rounded-full"></div>

            <div className="relative text-center group">
              <div className={`w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-100 shadow-sm flex items-center justify-center relative z-10 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                <div className="text-red-900 font-bold text-lg">1</div>
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Pilih Program</h4>
              <p className="text-gray-500 text-sm leading-relaxed px-2">Pilih role magang yang sesuai dengan peminatan dan skill kamu.</p>
            </div>

            <div className="relative text-center group">
              <div className={`w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-100 shadow-sm flex items-center justify-center relative z-10 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                <div className="text-red-900 font-bold text-lg">2</div>
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Isi Formulir</h4>
              <p className="text-gray-500 text-sm leading-relaxed px-2">Buat akun, lengkapi biodata dan lampirkan portofolio/CV terbaikmu.</p>
            </div>

            <div className="relative text-center group">
              <div className={`w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-100 shadow-sm flex items-center justify-center relative z-10 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                <div className="text-red-900 font-bold text-lg">3</div>
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Seleksi Berkas</h4>
              <p className="text-gray-500 text-sm leading-relaxed px-2">Tim rekrutmen kami akan mereview kesesuaian profilmu.</p>
            </div>

            <div className="relative text-center group">
              <div className={`w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-100 shadow-sm flex items-center justify-center relative z-10 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                <div className="text-red-900 font-bold text-lg">4</div>
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Pengumuman</h4>
              <p className="text-gray-500 text-sm leading-relaxed px-2">Pantau status di portal. Jika lulus, mari mulai berkarya!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 relative overflow-hidden bg-white">
        {/* Soft maroon gradient abstract shapes */}
        <div className={`absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/[0.06] to-transparent blur-3xl -z-10`}></div>
        <div className={`absolute bottom-0 left-0 w-1/3 h-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/[0.04] to-transparent blur-2xl -z-10`}></div>

        <div className="container mx-auto px-6">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-10 md:p-16 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111827] mb-6">Siap memulai <br /> perjalananmu?</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md">
                  Pilih role yang sesuai dengan minatmu. Kami bantu kamu break-down jadi scope dan timeline belajar nyata.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/register')}
                    className={`px-6 py-3.5 rounded-xl ${bgPrimary} text-white font-bold text-sm ${hoverBgPrimary} transition-all shadow-md shadow-red-900/20 flex items-center justify-center gap-2`}
                  >
                    Daftar Magang <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="https://rapiertechnology.co.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all text-center"
                  >
                    Lihat Company Profile
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <a href="mailto:hello@rapiertechnology.co.id" className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:border-red-900/30 hover:shadow-md hover:shadow-red-900/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-900/5 flex items-center justify-center text-red-900">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5 uppercase">Email</div>
                      <div className={`font-bold text-gray-900 group-hover:${primaryColor} transition-colors`}>contact@rapier.co.id</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-red-900 group-hover:translate-x-1 transition-all" />
                </a>

                <a href="https://wa.me/6281297770484" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:border-red-900/30 hover:shadow-md hover:shadow-red-900/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-900/5 flex items-center justify-center text-red-900">
                      <SocialIcon network="whatsapp" bgColor="transparent" fgColor="currentColor" style={{ height: 24, width: 24, margin: 0 }} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5 uppercase">Whatsapp</div>
                      <div className={`font-bold text-gray-900 group-hover:${primaryColor} transition-colors`}>+62 812-9777-0484</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-red-900 group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo rapier.jpg" alt="Rapier Logo" className="h-7 rounded-md" />
                <span className="font-bold tracking-tight text-gray-900">
                  Portal Magang
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[250px]">
                Platform pendaftaran magang resmi Rapier Technology. Raih pengalaman nyata di industri teknologi.
              </p>
              <div className="flex gap-2 mt-6">
                <SocialIcon network="linkedin" url="https://linkedin.com/company/rapitechindonesia" bgColor="transparent" fgColor="#9ca3af" style={{ height: 32, width: 32 }} target="_blank" className="hover:!bg-gray-50 rounded-md transition-colors" />
                <SocialIcon network="instagram" url="https://instagram.com/rapiertechnology" bgColor="transparent" fgColor="#9ca3af" style={{ height: 32, width: 32 }} target="_blank" className="hover:!bg-gray-50 rounded-md transition-colors" />
                <SocialIcon network="tiktok" url="https://www.tiktok.com/@rapiertechnology" bgColor="transparent" fgColor="#9ca3af" style={{ height: 32, width: 32 }} target="_blank" className="hover:!bg-gray-50 rounded-md transition-colors" />
                <SocialIcon network="youtube" url="https://www.youtube.com/@rapiertechnology" bgColor="transparent" fgColor="#9ca3af" style={{ height: 32, width: 32 }} target="_blank" className="hover:!bg-gray-50 rounded-md transition-colors" />
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">PROGRAM MAGANG</h4>
              <ul className="space-y-3">
                {programs.map((program) => (
                  <li key={program.id}>
                    <button
                      onClick={() => {
                        document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => openModal(program), 600);
                      }}
                      className={`text-sm text-gray-600 hover:text-red-900 transition-colors text-left`}
                    >
                      {program.program_name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">PERUSAHAAN</h4>
              <ul className="space-y-3">
                <li><a href="https://rapiertechnology.co.id" className={`text-sm text-gray-600 hover:${primaryColor}`}>Tentang</a></li>
                <li><a href="#" className={`text-sm text-gray-600 hover:${primaryColor}`}>Case Studies</a></li>
                <li><a href="#programs" className={`text-sm text-gray-600 hover:${primaryColor}`}>Karir Magang</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">KONTAK</h4>
              <ul className="space-y-3">
                <li><a href="mailto:contact@rapier.co.id" className={`text-sm text-gray-600 hover:${primaryColor}`}>contact@rapier.co.id</a></li>
                <li><span className="text-sm text-gray-600">+62 812 9777 0484</span></li>
                <li><a href="https://maps.google.com/maps?q=JL.+Iskandar+Muda+No.8,+Neglasari,+Kec.+Neglasari,+Kota+Tangerang" target="_blank" rel="noopener noreferrer" className={`text-sm text-gray-600 hover:${primaryColor}`}>📍 Tangerang, Indonesia</a></li>
                <li><a href="https://maps.google.com/maps?q=JL.+Mulawarman+Selatan+Raya+No.16,+Kramas,+Kec.+Tembalang,+Kota+Semarang" target="_blank" rel="noopener noreferrer" className={`text-sm text-gray-600 hover:${primaryColor}`}>📍 Semarang, Indonesia</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Detail Program */}
      {isModalOpen && selectedProgram && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 p-6 md:p-8 flex justify-between items-center z-10">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${primaryColor}`}>{selectedProgram.program_code}</span>
                <h2 className="text-2xl font-bold mt-1 text-[#111827]">{selectedProgram.program_name}</h2>
              </div>
              <button onClick={closeModal} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-xl transition-colors text-gray-500">✕</button>
            </div>

            <div className="p-6 md:p-8">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-8">
                <p className="text-gray-600 leading-relaxed">{selectedProgram.description}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-red-900 mb-3">📌 Rincian Penugasan/Tanggung Jawab</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                  {selectedProgram.program_code?.includes('FRONT') && (
                    <>
                      <li>Membangun komponen UI menggunakan React.js dan Tailwind CSS</li>
                      <li>Mengintegrasikan frontend dengan REST API</li>
                      <li>Memastikan tampilan responsif di berbagai device</li>
                      <li>Berkolaborasi dengan tim backend dan desainer</li>
                      <li>Melakukan debugging dan optimasi performa</li>
                    </>
                  )}
                  {selectedProgram.program_code?.includes('BACK') && (
                    <>
                      <li>Mengembangkan REST API menggunakan Node.js dan Express</li>
                      <li>Merancang dan mengoptimalkan database SQL</li>
                      <li>Mengimplementasikan autentikasi dan keamanan</li>
                      <li>Melakukan unit testing dan debugging</li>
                      <li>Dokumentasi API</li>
                    </>
                  )}
                  {selectedProgram.program_code?.includes('UIUX') && (
                    <>
                      <li>Melakukan user research dan analisis kebutuhan</li>
                      <li>Membuat wireframe, mockup, dan prototype di Figma</li>
                      <li>Mendesain user interface yang intuitif dan menarik</li>
                      <li>Berkolaborasi dengan developer untuk implementasi desain</li>
                      <li>Melakukan usability testing</li>
                    </>
                  )}
                  {selectedProgram.program_code?.includes('BA') && (
                    <>
                      <li>Mengumpulkan dan menganalisis kebutuhan bisnis</li>
                      <li>Membuat dokumentasi BRD dan FRD</li>
                      <li>Menjadi jembatan antara klien dan tim teknis</li>
                      <li>Memvalidasi solusi yang dikembangkan</li>
                      <li>Membantu dalam proses testing UAT</li>
                    </>
                  )}
                  {selectedProgram.program_code?.includes('QA') && (
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

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-4">💻 Kompetensi Teknis</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.program_code?.includes('FRONT') && ['React.js', 'Tailwind CSS', 'JavaScript', 'REST API', 'Git'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md text-xs font-medium">{skill}</span>
                    ))}
                    {selectedProgram.program_code?.includes('BACK') && ['Node.js', 'Express.js', 'PostgreSQL', 'REST API', 'Git', 'JWT'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-medium">{skill}</span>
                    ))}
                    {selectedProgram.program_code?.includes('UIUX') && ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'User Research'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-md text-xs font-medium">{skill}</span>
                    ))}
                    {selectedProgram.program_code?.includes('BA') && ['BRD/FRD', 'UML', 'BPMN', 'Analytical Thinking', 'Excel'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-md text-xs font-medium">{skill}</span>
                    ))}
                    {selectedProgram.program_code?.includes('QA') && ['Manual Testing', 'Test Case', 'Bug Reporting', 'Selenium', 'Postman'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-4">🤝 Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Komunikasi', 'Kerja Tim', 'Pemecahan Masalah', 'Manajemen Waktu', 'Adaptif'].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-md text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${primaryColor}`} /> Lokasi Penempatan
                  </h3>
                  <div className="space-y-3">
                    <a href="https://maps.google.com/maps?q=JL.+Iskandar+Muda+No.8,+Neglasari,+Kec.+Neglasari,+Kota+Tangerang" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                      <span className="text-gray-400 mt-0.5">📍</span>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Tangerang</div>
                        <div className="text-xs text-gray-500">JL. Iskandar Muda No.8, Neglasari</div>
                      </div>
                    </a>
                    <a href="https://maps.google.com/maps?q=JL.+Mulawarman+Selatan+Raya+No.16,+Kramas,+Kec.+Tembalang,+Kota+Semarang" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                      <span className="text-gray-400 mt-0.5">📍</span>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Semarang</div>
                        <div className="text-xs text-gray-500">JL. Mulawarman Selatan Raya No.16</div>
                      </div>
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">⚠️ Persyaratan Khusus</h3>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600">
                    <li>Mahasiswa aktif semester 6 atau lebih</li>
                    <li>Memiliki laptop pribadi</li>
                    <li>Kesiapan untuk belajar secara mandiri</li>
                    <li>Komitmen waktu minimal 3 bulan</li>
                    <li>Bersedia mengikuti prosedur dan aturan</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                  disabled={periodStatus !== 'open'}
                  onClick={() => {
                    closeModal();
                    navigate('/register', { state: { programCode: selectedProgram.program_code } });
                  }}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${periodStatus === 'open'
                    ? `${bgPrimary} text-white ${hoverBgPrimary} shadow-md`
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {periodStatus === 'open' ? 'Daftar Sekarang' : 'Pendaftaran Ditutup'} {periodStatus === 'open' && <ArrowRight className="w-4 h-4" />}
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

    </div>
  );
}