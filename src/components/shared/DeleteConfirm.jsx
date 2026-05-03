import React from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

export default function DeleteConfirm({ isOpen, onClose, onConfirm, isLoading, title = "Hapus Data" }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-2xl p-6 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <AlertTriangle size={32} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="flex gap-3 w-full pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-muted transition-all"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold shadow-sm hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
