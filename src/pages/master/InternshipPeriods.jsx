import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  period_code: z.string().min(1, "Kode periode wajib diisi"),
  period_name: z.string().min(1, "Nama periode wajib diisi"),
  year: z.coerce.number().min(2000, "Tahun tidak valid"),
  semester: z.enum(["ganjil", "genap"]),
  registration_start: z.string().min(1, "Tanggal mulai pendaftaran wajib diisi"),
  registration_end: z.string().min(1, "Tanggal selesai pendaftaran wajib diisi"),
  program_start: z.string().min(1, "Tanggal mulai program wajib diisi"),
  program_end: z.string().min(1, "Tanggal selesai program wajib diisi"),
  quota_total: z.coerce.number().min(1, "Kuota minimal 1"),
  is_active: z.boolean().default(true),
});

export default function InternshipPeriods() {
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/internship-periods", "internship-periods");

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
    },
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({
      period_code: "",
      period_name: "",
      year: new Date().getFullYear(),
      semester: "ganjil",
      registration_start: "",
      registration_end: "",
      program_start: "",
      program_end: "",
      quota_total: 0,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({
      period_code: item.period_code,
      period_name: item.period_name,
      year: item.year,
      semester: item.semester,
      registration_start: item.registration_start?.split("T")[0],
      registration_end: item.registration_end?.split("T")[0],
      program_start: item.program_start?.split("T")[0],
      program_end: item.program_end?.split("T")[0],
      quota_total: item.quota_total,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (formData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, updatedData: formData }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createMutation.mutate(formData, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const columns = [
    { header: "Kode", accessorKey: "period_code", className: "font-mono text-xs" },
    { header: "Nama Periode", accessorKey: "period_name", className: "font-semibold" },
    {
      header: "Rentang Program",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.program_start).toLocaleDateString("id-ID")} - {new Date(row.program_end).toLocaleDateString("id-ID")}
        </span>
      ),
    },
    {
      header: "Kuota",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold">{row.quota_remaining}</span>
          <span className="text-muted-foreground">/</span>
          <span>{row.quota_total}</span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${row.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>{row.is_active ? "Aktif" : "Tidak Aktif"}</span>,
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Periode</label>
              <input
                {...register("period_name")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder="Contoh: Magang Batch 1 2024"
              />
              {errors.period_name && <p className="text-xs text-destructive">{errors.period_name.message}</p>}
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
