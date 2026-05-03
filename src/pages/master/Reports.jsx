import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Trash2, Download, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const schema = z.object({
  registration_id: z.string().min(1, "Peserta wajib dipilih"),
  report_type_id: z.string().min(1, "Jenis laporan wajib dipilih"),
  file_path: z.string().optional(),
  notes: z.string().optional(),
});

export default function Reports() {
  const { data, isLoading, pagination, setParams, createMutation, deleteMutation } = useCrud("/master/reports", "reports");

  const { data: registrations } = useQuery({ queryKey: ["registrations-all"], queryFn: async () => (await api.get("/master/registrations/all")).data.data });
  const { data: reportTypes } = useQuery({ queryKey: ["report-types-all"], queryFn: async () => (await api.get("/master/report-types/all")).data.data });

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
    reset({ registration_id: "", report_type_id: "", notes: "" });
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
      header: "Jenis Laporan",
      cell: (row) => <span className="px-2 py-1 bg-muted rounded-lg text-xs font-medium">{row.report_type?.name || "-"}</span>,
    },
    {
      header: "Tanggal Upload",
      cell: (row) => <span className="text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>,
    },
    {
      header: "File",
      cell: (row) =>
        row.file_path ? (
          <a href={row.file_path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <Download size={14} /> Unduh
          </a>
        ) : (
          "-"
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
        title="Laporan Magang"
        description="Kelola seluruh dokumen laporan yang diunggah oleh peserta."
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
        title="Tambah Laporan"
        onSubmit={handleSubmit((data) => createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) }))}
        isLoading={createMutation.isLoading}
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
            <label className="text-sm font-medium">Jenis Laporan</label>
            <select {...register("report_type_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
              <option value="">Pilih Jenis Laporan</option>
              {reportTypes?.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
            {errors.report_type_id && <p className="text-xs text-destructive">{errors.report_type_id.message}</p>}
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
