import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Trash2, FileText, CheckCircle, XCircle, Edit2, Upload, Eye } from "lucide-react";
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

  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/log-books", "log-books");

  const validateMutation = useMutation({
    mutationFn: ({ id, validation }) => api.patch(`/master/log-books/${id}/validate`, { validation }),
    onSuccess: () => {
      queryClient.invalidateQueries(["log-books"]);
      toast.success("Berhasil memperbarui status validasi");
      setIsDetailOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui status validasi");
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
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
        setActivities(parsed);
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

  const onSubmit = async (formData) => {
    const submitData = {
      title: formData.title,
      start_date: formData.start_date,
      end_date: formData.end_date,
      activities: activities.filter(a => a.description.trim()),
      description: formData.description,
      documentation_url: formData.documentation_url,
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
    if (validation === "approved" || validation === true || validation === "1") {
      return { label: "Disetujui", className: "bg-green-100 text-green-700 border-green-200" };
    } else if (validation === "rejected" || validation === false) {
      return { label: "Ditolak", className: "bg-red-100 text-red-700 border-red-200" };
    } else {
      return { label: "Menunggu", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    }
  };

  const columns = [
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
            {status.label === "Menunggu" && <XCircle size={10} />}
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
            <span className="text-xs text-gray-500">-</span>
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
        const canManage = isAdmin || (!isMentor && (!row.user?.id || row.user.id === currentUserId));

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
        onAdd={isStudent ? (isAccepted ? onAdd : null) : onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

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

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Edit Log Aktivitas" : "Tambah Log Aktivitas Mingguan"}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        maxWidth="max-w-3xl"
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

      {/* Modal Detail */}
      {isDetailOpen && detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detail Log Book</h2>
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Judul</label>
                <p className="text-gray-800 font-medium">{detailItem.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Periode</label>
                <p className="text-gray-800">
                  {detailItem.start_date ? new Date(detailItem.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  {" - "}
                  {detailItem.end_date ? new Date(detailItem.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status Validasi</label>
                <div className="mt-1">
                  {detailItem.validation === "approved" || detailItem.validation === true || detailItem.validation === "1" ? (
                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs border border-green-200">
                      <CheckCircle size={12} /> Disetujui
                    </span>
                  ) : detailItem.validation === "rejected" || detailItem.validation === false ? (
                    <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs border border-red-200">
                      <XCircle size={12} /> Ditolak
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs border border-yellow-200">
                      <XCircle size={12} /> Menunggu
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Aktivitas Harian</label>
                <div className="space-y-3">
                  {detailItem.activities && Array.isArray(detailItem.activities) && detailItem.activities.length > 0 ? (
                    detailItem.activities.map((act, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                        <div className="font-medium text-sm text-purple-700">
                          {act.day ? `${act.day}, ` : ''}
                          {act.date ? act.date.split('-').reverse().join('/') : (act.date_display || "-")}
                        </div>
                        <div className="whitespace-pre-line text-sm mt-1">{act.description || "-"}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">{detailItem.description || "-"}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">File Dokumentasi</label>
                <div className="mt-1">
                  {detailItem.documentation_url ? (
                    <a 
                      href={`${BASE_URL}${detailItem.documentation_url}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <FileText size={14} /> Lihat PDF
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm">-</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t gap-2">
              {isMentor && (
                <select
                  value={detailItem.validation || "waiting"}
                  onChange={(e) => validateMutation.mutate({ id: detailItem.id, validation: e.target.value })}
                  className={cn(
                    "px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm",
                    detailItem.validation === "approved" || detailItem.validation === true || detailItem.validation === "1" ? "bg-green-600 text-white border-green-700" :
                    detailItem.validation === "rejected" ? "bg-red-600 text-white border-red-700" :
                    "bg-yellow-500 text-white border-yellow-600"
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
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
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
