import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/api/axios";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, UserCog, KeySquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  fullname: z.string().min(1, "Nama lengkap wajib diisi"),
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  role_id: z.string().min(1, "Role wajib dipilih"),
  status: z.enum(["active", "inactive"]).default("active"),
});

const resetSchema = z.object({
  new_password: z.string().min(6, "Password baru minimal 6 karakter"),
  confirm_password: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirm_password"],
});

export default function Users() {
  const queryClient = useQueryClient();
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/users", "users");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: roles = [] } = useQuery({
    queryKey: ["roles-all"],
    queryFn: async () => {
      const res = await api.get("/master/roles/all");
      return res.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/master/users/${id}/set-status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.success("Status berhasil diperbarui");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui status");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, new_password, confirm_password }) => api.post(`/master/users/reset-password/${id}`, { new_password, confirm_password }),
    onSuccess: () => {
      toast.success("Password berhasil direset");
      setIsResetOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal mereset password");
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const { register: registerReset, handleSubmit: handleResetSubmit, reset: resetResetForm, formState: { errors: resetErrors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onAdd = () => {
    setSelectedItem(null);
    reset({ fullname: "", username: "", password: "", role_id: "", status: "active" });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({ fullname: item.fullname, username: item.username, password: "", role_id: item.role_id, status: item.status });
    setIsModalOpen(true);
  };

  const onResetPassword = (item) => {
    setSelectedItem(item);
    resetResetForm({ new_password: "", confirm_password: "" });
    setIsResetOpen(true);
  };

  const onSubmit = (formData) => {
    const submitData = { ...formData };
    
    if (selectedItem && !submitData.password) {
      delete submitData.password;
    }
    
    if (!selectedItem && !submitData.password) {
      toast.error("Password wajib diisi untuk user baru");
      return;
    }

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, updatedData: submitData }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createMutation.mutate(submitData, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const onSubmitReset = (formData) => {
    resetPasswordMutation.mutate({ 
      id: selectedItem.id, 
      new_password: formData.new_password,
      confirm_password: formData.confirm_password
    });
  };

  const handleStatusToggle = (row) => {
    const newStatus = row.status === "active" ? "inactive" : "active";
    statusMutation.mutate({ id: row.id, status: newStatus });
  };

  const columns = [
    {
      header: "User",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <UserCog size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm">{row.fullname}</p>
            <p className="text-xs text-muted-foreground">@{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (row) => (
        <span className="capitalize font-medium text-sm">{row.role}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className="flex items-center gap-2 outline-none group"
          disabled={updateMutation.isLoading || statusMutation.isLoading}
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
          <button onClick={() => onResetPassword(row)} title="Reset Password" className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-600 transition-colors">
            <KeySquare size={16} />
          </button>
          <button onClick={() => onEdit(row)} title="Edit User" className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedItem(row);
              setIsDeleteOpen(true);
            }}
            title="Hapus User"
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
        title="Manajemen User"
        description="Kelola daftar user dan reset password."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit User" : "Tambah User"} onSubmit={handleSubmit(onSubmit)} isLoading={createMutation.isLoading || updateMutation.isLoading}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Lengkap</label>
            <input
              {...register("fullname")}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              placeholder="Contoh: John Doe"
            />
            {errors.fullname && <p className="text-xs text-destructive">{errors.fullname.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <input
              {...register("username")}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              placeholder="Contoh: johndoe"
            />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password {selectedItem && "(Kosongkan jika tidak diubah)"}</label>
            <input
              type="password"
              {...register("password")}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              placeholder={selectedItem ? "Biarkan kosong jika tidak diubah" : "Masukkan password baru"}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select {...register("role_id")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                <option value="">Pilih Role...</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.role_id && <p className="text-xs text-destructive">{errors.role_id.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select {...register("status")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>
      </FormModal>

      <FormModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Reset Password" onSubmit={handleResetSubmit(onSubmitReset)} isLoading={resetPasswordMutation.isLoading}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Anda akan mereset password untuk user: <strong>{selectedItem?.fullname}</strong></p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Baru</label>
            <input
              type="password"
              {...registerReset("new_password")}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              placeholder="Minimal 6 karakter"
            />
            {resetErrors.new_password && <p className="text-xs text-destructive">{resetErrors.new_password.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Konfirmasi Password</label>
            <input
              type="password"
              {...registerReset("confirm_password")}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              placeholder="Ketik ulang password baru"
            />
            {resetErrors.confirm_password && <p className="text-xs text-destructive">{resetErrors.confirm_password.message}</p>}
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
