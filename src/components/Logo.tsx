export const Logo = ({ className = "", iconOnly = false }: { className?: string; iconOnly?: boolean }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="relative shrink-0">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/65" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4L15 9L21 6L18 13H6L3 6L9 9L12 4Z" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
      </svg>
      <div className="absolute inset-0 bg-white/10 blur-xl rounded-full opacity-40" />
    </div>
    {!iconOnly && (
      <span className="text-[10px] font-black uppercase tracking-[0.45em] text-white/55">Koupé</span>
    )}
  </div>
);
