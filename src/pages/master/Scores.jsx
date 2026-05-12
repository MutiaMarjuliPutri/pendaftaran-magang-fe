import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, Award, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const schema = z.object({
  registration_id: z.string().min(1, "Peserta wajib dipilih"),
  criteria_id: z.string().min(1, "Kriteria wajib dipilih"),
  score: z.coerce.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
  notes: z.string().optional(),
});

export default function Scores() {
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/scores", "scores");

  const { data: registrations } = useQuery({ queryKey: ["registrations-all"], queryFn: async () => (await api.get("/master/registrations/all")).data.data });
  const { data: criteria } = useQuery({ queryKey: ["criteria-all"], queryFn: async () => (await api.get("/master/assessment-criteria/all")).data.data });

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
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({ registration_id: "", criteria_id: "", score: 0, notes: "" });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({
      registration_id: item.registration_id,
      criteria_id: item.criteria_id || item.criterion_id,
      score: item.score,
      notes: item.notes || "",
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
      header: "Peserta",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User size={14} className="text-muted-foreground" />
          </div>
          <span className="font-semibold">{row.registration?.intern?.name || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Kriteria",
      cell: (row) => <span className="px-2 py-1 bg-muted rounded-lg text-xs font-medium">{row.criterion?.criteria_name || "-"}</span>,
    },
    {
      header: "Nilai",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Award size={14} className={row.score >= 75 ? "text-emerald-500" : "text-amber-500"} />
          <span className="font-bold text-lg">{row.score}</span>
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) =>
        row.id && (
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
        title="Penilaian Magang"
        description="Kelola nilai evaluasi peserta magang berdasarkan kriteria yang ada."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Nilai" : "Tambah Nilai"} onSubmit={handleSubmit(onSubmit)} isLoading={createMutation.isLoading || updateMutation.isLoading}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Peserta Magang</label>
            <select {...register("registration_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
              <option value="">Pilih Peserta</option>
              {registrations?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.intern?.name}
                </option>
              ))}
            </select>
            {errors.registration_id && <p className="text-xs text-destructive">{errors.registration_id.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Kriteria Penilaian</label>
            <select {...register("criteria_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
              <option value="">Pilih Kriteria</option>
              {criteria?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.criteria_name}
                </option>
              ))}
            </select>
            {errors.criteria_id && <p className="text-xs text-destructive">{errors.criteria_id.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nilai (0 - 100)</label>
            <input type="number" {...register("score")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
            {errors.score && <p className="text-xs text-destructive">{errors.score.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan (Opsional)</label>
            <textarea {...register("notes")} className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
