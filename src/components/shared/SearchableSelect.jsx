import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Pilih...',
  error,
  className
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const filteredOptions = options.filter(opt => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (opt.label && opt.label.toLowerCase().includes(searchLower)) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex min-h-[44px] w-full items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all cursor-pointer hover:bg-muted/50",
          error ? "border-destructive focus:ring-destructive/20" : "border-input focus:ring-primary/20",
          isOpen ? "ring-2 ring-primary/20 border-primary/50" : ""
        )}
      >
        <div className="flex-1 truncate">
          {selectedOption ? (
            <div className="flex flex-col">
              <span className="truncate leading-tight font-medium">{selectedOption.label}</span>
              {selectedOption.subLabel && (
                <span className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">{selectedOption.subLabel}</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} className={cn("text-muted-foreground shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-xl border border-border bg-card text-card-foreground shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          <div className="flex items-center border-b border-border px-3 py-2 bg-muted/20">
            <Search size={14} className="mr-2 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Tidak ada hasil ditemukan.
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none hover:bg-primary/5 hover:text-primary transition-colors",
                    String(value) === String(opt.value) ? "bg-primary/10 text-primary font-medium" : ""
                  )}
                >
                  <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
                    {String(value) === String(opt.value) && <Check size={14} className="text-primary" />}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{opt.label}</span>
                    {opt.subLabel && <span className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">{opt.subLabel}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
