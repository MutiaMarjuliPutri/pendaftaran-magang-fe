import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/api/axios";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(1, "Nama lokasi wajib diisi"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export default function Placements() {
  const queryClient = useQueryClient();
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/placements", "placements");

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/master/placements/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["placements"]);
      toast.success("Status berhasil diperbarui");
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

  const onSubmit = (formData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, updatedData: formData }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createMutation.mutate(formData, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleStatusToggle = (row) => {
    const newStatus = row.status === "active" ? "inactive" : "active";
    statusMutation.mutate({ id: row.id, status: newStatus });
  };

  const columns = [
    {
      header: "Nama Lokasi",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <MapPin size={16} />
          </div>
          <span className="font-semibold">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className="flex items-center gap-2 outline-none group"
          disabled={updateMutation.isLoading}
        >
          <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${row.status === "active" ? "bg-[#3D2925]" : "bg-gray-200 border border-gray-300"}`}>
            <div className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform duration-200 ${row.status === "active" ? "translate-x-5 shadow-sm" : "translate-x-0 shadow-sm"}`} />
          </div>
          <span className="text-sm font-medium">{row.status === "active" ? "Aktif" : "Tidak Aktif"}</span>
        </button>
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
        title="Lokasi Penempatan"
        description="Kelola daftar lokasi penempatan untuk peserta magang."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Lokasi" : "Tambah Lokasi"} onSubmit={handleSubmit(onSubmit)} isLoading={createMutation.isLoading || updateMutation.isLoading}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Lokasi</label>
            <input
              {...register("name")}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              placeholder="Contoh: Kantor Pusat Jakarta"
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
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
