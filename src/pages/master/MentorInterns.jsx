import { useMemo, useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { Edit2, Trash2, UserCheck, Calendar, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { format } from "date-fns";

const schema = z.object({
  intern_id: z.string().min(1, "Peserta magang wajib dipilih"),
  field: z.string().min(1, "Bidang mentor wajib dipilih"),
  user_id: z.string().min(1, "Mentor wajib dipilih"),
  assigned_date: z.string().min(1, "Tanggal mulai bimbingan wajib diisi"),
  notes: z.string().optional(),
});

const fieldOptions = [
  { value: "backend", label: "Backend (BE)" },
  { value: "frontend", label: "Frontend (FE)" },
  { value: "uiux", label: "UI/UX" },
  { value: "qa", label: "Quality Assurance" },
  { value: "mobile", label: "Mobile" },
  { value: "other", label: "Lainnya" },
];

const fieldLabelMap = fieldOptions.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

export default function MentorInterns() {
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation } = useCrud("/master/mentor-interns", "mentor-interns");

  const { data: interns } = useQuery({ queryKey: ["interns-all"], queryFn: async () => (await api.get("/master/interns/all")).data.data });
  const { data: mentors } = useQuery({
    queryKey: ["mentors-all"],
    queryFn: async () => {
      const resp = await api.get("/master/users/all", { params: { role_code: "mentor" } });
      console.log('Fetched mentors:', resp.data.data);
      return resp.data.data;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedInternId = watch("intern_id");
  const selectedMentorId = watch("user_id");
  const selectedIntern = useMemo(() => interns?.find((intern) => intern.id === selectedInternId), [interns, selectedInternId]);

  const internOptions = useMemo(() => {
    if (!interns) return [];
    return interns.map(i => ({
      value: i.id,
      label: i.name,
      subLabel: i.registration?.program?.program_name || i.major || i.university || "-"
    }));
  }, [interns]);

  const mentorOptions = useMemo(() => {
    if (!mentors) return [];
    return mentors.map(m => ({
      value: m.id,
      label: m.full_name || m.fullname,
      subLabel: m.email || "-"
    }));
  }, [mentors]);

  const onAdd = () => {
    setSelectedItem(null);
    reset({ intern_id: "", field: "", user_id: "", assigned_date: format(new Date(), "yyyy-MM-dd"), notes: "" });
    setIsModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    reset({
      intern_id: item.intern_id,
      field: item.field || "",
      user_id: item.user_id,
      assigned_date: item.assigned_date ? format(new Date(item.assigned_date), "yyyy-MM-dd") : "",
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
      header: "Peserta Magang",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
            <UserCheck size={16} />
          </div>
          <div>
            <p className="font-bold">{row.intern?.name || "N/A"}</p>
            <p className="text-xs text-muted-foreground">{row.intern?.registration?.program?.program_name || row.intern?.major || row.intern?.university || "-"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Bidang",
      cell: (row) => (
        <span className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          {fieldLabelMap[row.field] || row.field || "-"}
        </span>
      ),
    },
    {
      header: "Mentor Penanggung Jawab",
      cell: (row) => (
        <div>
          <p className="font-semibold">{row.mentor?.full_name || row.mentor?.fullname || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{row.mentor?.role || "Mentor"}</p>
        </div>
      ),
    },
    {
      header: "Mulai Bimbingan",
      cell: (row) => (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar size={12} />
          {row.assigned_date ? format(new Date(row.assigned_date), "dd MMM yyyy") : "-"}
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
        title="Penugasan Mentor"
        description="Hubungkan peserta magang dengan pembimbing lapangan yang sesuai."
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={onAdd}
        onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        pagination={pagination}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Mentor" : "Atur Mentor"} onSubmit={handleSubmit(onSubmit)} isLoading={createMutation.isLoading || updateMutation.isLoading}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Peserta Magang</label>
            <SearchableSelect
              options={internOptions}
              value={selectedInternId}
              onChange={(val) => setValue("intern_id", val, { shouldValidate: true })}
              placeholder="Pilih atau cari peserta..."
              error={errors.intern_id}
            />
            {errors.intern_id && <p className="text-xs text-destructive">{errors.intern_id.message}</p>}
            {selectedIntern?.registration?.position?.name && (
              <p className="text-xs text-muted-foreground mt-1">Penempatan: <span className="font-semibold">{selectedIntern.registration.position.name}</span></p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bidang Mentor</label>
            <select {...register("field")} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all">
              <option value="">Pilih Bidang</option>
              {fieldOptions.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
            {errors.field && <p className="text-xs text-destructive">{errors.field.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mentor</label>
            <SearchableSelect
              options={mentorOptions}
              value={selectedMentorId}
              onChange={(val) => setValue("user_id", val, { shouldValidate: true })}
              placeholder="Pilih atau cari mentor..."
              error={errors.user_id}
            />
            {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Mulai Bimbingan</label>
            <div className="relative">
              <input
                type="date"
                {...register("assigned_date")}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              />
              <Calendar className="absolute right-3 top-3 text-muted-foreground" size={18} />
            </div>
            {errors.assigned_date && <p className="text-xs text-destructive">{errors.assigned_date.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileText size={14} /> Catatan (Opsional)
            </label>
            <textarea
              {...register("notes")}
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
              placeholder="Catatan tugas atau instruksi khusus..."
            />
          </div>
        </div>
      </FormModal>

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />
    </>
  );
}
