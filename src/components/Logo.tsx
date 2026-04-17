export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l3 8h12l3-8-4.5 3L12 5 7.5 12 3 9z" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="3" cy="9" r="1" fill="currentColor" />
      <circle cx="21" cy="9" r="1" fill="currentColor" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
    </svg>
    <span className="text-sm font-semibold tracking-[0.3em]">CROWN</span>
  </div>
);
