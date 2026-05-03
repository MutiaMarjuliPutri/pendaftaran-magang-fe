import React from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Plus,
  Loader2,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DataTable({ 
  columns, 
  data = [], 
  isLoading, 
  onAdd, 
  onSearch, 
  pagination, 
  onPageChange,
  title,
  description
}) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Cari..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="h-10 pl-10 pr-4 w-64 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/5 focus:border-primary/20 transition-all"
            />
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus size={18} />
              Tambah
            </button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={cn("px-6 py-4", col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-muted-foreground animate-pulse">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">Tidak ada data ditemukan.</p>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={row.id || rowIndex} className="hover:bg-muted/30 transition-colors group">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={cn("px-6 py-4", col.className)}>
                        {col.cell ? col.cell(row) : row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Menampilkan <span className="font-bold text-foreground">{data.length}</span> dari <span className="font-bold text-foreground">{pagination.total}</span> data
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(1)}
                className="p-2 rounded-lg hover:bg-background border border-transparent hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                className="p-2 rounded-lg hover:bg-background border border-transparent hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1 mx-2">
                <span className="text-xs font-medium">Halaman</span>
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                  {pagination.page}
                </span>
                <span className="text-xs font-medium text-muted-foreground">dari {Math.ceil(pagination.total / pagination.perPage)}</span>
              </div>
              <button
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
                onClick={() => onPageChange?.(pagination.page + 1)}
                className="p-2 rounded-lg hover:bg-background border border-transparent hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
              <button
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
                onClick={() => onPageChange?.(Math.ceil(pagination.total / pagination.perPage))}
                className="p-2 rounded-lg hover:bg-background border border-transparent hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
