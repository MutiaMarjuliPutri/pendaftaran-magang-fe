import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, FileText, ExternalLink, User, Upload, X, Eye, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import api, { FILE_URL } from "@/api/axios";

const schema = z.object({
  internship_program_id: z.string().min(1, "Program magang wajib dipilih"),
  status_id: z.string().min(1, "Status wajib dipilih"),
  position_id: z.string().optional(),
  duration: z.coerce.number().min(1, "Durasi minimal 1 bulan"),
  notes: z.string().optional(),
  interview_date: z.string().optional().nullable(),
});

export default function Registrations() {
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/registrations", "registrations");

  const { data: programs } = useQuery({ queryKey: ["programs-all"], queryFn: async () => (await api.get("/master/internship-programs/all")).data.data });
  const { data: statuses } = useQuery({ queryKey: ["statuses-all"], queryFn: async () => (await api.get("/master/registration-statuses/all")).data.data });
  const { data: placements } = useQuery({ queryKey: ["placements-all"], queryFn: async () => (await api.get("/master/placements/all")).data.data });

  const [activeStatus, setActiveStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [quickInterviewModal, setQuickInterviewModal] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cvFileName, setCvFileName] = useState("");
  const [cvFileUrl, setCvFileUrl] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      internship_program_id: "",
      status_id: "",
      position_id: "",
      duration: 3,
      notes: "",
      interview_date: "",
    },
  });

  const watchStatusId = watch("status_id");
  const selectedStatus = statuses?.find(s => s.id === watchStatusId);
  const isInterviewStatus = selectedStatus?.name === "interview1" || selectedStatus?.name === "interview2";

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCvFileUrl(response.data.path);
      setCvFileName(file.name);
      alert("File CV berhasil diupload!");
    } catch (err) {
      console.error(err);
      alert("Gagal upload file CV");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setCvFileUrl("");
    setCvFileName("");
  };

  const onAdd = () => {
    setSelectedItem(null);
    reset({
      internship_program_id: "",
      status_id: "",
      position_id: "",
      duration: 3,
      notes: "",
      interview_date: "",
    });
    setCvFileUrl("");
    setCvFileName("");
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    let formattedInterviewDate = "";
    if (item.interview_date) {
      const date = new Date(item.interview_date);
      const tzOffset = date.getTimezoneOffset() * 60000;
      formattedInterviewDate = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    }
    reset({
      internship_program_id: item.internship_program_id,
      status_id: item.status_id,
      position_id: item.position_id || "",
      duration: item.duration,
      notes: item.notes || "",
      interview_date: formattedInterviewDate,
    });
    setCvFileUrl("");
    setCvFileName("");
    setIsModalOpen(true);
  };

  const onSubmit = (formData) => {
    const submitData = {
      ...formData,
      interview_date: formData.interview_date || null
    };
    const finalData = selectedItem
      ? submitData
      : {
          ...submitData,
          cv_file: cvFileUrl,
        };

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, updatedData: finalData }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createMutation.mutate(finalData, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleQuickStatusUpdate = (id, statusId) => {
    updateMutation.mutate({ id, updatedData: { status_id: statusId } });
  };

  const handleStatusFilter = (statusId) => {
    setActiveStatus(statusId);
    setParams((prev) => ({ ...prev, status_id: statusId, page: 1 }));
  };

  const columns = [
    {
      header: "Nomor & Peserta",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User size={14} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-primary font-bold">{row.registration_number}</p>
            <p className="font-semibold">{row.intern?.name || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Program & Penempatan",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.program?.program_name || "-"}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-bold uppercase">{row.position?.name || "Belum Ditentukan"}</span>
            <span className="text-[10px] text-muted-foreground">{row.duration} Bulan</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => {
        const statusColors = {
          pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          interview1: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          interview2: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
          accepted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
          documents_review: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        };
        const colorClass = statusColors[row.status?.name] || "bg-primary/10 text-primary border-primary/20";
        return (
          <div className="flex flex-col gap-1.5 items-start">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border ${colorClass}`}>
              {row.status?.name?.replace("_", " ") || "Pending"}
            </span>
            {row.interview_date && (
              <span className="text-[9px] text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 border border-blue-500/10" title="Jadwal Wawancara">
                <Calendar size={10} />
                {new Date(row.interview_date).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                })} WIB
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Dokumen",
      cell: (row) => (
        <div className="flex gap-2">
          {row.cv_file && (
            <a 
              href={`${FILE_URL}${row.cv_file}`} 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all" 
              title="Lihat CV"
            >
              <FileText size={14} />
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end items-center gap-2">
          <select
            value={row.status_id}
            onChange={(e) => {
              const val = e.target.value;
              const sObj = statuses?.find(s => s.id === val);
              if (sObj?.name === "interview1" || sObj?.name === "interview2") {
                setQuickInterviewModal({ id: row.id, status_id: val, status_name: sObj.name });
              } else {
                handleQuickStatusUpdate(row.id, val);
              }
            }}
            className="h-8 bg-muted border-none text-[10px] font-bold uppercase rounded-lg px-2 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all hover:bg-muted/80"
          >
            {statuses?.map((s) => (
              <option key={s.id} value={s.id} className="text-black bg-white">
                {s.name.replace("_", " ")}
              </option>
            ))}
          </select>
          <button onClick={() => setSelectedDetailItem(row)} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Lihat Detail">
            <Eye size={16} />
          </button>
          <button onClick={() => onEdit(row)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedItem(row);
              setIsDeleteOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Daftar Pendaftaran"
        description="Pantau dan kelola seluruh aplikasi magang yang masuk."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      >
        <div className="flex flex-wrap gap-1.5 py-1.5">
          <button
            onClick={() => handleStatusFilter("")}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
              activeStatus === ""
                ? "bg-[#3D2925] text-white border-[#3D2925] shadow-sm shadow-[#3D2925]/25"
                : "bg-background text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
            }`}
          >
            Semua
          </button>
          {statuses?.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusFilter(status.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                activeStatus === status.id
                  ? "bg-[#3D2925] text-white border-[#3D2925] shadow-sm shadow-[#3D2925]/25"
                  : "bg-background text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
              }`}
            >
              {status.name.replace("_", " ")}
            </button>
          ))}
        </div>
      </DataTable>



      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Edit Pendaftaran" : "Tambah Pendaftaran"}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Program Magang <span className="text-red-500">*</span></label>
              <select {...register("internship_program_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                <option value="">Pilih Program</option>
                {programs?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.program_name}
                  </option>
                ))}
              </select>
              {errors.internship_program_id && <p className="text-xs text-destructive">{errors.internship_program_id.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lokasi Penempatan</label>
              <select {...register("position_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                <option value="">Pilih Lokasi</option>
                {placements?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Pendaftaran <span className="text-red-500">*</span></label>
              <select {...register("status_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                <option value="">Pilih Status</option>
                {statuses?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.status_id && <p className="text-xs text-destructive">{errors.status_id.message}</p>}
            </div>
            {isInterviewStatus && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium">Tanggal & Waktu Wawancara <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  {...register("interview_date")}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                />
                {errors.interview_date && <p className="text-xs text-destructive">{errors.interview_date.message}</p>}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Durasi (Bulan)</label>
              <input
                type="number"
                {...register("duration")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              />
              {errors.duration && <p className="text-xs text-destructive">{errors.duration.message}</p>}
            </div>
            {!selectedItem && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload CV (PDF)</label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white cursor-pointer transition-all ${uploading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}>
                    <Upload size={16} />
                    {uploading ? "Uploading..." : "Pilih File PDF"}
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                  {cvFileName && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText size={14} />
                      <span className="truncate max-w-[150px]">{cvFileName}</span>
                      <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">Format PDF, maksimal 5MB</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan Tambahan</label>
              <textarea
                {...register("notes")}
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder="Catatan internal..."
              />
            </div>
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />

      {quickInterviewModal && (
        <FormModal
          isOpen={!!quickInterviewModal}
          onClose={() => setQuickInterviewModal(null)}
          title={`Jadwalkan Wawancara (${quickInterviewModal.status_name.replace("_", " ")})`}
          onSubmit={(e) => {
            e.preventDefault();
            const dateVal = e.target.elements.quick_interview_date.value;
            const notesVal = e.target.elements.quick_notes.value;
            if (!dateVal) {
              alert("Tanggal wawancara wajib diisi");
              return;
            }
            updateMutation.mutate({
              id: quickInterviewModal.id,
              updatedData: {
                status_id: quickInterviewModal.status_id,
                interview_date: dateVal,
                notes: notesVal || undefined,
              }
            }, {
              onSuccess: () => setQuickInterviewModal(null)
            });
          }}
          isLoading={updateMutation.isLoading}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal & Waktu Wawancara <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                name="quick_interview_date"
                required
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan Tambahan (opsional)</label>
              <textarea
                name="quick_notes"
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder="Misal: Link Meet / Zoom, atau instruksi pengerjaan tes..."
              />
            </div>
          </div>
        </FormModal>
      )}

      {selectedDetailItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedDetailItem(null)}></div>
          <div className="relative w-full max-w-4xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="text-xl font-bold tracking-tight">Detail Pendaftar</h3>
              <button onClick={() => setSelectedDetailItem(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                  <User size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">{selectedDetailItem.intern?.name || "N/A"}</h4>
                  <p className="text-sm text-muted-foreground">{selectedDetailItem.intern?.email || "N/A"}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-muted rounded text-xs font-semibold">{selectedDetailItem.registration_number}</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold uppercase">{selectedDetailItem.status?.name?.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Informasi Akademik</p>
                    <div className="bg-muted/30 p-3 rounded-xl space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Instansi:</span>
                        <p className="font-medium">{selectedDetailItem.intern?.university || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Jurusan:</span>
                        <p className="font-medium">{selectedDetailItem.intern?.major || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Semester/Kelas:</span>
                        <p className="font-medium">{selectedDetailItem.intern?.semester || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Kontak & Domisili</p>
                    <div className="bg-muted/30 p-3 rounded-xl space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">No. Telepon / WhatsApp:</span>
                        <p className="font-medium">{selectedDetailItem.intern?.phone || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Alamat Domisili:</span>
                        <p className="font-medium">{selectedDetailItem.intern?.address || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Program Magang</p>
                    <div className="bg-muted/30 p-3 rounded-xl space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Program:</span>
                        <p className="font-medium">{selectedDetailItem.program?.program_name || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Posisi:</span>
                        <p className="font-medium">{selectedDetailItem.position?.name || "Belum Ditentukan"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Durasi:</span>
                        <p className="font-medium">{selectedDetailItem.duration} Bulan</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Batch:</span>
                        <p className="font-medium">{selectedDetailItem.intern?.batch || "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tanggal Daftar:</span>
                        <p className="font-medium">{selectedDetailItem.registration_date ? new Date(selectedDetailItem.registration_date).toLocaleDateString("id-ID") : "-"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedDetailItem.cv_file && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Dokumen</p>
                      <a href={`${FILE_URL}${selectedDetailItem.cv_file}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl text-sm font-bold transition-all w-full justify-center">
                        <FileText size={16} /> Lihat CV (PDF)
                      </a>
                    </div>
                  )}
                  {selectedDetailItem.interview_date && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Jadwal Wawancara</p>
                      <div className="bg-blue-500/10 text-blue-700 p-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(selectedDetailItem.interview_date).toLocaleString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })} WIB
                      </div>
                    </div>
                  )}
                  {selectedDetailItem.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Catatan</p>
                      <div className="bg-amber-500/10 text-amber-700 p-3 rounded-xl text-sm">
                        {selectedDetailItem.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
              <button onClick={() => setSelectedDetailItem(null)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90 transition-all">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
