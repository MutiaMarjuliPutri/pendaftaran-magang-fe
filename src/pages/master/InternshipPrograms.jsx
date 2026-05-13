import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, Users, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const schema = z.object({
  program_code: z.string().min(1, "Kode program wajib diisi"),
  program_name: z.string().min(1, "Nama program wajib diisi"),
  department_id: z.string().min(1, "Divisi wajib dipilih"),
  description: z.string().optional(),
  quota: z.coerce.number().min(0, "Kuota tidak boleh negatif"),
  requirements: z.string().optional(),
  skills_needed: z.string().optional(),
  registration_start: z.string().optional(),
  registration_end: z.string().optional(),
  program_start_date: z.string().optional(),
  program_end_date: z.string().optional(),
  status: z.enum(["draft", "open", "closed", "ongoing", "finished"]).default("draft"),
  batch: z.coerce.number().min(1, "Batch minimal 1").max(99).optional(),
});

export default function InternshipPrograms() {
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/internship-programs", "internship-programs");

  const { data: divisions } = useQuery({
    queryKey: ["divisions-all"],
    queryFn: async () => {
      const response = await api.get("/master/divisions/all");
      return response.data.data;
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
      status: "draft",
      quota: 0,
    },
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({
      program_code: "",
      program_name: "",
      department_id: "",
      description: "",
      quota: 0,
      requirements: "",
      skills_needed: "",
      status: "draft",
      batch: 1,
    });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({
      program_code: item.program_code,
      program_name: item.program_name,
      department_id: item.department_id,
      description: item.description || "",
      quota: item.quota,
      requirements: item.requirements || "",
      skills_needed: item.skills_needed || "",
      registration_start: item.registration_start?.split("T")[0],
      registration_end: item.registration_end?.split("T")[0],
      program_start_date: item.program_start_date?.split("T")[0],
      program_end_date: item.program_end_date?.split("T")[0],
      status: item.status,
      batch: item.batch || 1,
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
    { header: "Kode", accessorKey: "program_code", className: "font-mono text-xs" },
    { 
      header: "Nama Program & Divisi", 
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.program_name}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Divisi: {row.division?.name || "-"}</span>
        </div>
      )
    },
    {
      header: "Kuota & Pendaftar",
      cell: (row) => {
        const remaining = (row.quota || 0) - (row.total_accepted || 0);
        const percent = (row.quota || 0) > 0 ? Math.round(((row.total_accepted || 0) / row.quota) * 100) : 0;
        
        return (
          <div className="space-y-1.5 min-w-[140px]">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-muted-foreground">Terisi: {row.total_accepted || 0}/{row.quota || 0}</span>
              <span className={remaining <= 0 ? "text-rose-500 font-black" : "text-emerald-500 font-black"}>
                Sisa: {remaining}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  percent >= 100 ? "bg-rose-500" : percent >= 80 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${Math.min(percent, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users size={10} /> {row.total_registrations || 0} Calon
              </div>
              {percent >= 100 && (
                <span className="text-[9px] font-black text-rose-500 uppercase">Penuh</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: "Batch",
      accessorKey: "batch",
      className: "text-center",
      cell: (row) => <span className="font-bold">Batch {row.batch || "-"}</span>
    },
    {
      header: "Status",
      cell: (row) => {
        const statusColors = {
          draft: "bg-gray-500/10 text-gray-500",
          open: "bg-emerald-500/10 text-emerald-500",
          closed: "bg-destructive/10 text-destructive",
          ongoing: "bg-blue-500/10 text-blue-500",
          finished: "bg-purple-500/10 text-purple-500",
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[row.status]}`}>{row.status}</span>;
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
        title="Program Magang"
        description="Kelola jenis program magang yang ditawarkan."
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
        title={selectedItem ? "Edit Program" : "Tambah Program"}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kode Program</label>
                <input
                  {...register("program_code")}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                  placeholder="PROG-WEB-01"
                />
                {errors.program_code && <p className="text-xs text-destructive">{errors.program_code.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <input
                  type="number"
                  {...register("batch")}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                  placeholder="Contoh: 11"
                />
                {errors.batch && <p className="text-xs text-destructive">{errors.batch.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kuota</label>
                <input
                  type="number"
                  {...register("quota")}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Program</label>
              <input
                {...register("program_name")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder="Contoh: Fullstack Web Development"
              />
              <p className="text-[10px] text-muted-foreground">Nama spesifik kegiatan magang (Batch/Batch Batch).</p>
              {errors.program_name && <p className="text-xs text-destructive">{errors.program_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Divisi</label>
              <select {...register("department_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                <option value="">Pilih Divisi</option>
                {divisions?.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground">Departemen/Bagian yang menaungi program ini.</p>
              {errors.department_id && <p className="text-xs text-destructive">{errors.department_id.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select {...register("status")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="ongoing">Ongoing</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <textarea
                {...register("description")}
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                placeholder="Deskripsi program..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detail Kualifikasi</h4>
              <div className="space-y-2">
                <label className="text-xs font-medium">Persyaratan</label>
                <textarea {...register("requirements")} className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Contoh: Mahasiswa tingkat akhir, IPK min 3.0" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Keahlian yang Dibutuhkan</label>
                <textarea {...register("skills_needed")} className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Contoh: React, Node.js, SQL" />
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary/70">Jadwal (Opsional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Pendaftaran Mulai</label>
                  <input type="date" {...register("registration_start")} className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Pendaftaran Selesai</label>
                  <input type="date" {...register("registration_end")} className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Program Mulai</label>
                  <input type="date" {...register("program_start_date")} className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Program Selesai</label>
                  <input type="date" {...register("program_end_date")} className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
