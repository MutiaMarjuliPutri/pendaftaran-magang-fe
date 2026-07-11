import React, { useRef } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ChevronDown,
  Search,
  Plus,
  Loader2,
  Filter,
  Layers
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
  description,
  children,
  groupByKey
}) {
  let lastGroupValue = null;
  const [collapsedGroups, setCollapsedGroups] = React.useState({});
  const debounceRef = useRef(null);

  const handleSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(value);
    }, 400);
  };

  const groupCounts = groupByKey
    ? data.reduce((acc, row) => {
        const key = row[groupByKey] || "Lainnya";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    : {};

  const toggleGroup = (groupValue) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupValue || "Lainnya"]: !prev[groupValue || "Lainnya"],
    }));
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight truncate">{title}</h2>
          {description && <p className="text-muted-foreground text-sm mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Cari..."
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 pl-10 pr-4 w-full sm:w-52 lg:w-64 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/5 focus:border-primary/20 transition-all"
            />
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="h-10 px-3 lg:px-4 inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95 shrink-0 text-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          )}
        </div>
      </div>

      {children}

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-0">
          <table className="w-full text-sm text-left min-w-[500px]">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={cn("px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm whitespace-nowrap", col.className)}>
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
                data.map((row, rowIndex) => {
                  const currentGroupValue = groupByKey ? row[groupByKey] : null;
                  const showSeparator = groupByKey && currentGroupValue !== lastGroupValue;
                  const groupKey = currentGroupValue || "Lainnya";
                  const isCollapsed = Boolean(collapsedGroups[groupKey]);
                  lastGroupValue = currentGroupValue;

                  return (
                    <React.Fragment key={row.id || rowIndex}>
                      {showSeparator && (
                        <tr className="bg-red-50/30 select-none">
                          <td colSpan={columns.length} className="px-0 py-0">
                            <button
                              type="button"
                              onClick={() => toggleGroup(currentGroupValue)}
                              className="w-full flex items-center bg-gradient-to-r from-red-900/10 via-red-900/5 to-transparent px-6 py-3 border-y border-red-900/10 hover:from-red-900/15 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-900/20 flex items-center justify-center text-red-900 shadow-sm border border-red-900/20">
                                  <ChevronRight size={14} className={cn("transition-transform", !isCollapsed && "rotate-90")} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-extrabold text-red-900">
                                    {groupByKey.charAt(0).toUpperCase() + groupByKey.slice(1)} {currentGroupValue || "Lainnya"}
                                  </span>
                                  <span className="text-[10px] font-semibold text-red-900/60">
                                    {groupCounts[groupKey] || 0} peserta
                                  </span>
                                </div>
                              </div>
                              <div className="ml-8 flex-1 h-[1px] bg-gradient-to-r from-red-900/20 to-transparent"></div>
                              <span className="ml-4 text-[10px] font-bold uppercase tracking-wider text-red-900/60">
                                {isCollapsed ? "Expand" : "Collapse"}
                              </span>
                            </button>
                          </td>
                        </tr>
                      )}
                      {!isCollapsed && (
                        <tr className="hover:bg-muted/30 transition-colors group">
                          {columns.map((col, colIndex) => (
                            <td key={colIndex} className={cn("px-3 lg:px-6 py-3 lg:py-4", col.className)}>
                              {col.cell ? col.cell(row) : row[col.accessorKey]}
                            </td>
                          ))}
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Menampilkan <span className="font-bold text-foreground">{data.length}</span> dari <span className="font-bold text-foreground">{pagination.total}</span> data
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(1)}
                className="p-1.5 lg:p-2 rounded-lg hover:bg-background border border-transparent hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                className="p-1.5 lg:p-2 rounded-lg hover:bg-background border border-transparent hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center gap-1 mx-1">
                <span className="text-xs font-medium hidden sm:inline">Halaman</span>
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                  {pagination.page}
                </span>
                <span className="text-xs font-medium text-muted-foreground">/ {Math.ceil(pagination.total / pagination.perPage)}</span>
              </div>
              <button
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
                onClick={() => onPageChange?.(pagination.page + 1)}
                className="p-1.5 lg:p-2 rounded-lg hover:bg-background border border-transparent hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
              <button
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
                onClick={() => onPageChange?.(Math.ceil(pagination.total / pagination.perPage))}
                className="p-1.5 lg:p-2 rounded-lg hover:bg-background border border-transparent hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
