import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/api/axios";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  period_code: z.string().min(1, "Kode periode wajib diisi"),
  period_name: z.string().min(1, "Nama periode wajib diisi"),
  batch: z.coerce.number().min(1, "Batch minimal 1").max(50).optional(),
  year: z.coerce.number().min(2000, "Tahun tidak valid"),
  semester: z.enum(["ganjil", "genap"]),
  registration_start: z.string().min(1, "Tanggal mulai pendaftaran wajib diisi"),
  registration_end: z.string().min(1, "Tanggal selesai pendaftaran wajib diisi"),
  program_start: z.string().min(1, "Tanggal mulai program wajib diisi"),
  program_end: z.string().min(1, "Tanggal selesai program wajib diisi"),
  quota_total: z.coerce.number().min(0, "Kuota tidak boleh negatif"),
  is_active: z.boolean().default(true),
  registration_status: z.enum(["open", "closed", "announced"]).default("open"),
});

export default function InternshipPeriods() {
  const queryClient = useQueryClient();
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/internship-periods", "internship-periods");

  const statusMutation = useMutation({
    mutationFn: ({ id, is_active }) => api.patch(`/master/internship-periods/${id}/active-status`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(["internship-periods"]);
      queryClient.invalidateQueries(["internship-programs"]);
      toast.success("Status periode berhasil diperbarui");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui status");
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      is_active: true,
      semester: "ganjil",
      registration_status: "open",
    },
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({
      period_code: "",
      period_name: "",
      batch: 1,
      year: new Date().getFullYear(),
      semester: "ganjil",
      registration_start: "",
      registration_end: "",
      program_start: "",
      program_end: "",
      quota_total: 0,
      is_active: true,
      registration_status: "open",
    });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({
      period_code: item.period_code,
      period_name: item.period_name,
      batch: item.batch || 1,
      year: item.year,
      semester: item.semester,
      registration_start: item.registration_start?.split("T")[0],
      registration_end: item.registration_end?.split("T")[0],
      program_start: item.program_start?.split("T")[0],
      program_end: item.program_end?.split("T")[0],
      quota_total: item.quota_total,
      is_active: item.is_active,
      registration_status: item.registration_status || "open",
    });
    setIsModalOpen(true);
  };

  const onSubmit = (formData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, updatedData: formData }, { 
        onSuccess: () => {
          setIsModalOpen(false);
          queryClient.invalidateQueries(["internship-programs"]);
        }
      });
    } else {
      createMutation.mutate(formData, { 
        onSuccess: () => {
          setIsModalOpen(false);
          queryClient.invalidateQueries(["internship-programs"]);
        }
      });
    }
  };

  const columns = [
    { header: "Kode", accessorKey: "period_code", className: "font-mono text-xs" },
    { header: "Nama Periode", accessorKey: "period_name", className: "font-semibold" },
    {
      header: "Batch",
      accessorKey: "batch",
      className: "text-center",
      cell: (row) => <span className="font-bold">Batch {row.batch || "-"}</span>
    },
    {
      header: "Rentang Program",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.program_start).toLocaleDateString("id-ID")} - {new Date(row.program_end).toLocaleDateString("id-ID")}
        </span>
      ),
    },
    {
      header: "Kapasitas Terisi",
      cell: (row) => {
        const total_accepted = row.total_accepted || 0;
        const total_quota = row.quota_total || 0;
        const remaining = total_quota - total_accepted;
        const percent = total_quota > 0 ? Math.round((total_accepted / total_quota) * 100) : 0;
        
        return (
          <div className="space-y-1.5 min-w-[140px]">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-muted-foreground">Terisi: {total_accepted}/{total_quota}</span>
              <span className={remaining <= 0 && total_quota > 0 ? "text-rose-500" : "text-emerald-500"}>
                Sisa: {remaining}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  percent >= 100 ? "bg-rose-500" : percent >= 80 ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(percent, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Status Periode",
      cell: (row) => {
        const isActive = !!row.is_active;
        return (
          <button
            onClick={() => {
              statusMutation.mutate({ id: row.id, is_active: !isActive });
            }}
            disabled={statusMutation.isLoading}
            className="flex items-center gap-2 outline-none group"
            title={isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
          >
            <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
              isActive ? "bg-[#3D2925]" : "bg-gray-200 border border-gray-300"
            }`}>
              <div className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-300 ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`} />
            </div>
            <span className="text-sm font-medium">
              {isActive ? "Aktif" : "Tidak Aktif"}
            </span>
          </button>
        );
      },
    },
    {
      header: "Status Pendaftaran",
      cell: (row) => {
        const regStatusMap = {
          open: { label: "🟢 Buka", cls: "bg-green-100 text-green-700" },
          closed: { label: "🔴 Tutup", cls: "bg-gray-100 text-gray-600" },
          announced: { label: "🎉 Pengumuman", cls: "bg-amber-100 text-amber-700" },
        };
        const s = regStatusMap[row.registration_status] || regStatusMap.open;
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>;
      },
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
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
        title="Periode Magang"
        description="Kelola jadwal periode magang yang tersedia."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Edit Periode" : "Tambah Periode"}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        maxWidth="max-w-3xl"
      >
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kode Periode</label>
                <input
                  {...register("period_code")}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                  placeholder="PER-2024-1"
                />
                {errors.period_code && <p className="text-xs text-destructive">{errors.period_code.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tahun</label>
                <input type="number" {...register("year")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
                {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Periode</label>
                <input
                  {...register("period_name")}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                  placeholder="Contoh: Magang Batch 1 2024"
                />
                {errors.period_name && <p className="text-xs text-destructive">{errors.period_name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <select {...register("batch")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((b) => (
                    <option key={b} value={b}>Batch {b}</option>
                  ))}
                </select>
                {errors.batch && <p className="text-xs text-destructive">{errors.batch.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <select {...register("semester")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                  <option value="ganjil">Ganjil</option>
                  <option value="genap">Genap</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Kuota</label>
                <input
                  type="number"
                  {...register("quota_total")}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                />
                {errors.quota_total && <p className="text-xs text-destructive">{errors.quota_total.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" {...register("is_active")} id="is_active" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="is_active" className="text-sm font-medium">
                Periode Aktif
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Radio size={14} className="text-primary" />
                Status Pendaftaran (Landing Page)
              </label>
              <select
                {...register("registration_status")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              >
                <option value="open">🟢 Buka Pendaftaran</option>
                <option value="closed">🔴 Tutup Pendaftaran</option>
                <option value="announced">🎉 Tampilkan Pengumuman Peserta Diterima</option>
              </select>
              <p className="text-[11px] text-muted-foreground">Status ini akan tampil di halaman utama (landing page) untuk umum.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jadwal Pendaftaran</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Mulai</label>
                  <input type="date" {...register("registration_start")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Selesai</label>
                  <input type="date" {...register("registration_end")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                </div>
              </div>
              {(errors.registration_start || errors.registration_end) && <p className="text-xs text-destructive">Jadwal pendaftaran wajib diisi</p>}
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary/70">Jadwal Program Magang</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-primary/80">Mulai</label>
                  <input type="date" {...register("program_start")} className="flex h-10 w-full rounded-lg border border-primary/20 bg-background px-3 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-primary/80">Selesai</label>
                  <input type="date" {...register("program_end")} className="flex h-10 w-full rounded-lg border border-primary/20 bg-background px-3 text-sm" />
                </div>
              </div>
              {(errors.program_start || errors.program_end) && <p className="text-xs text-destructive">Jadwal program wajib diisi</p>}
            </div>
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
