import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/api/axios";
import { Edit2, Trash2, Mail, Phone, GraduationCap, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const isSchoolInstitution = (value = "") => {
  const text = value.toLowerCase();
  return ["smk", "sma", "ma ", "man ", "mts", "smp", "sekolah"].some((keyword) => text.includes(keyword));
};

const schema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  university: z.string().min(1, "Institusi wajib diisi"),
  major: z.string().min(1, "Jurusan wajib diisi"),
  semester: z.coerce.number().min(1).max(14).optional(),
  status: z.enum(["active", "inactive", "graduated", "dropped"]).default("active"),
  batch: z.coerce.number().min(1).max(9).optional(),
});

export default function Interns() {
  const queryClient = useQueryClient();
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/interns", "interns");

  const toggleBestMutation = useMutation({
    mutationFn: (id) => api.patch(`/master/interns/${id}/toggle-best`),
    onSuccess: () => {
      queryClient.invalidateQueries(["interns"]);
      toast.success("Berhasil memperbarui status intern terbaik");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui status intern terbaik");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/master/interns/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["interns"]);
      toast.success("Status peserta berhasil diperbarui");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui status");
    },
  });

  const [activeStatus, setActiveStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "active",
    },
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({ name: "", email: "", phone: "", university: "", major: "", semester: 1, status: "active", batch: 1 });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({
      name: item.name,
      email: item.email,
      phone: item.phone,
      university: item.university,
      major: item.major,
      semester: item.semester,
      status: item.status,
      batch: item.batch,
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

  const handleStatusFilter = (status) => {
    setActiveStatus(status);
    setParams((prev) => ({ ...prev, status, page: 1 }));
  };

  const watchedInstitution = watch("university");
  const semesterLabel = isSchoolInstitution(watchedInstitution) ? "Kelas" : "Semester";

  const columns = [
    {
      header: "Nama Lengkap",
      cell: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold">{row.name}</span>
            {row.is_best_intern && (
              <Star size={14} className="fill-amber-400 text-amber-400" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{row.status}</span>
        </div>
      ),
      className: "font-semibold",
    },
    {
      header: "Batch",
      cell: (row) => (
        <div className="flex items-center justify-center">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
            Batch {row.batch || "-"}
          </span>
        </div>
      ),
      className: "text-center",
    },
    {
      header: "Kontak",
      cell: (row) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail size={12} /> {row.email}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone size={12} /> {row.phone}
          </div>
        </div>
      ),
    },
    {
      header: "Institusi",
      cell: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-medium">
            <GraduationCap size={14} className="text-primary" /> {row.university}
          </div>
          <span className="text-xs text-muted-foreground">
            {row.major} ({isSchoolInstitution(row.university) ? "Kelas" : "Smt"} {row.semester || "-"})
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => {
        const isActive = row.status === "active";
        return (
          <button
            onClick={() => {
              if (row.status !== "active" && row.status !== "inactive") return;
              const newStatus = isActive ? "inactive" : "active";
              statusMutation.mutate({ id: row.id, status: newStatus });
            }}
            disabled={statusMutation.isLoading || (row.status !== "active" && row.status !== "inactive")}
            className="flex items-center gap-2 outline-none group disabled:opacity-60"
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
              {isActive ? "Aktif" : row.status === "inactive" ? "Tidak Aktif" : row.status === "graduated" ? "Lulus" : "Dikeluarkan"}
            </span>
          </button>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => toggleBestMutation.mutate(row.id)} 
            className={cn(
              "p-2 rounded-lg transition-colors",
              row.is_best_intern ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:bg-gray-50"
            )}
            title="Tandai sebagai Intern Terbaik"
          >
            <Star size={16} className={row.is_best_intern ? "fill-current" : ""} />
          </button>
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
        title="Peserta Magang"
        description="Kelola data profil seluruh peserta magang."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        groupByKey="batch"
      >
        <div className="flex items-center gap-2 mb-4 mt-2">
          <select 
            onChange={(e) => setParams(prev => ({ ...prev, batch: e.target.value, page: 1 }))}
            className="text-xs border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 h-10 bg-card"
          >
            <option value="">Semua Batch</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(b => (
              <option key={b} value={b}>Batch {b}</option>
            ))}
          </select>
        </div>
      </DataTable>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Edit Peserta" : "Tambah Peserta"}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <input {...register("name")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input type="email" {...register("email")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Telepon</label>
              <input {...register("phone")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Institusi / Sekolah / Universitas</label>
              <input {...register("university")} placeholder="Contoh: SMK Negeri 1 / Universitas Indonesia" className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
              {errors.university && <p className="text-xs text-destructive">{errors.university.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Jurusan</label>
                <input {...register("major")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
                {errors.major && <p className="text-xs text-destructive">{errors.major.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{semesterLabel}</label>
                <input
                  type="number"
                  {...register("semester")}
                  placeholder={semesterLabel === "Kelas" ? "10 / 11 / 12" : "1 - 14"}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                />
                <p className="text-[10px] text-muted-foreground">
                  Isi kelas untuk siswa, atau semester untuk mahasiswa.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select {...register("status")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="graduated">Lulus</option>
                  <option value="dropped">Dikeluarkan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <select {...register("batch")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
                    <option key={b} value={b}>Batch {b}</option>
                  ))}
                </select>
                {errors.batch && <p className="text-xs text-destructive">{errors.batch.message}</p>}
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
