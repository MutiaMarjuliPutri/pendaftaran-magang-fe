import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Trash2, Download, User, CheckCircle, XCircle, Clock, Award, FileText, Upload, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8001";

const schema = z.object({
  title: z.string().min(1, "Judul laporan wajib diisi"),
  report_type_id: z.string().min(1, "Jenis laporan wajib dipilih"),
  content: z.string().optional(),
  file_path: z.string().min(1, "File laporan wajib diunggah"),
});

export default function Reports() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isStudent = user?.role?.toLowerCase() === 'student' || user?.role?.toLowerCase() === 'intern';
  
  const { data, isLoading, pagination, setParams, createMutation, deleteMutation } = useCrud("/master/reports", "reports");
  const { data: reportTypes } = useQuery({ queryKey: ["report-types-all"], queryFn: async () => (await api.get("/master/report-types/all")).data.data });

  // Auto-filter for students
  useState(() => {
    if (isStudent && user?.registration?.intern_id) {
      setParams(prev => ({ ...prev, intern_id: user.registration.intern_id }));
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/master/reports/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
      toast.success("Status laporan berhasil diperbarui");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui status");
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema.omit({ report_type_id: true })),
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({ 
      title: "", 
      content: "", 
      file_path: "",
      intern_id: user?.registration?.intern_id 
    });
    setIsModalOpen(true);
  };

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      intern_id: isStudent ? user?.registration?.intern_id : formData.intern_id,
      // Gunakan ID jenis laporan pertama yang tersedia
      report_type_id: reportTypes && reportTypes.length > 0 ? reportTypes[0].id : null
    };
    createMutation.mutate(payload, { 
      onSuccess: () => { 
        setIsModalOpen(false); 
        reset(); 
      } 
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Hanya file PDF yang diperbolehkan");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setValue("file_path", response.data.path);
      toast.success("File berhasil diunggah");
    } catch (err) {
      toast.error("Gagal mengunggah file");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      header: "Laporan",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm">{row.title}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Laporan Akhir Magang</span>
        </div>
      ),
    },
    {
      header: "Peserta",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px]">
             {row.intern?.name?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{row.intern?.name || "N/A"}</span>
            <span className="text-[10px] text-muted-foreground">{new Date(row.createdAt).toLocaleDateString("id-ID")}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <div className="flex items-center">
          {(!isStudent) ? (
            <select
              value={row.status || "submitted"}
              onChange={(e) => updateStatusMutation.mutate({ id: row.id, status: e.target.value })}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-full border outline-none cursor-pointer",
                row.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                row.status === 'revision' ? "bg-amber-50 text-amber-600 border-amber-200" :
                "bg-blue-50 text-blue-600 border-blue-200"
              )}
            >
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="revision">Revision</option>
              <option value="approved">Approved</option>
            </select>
          ) : (
            <span className={cn(
              "text-[10px] font-bold px-3 py-1 rounded-full border",
              row.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
              row.status === 'revision' ? "bg-amber-50 text-amber-600 border-amber-200" :
              "bg-blue-50 text-blue-600 border-blue-200"
            )}>
              {row.status?.toUpperCase() || "SUBMITTED"}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Sertifikat",
      cell: (row) => (
        row.status === 'approved' ? (
          <button 
            onClick={() => window.open(`/certificate/${row.id}`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
          >
            <Award size={14} /> AMBIL SERTIFIKAT
          </button>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">Tersedia setelah Laporan Akhir disetujui</span>
        )
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          {row.file_path && (
            <a 
              href={`${BASE_URL}${row.file_path}`} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              title="Unduh Laporan"
            >
              <Download size={16} />
            </a>
          )}
          <button
            onClick={() => {
              setSelectedItem(row);
              setIsDeleteOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            disabled={row.status === 'approved' && isStudent}
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
        title="Pusat Laporan & Sertifikat"
        description="Unggah laporan akhir Anda dan klaim sertifikat magang di sini."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={isStudent ? onAdd : null}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Unggah Laporan Baru"
        onSubmit={handleSubmit(onSubmit)}
        isLoading={createMutation.isLoading}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Judul Laporan</label>
            <input
              {...register("title")}
              className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Contoh: Laporan Akhir Magang - Putri"
            />
            {errors.title && <p className="text-[10px] text-destructive font-bold">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">File Laporan (PDF)</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                {uploading ? <Clock className="animate-spin" size={18} /> : <Upload size={18} />}
                {uploading ? "Mengupload..." : "Pilih File PDF"}
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
              {watch("file_path") && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                   <CheckCircle size={16} /> File Siap!
                </div>
              )}
            </div>
            <input type="hidden" {...register("file_path")} />
            {errors.file_path && <p className="text-[10px] text-destructive font-bold">{errors.file_path.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Catatan Tambahan (Opsional)</label>
            <textarea {...register("content")} className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Tuliskan catatan singkat jika ada..." />
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
