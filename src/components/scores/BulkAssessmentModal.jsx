import { useState, useEffect, useMemo } from "react";
import FormModal from "@/components/shared/FormModal";
import { User, ClipboardList, AlertCircle, CheckCircle2, Edit2, Plus } from "lucide-react";
import api from "@/api/axios";
import { toast } from "react-hot-toast";

export default function BulkAssessmentModal({ isOpen, onClose, registrations = [], criteria = [], onSuccess, initialRegistrationId = "" }) {
  const [selectedRegId, setSelectedRegId] = useState("");
  const [scores, setScores] = useState({}); // { criteria_id: { score: number, notes: string } }
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingScores, setIsFetchingScores] = useState(false);

  // Initialize scores when criteria or selected registration changes
  useEffect(() => {
    if (isOpen) {
      setSelectedRegId(initialRegistrationId);
    }
  }, [isOpen, initialRegistrationId]);

  useEffect(() => {
    if (selectedRegId) {
      fetchExistingScores(selectedRegId);
    } else {
      setScores({});
    }
  }, [selectedRegId, criteria]);

  const fetchExistingScores = async (regId) => {
    setIsFetchingScores(true);
    try {
      const response = await api.get(`/master/scores/registration/${regId}`);
      const existingData = response.data.data.scores || [];
      
      const newScores = {};
      criteria.forEach(c => {
        const found = existingData.find(s => (s.criterion?.id === c.id || s.criteria_id === c.id));
        newScores[c.id] = {
          score: found ? parseFloat(found.score) : 0,
          notes: found ? found.notes : ""
        };
      });
      setScores(newScores);
    } catch (error) {
      console.error("Error fetching existing scores:", error);
      // fallback to empty
      const newScores = {};
      criteria.forEach(c => {
        newScores[c.id] = { score: 0, notes: "" };
      });
      setScores(newScores);
    } finally {
      setIsFetchingScores(false);
    }
  };

  const getKeterangan = (score) => {
    if (score > 80) return "SANGAT BAIK";
    if (score >= 71) return "BAIK";
    if (score >= 61) return "CUKUP";
    return "KURANG";
  };

  const handleScoreChange = (criteriaId, value) => {
    const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
    const autoNotes = getKeterangan(numValue);
    
    setScores(prev => ({
      ...prev,
      [criteriaId]: { 
        ...prev[criteriaId], 
        score: numValue,
        notes: autoNotes
      }
    }));
  };

  const handleNoteChange = (criteriaId, value) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], notes: value }
    }));
  };

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0);
  }, [scores]);

  const averageScore = useMemo(() => {
    const count = criteria.length;
    return count > 0 ? (totalScore / count).toFixed(2) : 0;
  }, [totalScore, criteria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRegId) {
      toast.error("Pilih peserta terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        registration_id: selectedRegId,
        scores: Object.entries(scores).map(([criteria_id, data]) => ({
          criteria_id,
          score: data.score,
          notes: data.notes || ""
        }))
      };

      console.log("Saving Payload:", payload);
      const response = await api.post("/master/scores/bulk", payload);
      console.log("Save Response:", response.data);
      
      toast.success("Penilaian berhasil disimpan");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Save Error Details:", error.response?.data || error);
      const msg = error.response?.data?.message || error.message || "Gagal menyimpan penilaian";
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRegistration = registrations.find(r => r.id === selectedRegId);

  return (
    <FormModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Form Penilaian Magang" 
      onSubmit={handleSubmit}
      isLoading={isLoading}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-muted/30 rounded-2xl p-6 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    Pilih Peserta Magang
                  </label>
                  <button 
                    type="button"
                    onClick={() => navigate("/master/assessment-criteria")}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus size={10} /> Tambah Parameter
                  </button>
                </div>
                <select 
                  value={selectedRegId}
                  onChange={(e) => setSelectedRegId(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all shadow-sm"
                >
                  <option value="">-- Pilih Peserta --</option>
                  {registrations?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.intern?.name} ({r.registration_number})
                    </option>
                  ))}
                </select>
            </div>

            {selectedRegistration && (
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">NIM</p>
                  <p className="font-extrabold text-sm text-foreground">{selectedRegistration.intern?.student?.username || "-"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Divisi</p>
                  <p className="font-extrabold text-sm text-foreground truncate">{selectedRegistration.position?.name || "-"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Jurusan</p>
                  <p className="font-extrabold text-xs text-foreground truncate">{selectedRegistration.intern?.university || "-"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Prodi</p>
                  <p className="font-extrabold text-xs text-foreground truncate">{selectedRegistration.intern?.major || "-"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedRegId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ClipboardList size={18} className="text-primary" />
                Parameter Penilaian
              </h3>
              {isFetchingScores && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Mengambil data...
                </div>
              )}
            </div>

            <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/50 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-4 w-12 text-center text-xs uppercase tracking-widest">No</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest">Parameter Penilaian</th>
                    <th className="px-6 py-4 w-28 text-xs uppercase tracking-widest text-center">Nilai</th>
                    <th className="px-6 py-4 w-48 text-xs uppercase tracking-widest">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {criteria.map((c, index) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 text-center font-bold text-muted-foreground">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-sm group-hover:text-primary transition-colors">{c.criteria_name}</p>
                            <button 
                              type="button"
                              onClick={() => {
                                if(confirm("Buka halaman pengaturan kriteria? Data yang belum disimpan akan hilang.")) {
                                  window.location.href = "/master/assessment-criteria";
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded text-primary transition-all"
                              title="Edit parameter ini"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-line">{c.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={scores[c.id]?.score || 0}
                          onChange={(e) => handleScoreChange(c.id, e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border-2 border-input bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-center"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text"
                          placeholder="Keterangan..."
                          value={scores[c.id]?.notes || ""}
                          onChange={(e) => handleNoteChange(c.id, e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all text-xs font-medium"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50 font-black border-t-2 border-border">
                  <tr>
                    <td colSpan="2" className="px-8 py-5 text-right text-sm uppercase tracking-widest text-muted-foreground">Jumlah Nilai :</td>
                    <td className="px-6 py-5 text-center text-xl text-primary">{totalScore}</td>
                    <td className="px-6 py-5"></td>
                  </tr>
                  <tr className="bg-primary/5 text-primary">
                    <td colSpan="2" className="px-8 py-6 text-right text-base uppercase tracking-widest">Nilai Akhir :</td>
                    <td className="px-6 py-6 text-center text-3xl font-black">{averageScore}</td>
                    <td className="px-6 py-6"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border text-muted-foreground gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <User size={32} className="opacity-20" />
            </div>
            <p className="text-sm font-medium">Silakan pilih peserta untuk memulai penilaian</p>
          </div>
        )}
      </div>
    </FormModal>
  );
}
