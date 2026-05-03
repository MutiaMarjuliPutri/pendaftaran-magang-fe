import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, FileText, ExternalLink, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const schema = z.object({
  internship_program_id: z.string().min(1, "Program magang wajib dipilih"),
  status_id: z.string().min(1, "Status wajib dipilih"),
  cv_file: z.string().optional(),
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
    reset({ internship_program_id: "", status_id: "", position_id: "", duration: 3, notes: "" });
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
      cell: (row) => <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm bg-primary/10 text-primary">{row.status?.name || "Pending"}</span>,
    },
    {
      header: "Dokumen",
      cell: (row) => (
        <div className="flex gap-2">
          {row.cv_file && (
            <a href={row.cv_file} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all" title="Lihat CV">
              <FileText size={14} />
            </a>
          )}
          <button className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all" title="Detail Pendaftaran">
            <ExternalLink size={14} />
          </button>
        </div>
      ),
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
        title="Daftar Pendaftaran"
        description="Pantau dan kelola seluruh aplikasi magang yang masuk."
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
        title={selectedItem ? "Edit Pendaftaran" : "Tambah Pendaftaran"}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Program Magang</label>
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
              <label className="text-sm font-medium">Status Pendaftaran</label>
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
              <label className="text-sm font-medium">Catatan Tambahan</label>
              <textarea
                {...register("notes")}
                className="flex min-h-[110px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
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
