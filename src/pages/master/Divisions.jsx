import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/api/axios";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const divisionSchema = z.object({
  name: z.string().min(1, "Nama divisi wajib diisi"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export default function Divisions() {
  const queryClient = useQueryClient();
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/divisions", "divisions");

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/master/divisions/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["divisions"]);
      toast.success("Status divisi berhasil diperbarui");
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
    resolver: zodResolver(divisionSchema),
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({ name: "", status: "active" });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({ name: item.name, status: item.status });
    setIsModalOpen(true);
  };

  const onDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const onSubmit = (formData) => {
    if (selectedItem) {
      updateMutation.mutate(
        { id: selectedItem.id, updatedData: formData },
        {
          onSuccess: () => setIsModalOpen(false),
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const columns = [
    { header: "Nama Divisi", accessorKey: "name", className: "font-semibold" },
    {
      header: "Status",
      cell: (row) => {
        const isActive = row.status === "active";
        return (
          <button
            onClick={() => {
              const newStatus = isActive ? "inactive" : "active";
              statusMutation.mutate({ id: row.id, status: newStatus });
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
      header: "Aksi",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => onEdit(row)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(row)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Daftar Divisi"
        description="Kelola data divisi perusahaan untuk penempatan magang."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Divisi" : "Tambah Divisi"} onSubmit={handleSubmit(onSubmit)} isLoading={createMutation.isLoading || updateMutation.isLoading}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Nama Divisi</label>
          <input
            {...register("name")}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
            placeholder="Masukkan nama divisi"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select {...register("status")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </FormModal>

      <DeleteConfirm
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(selectedItem.id, {
            onSuccess: () => setIsDeleteOpen(false),
          });
        }}
        isLoading={deleteMutation.isLoading}
      />
    </>
  );
}
