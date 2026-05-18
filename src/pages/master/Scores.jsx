import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import FormModal from "@/components/shared/FormModal";
import DeleteConfirm from "@/components/shared/DeleteConfirm";
import { Edit2, Trash2, Award, User, ClipboardList, Plus, Star } from "lucide-react";
import BulkAssessmentModal from "@/components/scores/BulkAssessmentModal";
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
  const navigate = useNavigate();
  const { data, isLoading, pagination, setParams, createMutation, updateMutation, deleteMutation, refetch } = useCrud("/master/scores", "scores", { per_page: 50 });

  const { data: registrations } = useQuery({ queryKey: ["registrations-all"], queryFn: async () => (await api.get("/master/registrations/all")).data.data });
  const { data: criteria } = useQuery({ queryKey: ["criteria-all"], queryFn: async () => (await api.get("/master/assessment-criteria/all")).data.data });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState("");
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
    setSelectedRegId("");
    setIsBulkModalOpen(true);
  };

  const onEdit = (item) => {
    setSelectedRegId(item.registration_id);
    setIsBulkModalOpen(true);
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
      header: "Nilai Akhir",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Award size={14} className={parseFloat(row.score) >= 75 ? "text-emerald-500" : "text-amber-500"} />
          <span className="font-bold text-lg">{parseFloat(row.score).toFixed(2)}</span>
          <span className="text-[10px] text-muted-foreground ml-1">({row.criteria_count} kriteria)</span>
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
      >
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/master/assessment-criteria")}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold shadow-sm hover:bg-amber-500/20 transition-all active:scale-95"
          >
            <Star size={18} />
            Kelola Parameter
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            <ClipboardList size={18} />
            Form Penilaian
          </button>
        </div>
      </DataTable>

      {/* Single score modal removed in favor of bulk modal */}

      <DeleteConfirm isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id, { onSuccess: () => setIsDeleteOpen(false) })} isLoading={deleteMutation.isLoading} />

      <BulkAssessmentModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)} 
        registrations={registrations} 
        criteria={criteria}
        initialRegistrationId={selectedRegId}
        onSuccess={() => {
          refetch(); // Trigger immediate refresh
        }}
      />
    </>
  );
}
