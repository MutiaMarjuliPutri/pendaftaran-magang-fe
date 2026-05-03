import { useCrud } from "@/hooks/useCrud";
import DataTable from "@/components/shared/DataTable";
import { CheckCircle2 } from "lucide-react";

export default function RegistrationStatuses() {
  const { data, isLoading, pagination, setParams } = useCrud("/master/registration-statuses", "registration-statuses");

  const columns = [
    {
      header: "Nama Status",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            <CheckCircle2 size={16} className="text-primary" />
          </div>
          <span className="font-bold">{row.name}</span>
        </div>
      ),
    },
    { header: "Deskripsi", accessorKey: "description", className: "text-muted-foreground text-sm italic" },
  ];

  return (
    <DataTable
      title="Status Pendaftaran"
      description="Daftar tahapan status pendaftaran magang (Read Only)."
      columns={columns}
      data={data}
      isLoading={isLoading}
      onSearch={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
      pagination={pagination}
      onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
    />
  );
}
