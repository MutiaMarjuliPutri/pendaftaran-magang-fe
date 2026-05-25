import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Trash2, FileText, CheckCircle, XCircle, Edit2, Upload, Eye, MessageSquare, Clock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/api/axios";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8001";

const schema = z.object({
  title: z.string().min(1, "Judul kegiatan wajib diisi"),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().min(1, "Tanggal selesai wajib diisi"),
  activities: z.array(z.object({
    day: z.string(),
    date: z.string(),
    description: z.string(),
  })).optional(),
  description: z.string().optional(),
  documentation_url: z.string().optional(),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: "Tanggal selesai harus setelah tanggal mulai",
  path: ["end_date"],
});

export default function LogBooks() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userRole = (user?.role || user?.role_name || "").toLowerCase();
  const isMentor = userRole === "mentor";
  const isStudent = userRole === "student" || userRole === "intern";
  const isAdmin = !isStudent && !isMentor;
  const currentUserId = user?.id || user?.user_id;
  const isAccepted = user?.registration?.status?.toLowerCase() === "accepted";
  const isInternActive = user?.intern_status === "active" || !user?.intern_status;

  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/log-books", "log-books");

  const validateMutation = useMutation({
    mutationFn: ({ id, validation, mentor_feedback }) => api.patch(`/master/log-books/${id}/validate`, { validation, mentor_feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(["log-books"]);
      toast.success("Berhasil memperbarui status validasi");
      setIsDetailOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui status validasi");
    },
  });

  const bulkValidateMutation = useMutation({
    mutationFn: ({ ids, validation }) => api.post(`/master/log-books/bulk-validate`, { ids, validation }),
    onSuccess: () => {
      queryClient.invalidateQueries(["log-books"]);
      toast.success("Berhasil melakukan validasi massal");
      setSelectedIds([]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal melakukan validasi massal");
    },
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [feedbackItem, setFeedbackItem] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackValidation, setFeedbackValidation] = useState("waiting");
  const [uploading, setUploading] = useState(false);
  const [activities, setActivities] = useState([]);

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
      title: "",
      start_date: "",
      end_date: "",
      description: "",
      documentation_url: "",
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const generateDateRange = (start, end) => {
    if (!start || !end) return [];
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dateRange = generateDateRange(startDate, endDate);

  const updateActivities = (start, end) => {
    const s = start || startDate;
    const e = end || endDate;
    
    if (!s || !e) return;
    
    const range = generateDateRange(s, e);
    if (range.length === 0) return;
    
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const newActivities = range.map((date, idx) => {
      const dateStr = date.toISOString().split("T")[0];
      const existing = activities.find(a => a.date === dateStr);
      
      return {
        id: idx,
        day: days[date.getDay()],
        date: dateStr,
        description: existing ? existing.description : "",
      };
    });
    setActivities(newActivities);
  };

  const handleActivityChange = (index, value) => {
    const newActivities = [...activities];
    newActivities[index].description = value;
    setActivities(newActivities);
  };

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
      setValue("documentation_url", response.data.path);
      alert("File berhasil diupload!");
    } catch (err) {
      console.error(err);
      alert("Gagal upload file");
    } finally {
      setUploading(false);
    }
  };

  const onAdd = () => {
    setSelectedItem(null);
    reset({
      title: "",
      start_date: "",
      end_date: "",
      description: "",
      documentation_url: "",
    });
    setActivities([]);
    setIsModalOpen(true);
  };

  const onEdit = (row) => {
    setSelectedItem(row);
    reset({
      title: row.title,
      start_date: row.start_date?.split("T")[0] || "",
      end_date: row.end_date?.split("T")[0] || "",
      description: row.description || "",
      documentation_url: row.documentation_url || "",
    });
    if (row.activities) {
      try {
        const parsed = typeof row.activities === 'string' ? JSON.parse(row.activities) : row.activities;
        const s = row.start_date?.split("T")[0];
        const e = row.end_date?.split("T")[0];
        
        if (s && e) {
          const range = generateDateRange(s, e);
          const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
          const fullActivities = range.map((date, idx) => {
            const dateStr = date.toISOString().split("T")[0];
            const existing = parsed.find(a => a.date === dateStr);
            return {
              id: idx,
              day: days[date.getDay()],
              date: dateStr,
              description: existing ? existing.description : "",
            };
          });
          setActivities(fullActivities);
        } else {
          setActivities(parsed);
        }
      } catch {
        setActivities([]);
      }
    }
    setIsModalOpen(true);
  };

  const onDetail = (row) => {
    setDetailItem(row);
    setIsDetailOpen(true);
  };

  const onFeedback = (row) => {
    setFeedbackItem(row);
    setFeedbackText(row.mentor_feedback || "");
    setFeedbackValidation(row.validation || "waiting");
    setIsFeedbackOpen(true);
  };

  const handleFeedbackSubmit = () => {
    validateMutation.mutate(
      { id: feedbackItem.id, validation: feedbackValidation, mentor_feedback: feedbackText },
      {
        onSuccess: () => {
          setIsFeedbackOpen(false);
          setFeedbackItem(null);
        }
      }
    );
  };

  const handleCustomSubmit = async (formData, validationStatus) => {
    const submitData = {
      title: formData.title,
      start_date: formData.start_date,
      end_date: formData.end_date,
      activities: activities.filter(a => a.description.trim()),
      description: formData.description,
      documentation_url: formData.documentation_url,
      validation: validationStatus,
    };

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, updatedData: submitData });
    } else {
      createMutation.mutate(submitData);
    }
    setIsModalOpen(false);
  };

  // Helper function untuk mendapatkan status label
  const getValidationStatus = (validation) => {
    if (validation === "draft") {
      return { label: "Draft", className: "bg-slate-100 text-slate-700 border-slate-200" };
    } else if (validation === "approved" || validation === true || validation === "1") {
      return { label: "Disetujui", className: "bg-green-100 text-green-700 border-green-200" };
    } else if (validation === "rejected" || validation === false) {
      return { label: "Ditolak", className: "bg-red-100 text-red-700 border-red-200" };
    } else {
      return { label: "Menunggu", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    }
  };

  const columns = [
    ...(isMentor ? [{
      header: (
        <input 
          type="checkbox" 
          checked={selectedIds.length === data?.length && data?.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(data?.map(row => row.id) || []);
            } else {
              setSelectedIds([]);
            }
          }}
          className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
        />
      ),
      cell: (row) => (
        <input 
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(prev => [...prev, row.id]);
            } else {
              setSelectedIds(prev => prev.filter(id => id !== row.id));
            }
          }}
          className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
        />
      ),
      className: "w-10 px-6",
    }] : []),
    { 
      header: "No", 
      cell: (row) => <div className="text-center text-sm">{row.no}</div> 
    },
    {
      header: "Tanggal",
      cell: (row) => (
        <div className="text-sm">
          {row.start_date ? new Date(row.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "numeric", year: "numeric" }) : "-"}
          {" - "}
          {row.end_date ? new Date(row.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "numeric", year: "numeric" }) : "-"}
        </div>
      ),
    },
    {
      header: "Kegiatan",
      cell: (row) => (
        <div className="max-w-md">
          <p className="font-medium text-sm">{row.title}</p>
          {isMentor && row.user && (
            <p className="text-xs text-purple-600 font-medium">Mahasiswa: {row.user.full_name}</p>
          )}
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{row.description || "-"}</p>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => {
        const status = getValidationStatus(row.validation);
        return (
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
            status.className
          )}>
            {status.label === "Disetujui" && <CheckCircle size={10} />}
            {status.label === "Ditolak" && <XCircle size={10} />}
            {status.label === "Menunggu" && <Clock size={10} />}
            {status.label === "Draft" && <Edit2 size={10} />}
            {status.label}
          </span>
        );
      },
    },
    {
      header: "Validasi",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {isMentor ? (
            <select
              value={row.validation || "waiting"}
              onChange={(e) => validateMutation.mutate({ id: row.id, validation: e.target.value })}
              className={cn(
                "text-xs px-2 py-1 rounded-full border outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                row.validation === "approved" || row.validation === true || row.validation === "1" ? "bg-green-50 text-green-600 border-green-200" :
                row.validation === "rejected" ? "bg-red-50 text-red-600 border-red-200" :
                "bg-yellow-50 text-yellow-600 border-yellow-200"
              )}
              disabled={validateMutation.isLoading}
            >
              <option value="waiting">Menunggu</option>
              <option value="approved">Setujui</option>
              <option value="rejected">Tolak</option>
            </select>
          ) : (
            <div className="max-w-[200px]">
              {row.mentor_feedback ? (
                <p className="text-xs text-gray-600 italic line-clamp-2" title={row.mentor_feedback}>
                  "{row.mentor_feedback}"
                </p>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "File",
      cell: (row) => (
        row.documentation_url ? (
          <a 
            href={`${BASE_URL}${row.documentation_url}`} 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <FileText size={14} /> PDF
          </a>
        ) : <span className="text-gray-400 text-sm">-</span>
      ),
    },
    {
      header: "Detail",
      cell: (row) => (
        <button 
          onClick={() => onDetail(row)} 
          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
          title="Detail"
        >
          <Eye size={15} />
        </button>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) => {
        let canManage = isAdmin || (!isMentor && (!row.user?.id || row.user.id === currentUserId) && isInternActive);
        if (isStudent && (row.validation === 'approved' || row.validation === true || row.validation === '1')) {
          canManage = false;
        }

        if (isMentor) {
          const hasFeedback = !!row.mentor_feedback;
          return (
            <button
              onClick={() => onFeedback(row)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                hasFeedback 
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
              )}
              title={hasFeedback ? "Edit Feedback" : "Beri Feedback"}
            >
              <MessageSquare size={13} /> {hasFeedback ? "Edit Feedback" : "Beri Feedback"}
            </button>
          );
        }

        if (!canManage) {
          return <span className="text-xs text-gray-400">-</span>;
        }

        return (
          <div className="flex justify-end items-center gap-2">
            <button
              onClick={() => onEdit(row)}
              className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                setSelectedItem(row);
                setIsDeleteOpen(true);
              }}
              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              title="Hapus"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        title="Log Book"
        description="Catatan aktivitas mingguan peserta magang."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={isStudent ? (isAccepted && isInternActive ? onAdd : null) : onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      >
        {isMentor && selectedIds.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {selectedIds.length}
              </span>
              <p className="text-sm font-medium">Logbook terpilih</p>
            </div>
            <div className="h-6 w-px bg-primary/20 mx-2"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkValidateMutation.mutate({ ids: selectedIds, validation: 'approved' })}
                disabled={bulkValidateMutation.isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle size={16} /> Setujui Semua
              </button>
              <button
                onClick={() => bulkValidateMutation.mutate({ ids: selectedIds, validation: 'rejected' })}
                disabled={bulkValidateMutation.isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
              >
                <XCircle size={16} /> Tolak Semua
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </DataTable>

      {isStudent && !isAccepted && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Fitur Log Book Belum Tersedia</h4>
            <p className="text-xs text-amber-700 mt-1">
              Anda baru dapat mengisi log book setelah status pendaftaran Anda dinyatakan <span className="font-bold">DITERIMA</span>. 
              Silakan cek status pendaftaran Anda secara berkala.
            </p>
          </div>
        </div>
      )}
      {isStudent && isAccepted && !isInternActive && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
            <CheckCircle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Program Magang Selesai</h4>
            <p className="text-xs text-amber-700 mt-1">
              Anda telah menyelesaikan program magang Anda. Fitur tambah dan edit log book saat ini telah dinonaktifkan.
            </p>
          </div>
        </div>
      )}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Edit Log Aktivitas" : "Tambah Log Aktivitas Mingguan"}
        onSubmit={handleSubmit((data) => handleCustomSubmit(data, "waiting"))}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        maxWidth="max-w-3xl"
        customFooter={
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => handleCustomSubmit(data, "draft"))}
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="px-6 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold shadow-sm hover:bg-slate-300 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {(createMutation.isLoading || updateMutation.isLoading) && <Loader2 size={16} className="animate-spin" />}
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => handleCustomSubmit(data, "waiting"))}
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {(createMutation.isLoading || updateMutation.isLoading) && <Loader2 size={16} className="animate-spin" />}
              Kirim ke Mentor
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Judul Laporan Mingguan <span className="text-red-500">*</span></label>
            <input 
              {...register("title")} 
              placeholder="Contoh: Laporan Minggu 1 - Backend Development" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                {...register("start_date")} 
                onChange={(e) => { 
                  register("start_date").onChange(e);
                  updateActivities(e.target.value, endDate);
                }}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
              />
              {errors.start_date && <p className="text-xs text-red-500">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Tanggal Selesai <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                {...register("end_date")} 
                onChange={(e) => { 
                  register("end_date").onChange(e);
                  updateActivities(startDate, e.target.value);
                }}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
              />
              {errors.end_date && <p className="text-xs text-red-500">{errors.end_date.message}</p>}
            </div>
          </div>

          {dateRange.length > 0 && (
            <div className="border rounded-lg p-3 bg-gray-50 max-h-96 overflow-y-auto">
              <label className="text-sm font-medium mb-2 block">Aktivitas Harian</label>
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-sm w-20">{activity.day}</span>
                      <span className="text-xs text-gray-500">{activity.date ? activity.date.split('-').reverse().join('/') : '-'}</span>
                    </div>
                    <textarea
                      value={activity.description}
                      onChange={(e) => handleActivityChange(idx, e.target.value)}
                      placeholder="Deskripsikan kegiatan hari ini..."
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      rows="2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Ringkasan / Kesimpulan</label>
            <textarea 
              {...register("description")} 
              rows="3" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
              placeholder="Ringkasan kegiatan selama seminggu..." 
            />
          </div>

          <div>
            <label className="text-sm font-medium">File Dokumentasi (PDF)</label>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700">
                <Upload size={16} />
                {uploading ? "Uploading..." : "Pilih File PDF"}
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
              {watch("documentation_url") && (
                <a 
                  href={`${BASE_URL}${watch("documentation_url")}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <FileText size={14} /> Lihat File
                </a>
              )}
            </div>
            <input type="hidden" {...register("documentation_url")} />
            <p className="text-xs text-gray-400 mt-1">Format PDF, maksimal 5MB</p>
          </div>
        </div>
      </FormModal>

      <DeleteConfirm 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => deleteMutation.mutate(selectedItem?.id)} 
        isLoading={deleteMutation.isLoading} 
      />

      {/* Modal Feedback Mentor */}
      {isFeedbackOpen && feedbackItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-500" /> Beri Feedback
                </h2>
                <p className="text-xs text-gray-500 mt-1">Log Book: <span className="font-semibold text-gray-700">{feedbackItem.title}</span></p>
                {feedbackItem.user && (
                  <p className="text-xs text-purple-600 font-medium mt-0.5">Mahasiswa: {feedbackItem.user.full_name}</p>
                )}
              </div>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Status Validasi */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Status Validasi</label>
                <div className="flex gap-3">
                  {[
                    { value: "waiting", label: "Menunggu", color: "bg-amber-50 border-amber-300 text-amber-700", active: "ring-2 ring-amber-400" },
                    { value: "approved", label: "✓ Setujui", color: "bg-emerald-50 border-emerald-300 text-emerald-700", active: "ring-2 ring-emerald-400" },
                    { value: "rejected", label: "✕ Tolak", color: "bg-rose-50 border-rose-300 text-rose-700", active: "ring-2 ring-rose-400" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFeedbackValidation(opt.value)}
                      className={cn(
                        "flex-1 py-2 rounded-xl border text-xs font-bold transition-all",
                        opt.color,
                        feedbackValidation === opt.value ? opt.active : "opacity-60 hover:opacity-100"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Catatan / Feedback
                  <span className="ml-1 text-xs font-normal text-gray-400">(opsional)</span>
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  placeholder="Tulis catatan atau masukan untuk peserta terkait log book ini..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">{feedbackText.length} karakter</p>
              </div>

              {/* Feedback sebelumnya */}
              {feedbackItem.mentor_feedback && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-indigo-600 mb-1">Catatan sebelumnya:</p>
                  <p className="text-sm text-indigo-800 whitespace-pre-line">{feedbackItem.mentor_feedback}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={validateMutation.isLoading}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MessageSquare size={15} />
                {validateMutation.isLoading ? "Menyimpan..." : "Simpan Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {isDetailOpen && detailItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">Detail Log Book</h2>
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Kolom Info Kiri */}
                <div className="space-y-6 md:col-span-1">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Judul Laporan</label>
                    <p className="text-gray-900 font-medium">{detailItem.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Periode</label>
                    <p className="text-gray-900 text-sm font-medium">
                      {detailItem.start_date ? new Date(detailItem.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                      <br/>
                      <span className="text-gray-400 font-normal">sampai</span>
                      <br/>
                      {detailItem.end_date ? new Date(detailItem.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Status Validasi</label>
                    <div className="mt-1">
                      {detailItem.validation === "approved" || detailItem.validation === true || detailItem.validation === "1" ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-200">
                          <CheckCircle size={14} /> Disetujui
                        </span>
                      ) : detailItem.validation === "rejected" || detailItem.validation === false ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-bold border border-rose-200">
                          <XCircle size={14} /> Ditolak
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-bold border border-amber-200">
                          <XCircle size={14} /> Menunggu
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">File Dokumentasi</label>
                    {detailItem.documentation_url ? (
                      <a 
                        href={`${BASE_URL}${detailItem.documentation_url}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium w-full justify-center"
                      >
                        <FileText size={16} /> Lihat PDF
                      </a>
                    ) : (
                      <p className="text-gray-400 text-sm italic">Tidak ada file lampiran</p>
                    )}
                  </div>

                  {detailItem.mentor_feedback && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1 block">Catatan Mentor</label>
                      <p className="text-sm text-indigo-900 whitespace-pre-line leading-relaxed">{detailItem.mentor_feedback}</p>
                    </div>
                  )}
                </div>

                {/* Kolom Aktivitas Kanan */}
                <div className="md:col-span-2 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <label className="text-sm font-bold text-gray-800 block mb-4 flex items-center gap-2">
                    Aktivitas Harian
                  </label>
                  <div className="space-y-4">
                    {detailItem.activities && Array.isArray(detailItem.activities) && detailItem.activities.length > 0 ? (
                      detailItem.activities.map((act, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="font-bold text-sm text-primary mb-2 flex justify-between items-center border-b border-gray-50 pb-2">
                            <span>{act.day ? act.day : 'Hari'}</span>
                            <span className="text-xs font-normal text-gray-400">
                              {act.date ? act.date.split('-').reverse().join('/') : (act.date_display || "-")}
                            </span>
                          </div>
                          <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                            {act.description || <span className="text-gray-400 italic">Tidak ada catatan untuk hari ini.</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                         <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{detailItem.description || "Tidak ada deskripsi kegiatan."}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-100 gap-3 bg-gray-50/50">
              {isMentor && (
                <select
                  value={detailItem.validation || "waiting"}
                  onChange={(e) => validateMutation.mutate({ id: detailItem.id, validation: e.target.value })}
                  className={cn(
                    "px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm shadow-sm",
                    detailItem.validation === "approved" || detailItem.validation === true || detailItem.validation === "1" ? "bg-emerald-600 text-white border-emerald-700" :
                    detailItem.validation === "rejected" ? "bg-rose-600 text-white border-rose-700" :
                    "bg-amber-500 text-white border-amber-600"
                  )}
                  disabled={validateMutation.isLoading}
                >
                  <option value="waiting" className="text-gray-800 bg-white">Menunggu</option>
                  <option value="approved" className="text-gray-800 bg-white">Setujui</option>
                  <option value="rejected" className="text-gray-800 bg-white">Tolak</option>
                </select>
              )}
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="px-6 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
