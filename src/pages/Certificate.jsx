import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { ArrowLeft, Printer } from "lucide-react";

export default function Certificate() {
  const { id } = useParams();

  // Fetch report based on ID to get intern details
  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => (await api.get(`/master/reports/${id}`)).data.data,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close(); // Tutup tab karena dibuka di tab baru
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">Sertifikat tidak ditemukan</h1>
        <button onClick={handleClose} className="mt-4 flex items-center gap-2 text-red-600 hover:underline cursor-pointer">
          <ArrowLeft size={16} /> Tutup Tab
        </button>
      </div>
    );
  }

  // Nama intern dari database
  const internName = report?.intern?.name || "Fadila Islami Nisa";

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-4 print:p-0 print:bg-white flex flex-col items-center justify-center font-sans">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;500;600;700;800;900&display=swap');
          
          .font-script {
            font-family: 'Great Vibes', cursive;
          }
          .font-montserrat {
            font-family: 'Montserrat', sans-serif;
          }
          
          @media print {
            @page { size: A4 landscape; margin: 0; }
            body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}
      </style>

      {/* Controls - Fixed at top with high z-index to ensure clickability */}
      <div className="w-full max-w-[1122px] flex justify-between items-center mb-6 print:hidden relative z-[100]">
        <button 
          onClick={handleClose} 
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 rounded-lg shadow-md hover:bg-gray-100 transition-all font-bold cursor-pointer"
        >
          <ArrowLeft size={18} /> Tutup Tab
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all font-bold cursor-pointer"
        >
          <Printer size={18} /> Unduh (Print ke PDF)
        </button>
      </div>

      {/* Certificate Container - Landscape A4 Proportion (1122x793 px) */}
      <div className="w-[1122px] h-[793px] bg-white relative shadow-2xl overflow-hidden print:shadow-none print:w-[297mm] print:h-[210mm] print:m-0 font-montserrat flex">
        
        {/* Inner Thin Border */}
        <div className="absolute inset-4 border-[1px] border-gray-900 z-10 pointer-events-none"></div>

        {/* Top Left Decoration (Red, Black, Dots) */}
        <div className="absolute top-0 left-0 w-64 h-64 z-0 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Dark polygon */}
            <polygon points="0,0 120,0 0,120" fill="#1e1e1e" />
            <polygon points="0,20 80,0 160,0 0,160" fill="#1e1e1e" opacity="0.8" />
            {/* Red diamond / square */}
            <rect x="60" y="30" width="40" height="40" fill="#e53e3e" transform="rotate(25 80 50)" />
            <rect x="100" y="10" width="30" height="40" fill="#1e1e1e" transform="rotate(35 115 30)" />
            
            {/* Dots Grid */}
            <circle cx="20" cy="110" r="4" fill="#e53e3e" />
            <circle cx="40" cy="110" r="4" fill="#a0aec0" />
            <circle cx="60" cy="110" r="4" fill="#e53e3e" />
            
            <circle cx="30" cy="130" r="4" fill="#1e1e1e" />
            <circle cx="50" cy="130" r="4" fill="#e53e3e" />
            <circle cx="70" cy="130" r="4" fill="#a0aec0" />
            
            <circle cx="20" cy="150" r="4" fill="#e53e3e" />
            <circle cx="40" cy="150" r="4" fill="#1e1e1e" />
          </svg>
        </div>

        {/* Bottom Right Decoration (Red, Black, Dots) */}
        <div className="absolute bottom-0 right-0 w-80 h-80 z-0 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <polygon points="200,200 80,200 200,80" fill="#e53e3e" />
            <polygon points="200,200 120,200 200,120" fill="#1e1e1e" />
            
            <polygon points="60,200 140,200 200,140 200,60" fill="#e53e3e" opacity="0.9" />
            <polygon points="100,200 180,200 200,180 200,100" fill="#1e1e1e" />
            
            {/* Red and Black shapes */}
            <rect x="120" y="140" width="40" height="40" fill="#e53e3e" transform="rotate(45 140 160)" />
            <rect x="80" y="160" width="30" height="30" fill="#1e1e1e" transform="rotate(25 95 175)" />

            {/* Dots Grid */}
            <circle cx="150" cy="100" r="4" fill="#cbd5e1" />
            <circle cx="170" cy="100" r="4" fill="#cbd5e1" />
            
            <circle cx="140" cy="120" r="4" fill="#cbd5e1" />
            <circle cx="160" cy="120" r="4" fill="#cbd5e1" />
            <circle cx="180" cy="120" r="4" fill="#cbd5e1" />
            
            <circle cx="130" cy="140" r="4" fill="#cbd5e1" />
            <circle cx="150" cy="140" r="4" fill="#cbd5e1" />
            <circle cx="170" cy="140" r="4" fill="#cbd5e1" />
            
            <circle cx="120" cy="160" r="4" fill="#cbd5e1" />
            <circle cx="140" cy="160" r="4" fill="#cbd5e1" />
          </svg>
        </div>

        {/* Bottom Left Square Decoration */}
        <div className="absolute bottom-10 left-10 w-16 h-16 z-0 pointer-events-none">
          <div className="w-8 h-8 border-2 border-gray-800 absolute bottom-0 left-0"></div>
          <div className="w-8 h-8 border-2 border-gray-800 absolute top-0 right-0"></div>
        </div>
        
        {/* Top Right Square Decoration */}
        <div className="absolute top-8 right-8 w-16 h-16 z-0 pointer-events-none">
          <div className="w-8 h-8 border-2 border-gray-800 absolute top-0 right-0"></div>
          <div className="w-8 h-8 border-2 border-gray-800 absolute bottom-0 left-0"></div>
          <div className="w-8 h-8 border-[1px] border-gray-800 absolute top-2 right-2"></div>
        </div>

        {/* Logo Top Right */}
        <div className="absolute top-16 right-20 z-10 flex flex-col items-center justify-center">
           <div className="relative flex flex-col items-center px-6 py-2">
              <div className="absolute -left-2 top-0 w-12 h-20 border-l-4 border-t-4 border-b-4 border-red-600 rounded-l-full"></div>
              <div className="absolute -left-1 top-2 w-10 h-16 border-l-4 border-t-4 border-b-4 border-gray-300 rounded-l-full"></div>
              
              <h2 className="text-2xl font-black text-gray-900 tracking-widest leading-none">RAPIER</h2>
              <h3 className="text-[10px] font-black text-gray-900 tracking-[0.2em] leading-none mt-1">TECHNOLOGY</h3>
              <h4 className="text-[8px] font-bold text-gray-800 tracking-[0.2em] leading-none mt-1">INTERNATIONAL</h4>
              
              <div className="absolute -right-2 bottom-0 w-16 h-8 border-b-4 border-r-4 border-red-600 rounded-br-full"></div>
           </div>
        </div>

        {/* Main Content */}
        <div className="w-full h-full flex flex-col items-center justify-start pt-40 px-32 z-20 text-center">
          
          <h1 className="text-3xl font-black text-gray-900 tracking-[0.2em] mb-12 uppercase">
            Sertifikat Internship
          </h1>

          <p className="text-lg font-bold text-gray-900 tracking-widest mb-4">
            DIBERIKAN KEPADA :
          </p>
          
          <h2 className="text-[5rem] font-script text-gray-900 mb-8" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.1)", lineHeight: "1.2" }}>
            {internName}
          </h2>
          
          <p className="text-[17px] text-gray-900 font-medium max-w-[800px] leading-relaxed mb-16">
            atas kelulusannya mengikuti program <strong>"Internship di Rapier Technology International"</strong> yang dilakukan pada tanggal 04 Agustus 2025 - 30 November 2025. Terimakasih atas partisipasinya, semoga menjadi ilmu yang bermanfaat.
          </p>

          <div className="w-full flex justify-between items-end px-16 mt-auto mb-20">
            
            {/* Left Signature block */}
            <div className="text-center relative w-72 flex flex-col items-center">
              <p className="text-sm font-black text-gray-900 tracking-widest mb-4">30 NOVEMBER 2025</p>
              
              {/* Fake Signature & Stamp */}
              <div className="relative h-28 w-48 flex items-center justify-center my-2">
                 <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                    <div className="absolute -left-2 top-0 w-8 h-20 border-l-2 border-t-2 border-b-2 border-red-600 rounded-l-full"></div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-widest leading-none">RAPIER</h2>
                    <h3 className="text-[10px] font-black text-gray-900 tracking-[0.2em] leading-none mt-1">TECHNOLOGY</h3>
                    <h4 className="text-[8px] font-bold text-gray-800 tracking-[0.2em] leading-none mt-1">INTERNATIONAL</h4>
                    <div className="absolute -right-2 bottom-0 w-12 h-6 border-b-2 border-r-2 border-red-600 rounded-br-full"></div>
                 </div>
                 {/* Fake Signature Lines */}
                 <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full text-gray-800 opacity-90" preserveAspectRatio="none">
                    <path d="M 30 80 Q 50 10 90 70 T 130 30 T 170 80" fill="transparent" stroke="currentColor" strokeWidth="2" />
                    <path d="M 40 50 Q 100 100 160 40" fill="transparent" stroke="currentColor" strokeWidth="1" />
                    <path d="M 60 40 Q 80 30 100 60" fill="transparent" stroke="currentColor" strokeWidth="1.5" />
                 </svg>
              </div>

              <div className="w-full h-px bg-gray-900 mb-2 mt-4"></div>
              <p className="text-[13px] font-black text-gray-900 tracking-widest">OKTAVIA DINA PRAHARSIWI,S.M</p>
              <p className="text-[11px] font-bold text-gray-800">HR Rapier Teknologi Internasional</p>
            </div>
            
            {/* Golden Ribbon Badge in the Middle */}
            <div className="absolute left-1/2 bottom-12 -translate-x-1/2 flex justify-center items-center">
              <div className="relative w-36 h-36 flex justify-center items-center">
                 {/* Ribbons */}
                 <div className="absolute bottom-[-40px] left-6 w-10 h-24 bg-[#d97706] origin-top transform rotate-[25deg] z-0 shadow-md border-x border-[#b45309]">
                    <div className="absolute bottom-0 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[20px] border-l-transparent border-r-transparent border-b-white"></div>
                 </div>
                 <div className="absolute bottom-[-40px] right-6 w-10 h-24 bg-[#d97706] origin-top transform -rotate-[25deg] z-0 shadow-md border-x border-[#b45309]">
                    <div className="absolute bottom-0 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[20px] border-l-transparent border-r-transparent border-b-white"></div>
                 </div>
                 
                 {/* Circle Badge */}
                 <div className="relative w-28 h-28 bg-[#f59e0b] rounded-full border-4 border-[#fcd34d] shadow-xl flex items-center justify-center z-10">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#b45309] flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#fbbf24] rounded-full shadow-inner border border-[#d97706]"></div>
                    </div>
                    {/* Gear / Sunburst edges */}
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className="absolute w-2 h-4 bg-[#f59e0b] rounded-sm" style={{ transform: `rotate(${i * 15}deg) translateY(-54px)` }}></div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="w-72"></div> {/* Spacer for balance */}

          </div>
        </div>

      </div>
    </div>
  );
}
