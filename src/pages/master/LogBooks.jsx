import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Calendar, Trash2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const schema = z.object({
  registration_id: z.string().min(1, "Peserta wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  activity: z.string().min(1, "Aktivitas wajib diisi"),
  notes: z.string().optional(),
});

export default function LogBooks() {
  const { data, isLoading, pagination, setParams, createMutation, deleteMutation } = useCrud("/master/log-books", "log-books");

  const { data: registrations } = useQuery({ queryKey: ["registrations-all"], queryFn: async () => (await api.get("/master/registrations/all")).data.data });

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
    reset({ registration_id: "", date: new Date().toISOString().split("T")[0], activity: "", notes: "" });
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: "Peserta",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User size={14} className="text-muted-foreground" />
          </div>
          <span className="font-semibold">{row.registration?.intern?.full_name || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Tanggal",
      cell: (row) => (
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Calendar size={14} className="text-primary" />
          {new Date(row.date).toLocaleDateString("id-ID", { dateStyle: "long" })}
        </div>
      ),
    },
    {
      header: "Aktivitas",
      cell: (row) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{row.activity}</p>
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
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
        title="Log Book"
        description="Pantau catatan aktivitas harian peserta magang."
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
        title="Tambah Log Aktivitas"
        onSubmit={handleSubmit((data) => createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) }))}
        isLoading={createMutation.isLoading}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Peserta Magang</label>
            <select {...register("registration_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
              <option value="">Pilih Peserta</option>
              {registrations?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.intern?.full_name}
                </option>
              ))}
            </select>
            {errors.registration_id && <p className="text-xs text-destructive">{errors.registration_id.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal</label>
            <input type="date" {...register("date")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Aktivitas</label>
            <textarea
              {...register("activity")}
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              placeholder="Apa yang dikerjakan hari ini?"
            />
            {errors.activity && <p className="text-xs text-destructive">{errors.activity.message}</p>}
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
