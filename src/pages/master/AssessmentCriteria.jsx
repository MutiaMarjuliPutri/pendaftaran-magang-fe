import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  criteria_code: z.string().min(1, "Kode kriteria wajib diisi"),
  criteria_name: z.string().min(1, "Nama kriteria wajib diisi"),
  description: z.string().optional(),
  min_score: z.coerce.number().default(0),
  max_score: z.coerce.number().default(100),
  is_active: z.boolean().default(true),
});

export default function AssessmentCriteria() {
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/assessment-criteria", "assessment-criteria");

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
      min_score: 0,
      max_score: 100,
      is_active: true,
    },
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({ criteria_code: "", criteria_name: "", description: "", min_score: 0, max_score: 100, is_active: true });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({
      criteria_code: item.criteria_code,
      criteria_name: item.criteria_name,
      description: item.description || "",
      min_score: item.min_score,
      max_score: item.max_score,
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
    {
      header: "Kriteria",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
            <Star size={16} />
          </div>
          <div>
            <p className="font-bold">{row.criteria_name}</p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">{row.criteria_code}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Rentang Nilai",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium">{row.min_score}</span>
          <span className="text-muted-foreground">-</span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold">{row.max_score}</span>
        </div>
      ),
    },
    { header: "Deskripsi", accessorKey: "description", className: "text-muted-foreground italic text-xs max-w-[200px] truncate" },
    {
      header: "Status",
      cell: (row) => <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${row.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>{row.is_active ? "Aktif" : "Non-Aktif"}</span>,
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
        title="Kriteria Penilaian"
        description="Atur indikator dan rentang nilai untuk evaluasi magang."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Kriteria" : "Tambah Kriteria"} onSubmit={handleSubmit(onSubmit)} isLoading={createMutation.isLoading || updateMutation.isLoading}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kode Kriteria</label>
              <input
                {...register("criteria_code")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder="E.g. DISCIPLINE"
              />
              {errors.criteria_code && <p className="text-xs text-destructive">{errors.criteria_code.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kriteria</label>
              <input
                {...register("criteria_name")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder="Contoh: Kedisiplinan"
              />
              {errors.criteria_name && <p className="text-xs text-destructive">{errors.criteria_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nilai Minimum</label>
              <input
                type="number"
                {...register("min_score")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nilai Maksimum</label>
              <input
                type="number"
                {...register("max_score")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select {...register("is_active", { setValueAs: (v) => v === "true" })} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
              <option value="true">Aktif</option>
              <option value="false">Non-Aktif</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi (Opsional)</label>
            <textarea {...register("description")} className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
