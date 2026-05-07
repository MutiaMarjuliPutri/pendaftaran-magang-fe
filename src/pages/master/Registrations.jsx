import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, FileText, ExternalLink, User, Upload, X } from "lucide-react";
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
});

export default function Registrations() {
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/registrations", "registrations");

  const { data: programs } = useQuery({ queryKey: ["programs-all"], queryFn: async () => (await api.get("/master/internship-programs/all")).data.data });
  const { data: statuses } = useQuery({ queryKey: ["statuses-all"], queryFn: async () => (await api.get("/master/registration-statuses/all")).data.data });
  const { data: placements } = useQuery({ queryKey: ["placements-all"], queryFn: async () => (await api.get("/master/placements/all")).data.data });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
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
    },
  });

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
    });
    setCvFileUrl("");
    setCvFileName("");
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({
      internship_program_id: item.internship_program_id,
      status_id: item.status_id,
      position_id: item.position_id || "",
      duration: item.duration,
      notes: item.notes || "",
    });
    setCvFileUrl(item.cv_file || "");
    setCvFileName(item.cv_file ? item.cv_file.split("/").pop() : "");
    setIsModalOpen(true);
  };

  const onSubmit = (formData) => {
    const submitData = {
      ...formData,
      cv_file: cvFileUrl,
    };

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, updatedData: submitData }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createMutation.mutate(submitData, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleQuickStatusUpdate = (id, statusId) => {
    updateMutation.mutate({ id, updatedData: { status_id: statusId } });
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
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border ${colorClass}`}>
            {row.status?.name?.replace("_", " ") || "Pending"}
          </span>
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
            onChange={(e) => handleQuickStatusUpdate(row.id, e.target.value)}
            className="h-8 bg-muted border-none text-[10px] font-bold uppercase rounded-lg px-2 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all hover:bg-muted/80"
          >
            {statuses?.map((s) => (
              <option key={s.id} value={s.id} className="text-black bg-white">
                {s.name.replace("_", " ")}
              </option>
            ))}
          </select>
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
      />

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
    </>
  );
}