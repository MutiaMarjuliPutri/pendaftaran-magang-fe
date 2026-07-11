import React from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  isLoading,
  maxWidth = "max-w-lg",
  customFooter
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className={cn(
        "relative w-full bg-card border border-border shadow-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 sm:zoom-in-95",
        maxWidth
      )}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-muted/20">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {customFooter ? customFooter : (
            <div className="px-4 sm:px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-muted transition-all text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Simpan
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
