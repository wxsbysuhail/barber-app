export const Logo = ({ className = "", iconOnly = false }: { className?: string; iconOnly?: boolean }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="relative shrink-0 flex items-center justify-center">
      <img 
        src="/logo.png" 
        className="h-6 w-6 object-contain rounded-md brightness-110" 
        alt="Koupé" 
      />
      <div className="absolute inset-0 bg-white/5 blur-md rounded-full opacity-20 pointer-events-none" />
    </div>
    {!iconOnly && (
      <span className="text-[10px] font-black uppercase tracking-[0.45em] text-white/55">Koupé</span>
    )}
  </div>
);
