import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { services, barbers } from "@/lib/data";

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const service = state?.service ?? services[0];
  const barber = state?.barber ?? barbers[0];
  const slot = state?.slot ?? "14:15";

  const tip = Math.round(service.price * 0.15);
  const total = service.price + tip;

  // Slide to confirm
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onPointerDown = () => { dragging.current = true; };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !trackRef.current || confirmed) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left - 28, 0), rect.width - 56);
    const pct = x / (rect.width - 56);
    setProgress(pct);
    if (pct > 0.92) {
      setConfirmed(true);
      setProgress(1);
      dragging.current = false;
      setTimeout(() => navigate("/profile"), 900);
    }
  };
  const onPointerUp = () => {
    dragging.current = false;
    if (!confirmed) setProgress(0);
  };

  useEffect(() => {
    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, [confirmed]);

  return (
    <div className="mx-auto max-w-md px-5 pb-40 pt-6 animate-float-up">
      <header className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="press glass grid h-10 w-10 place-items-center rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Checkout</div>
        <div className="w-10" />
      </header>

      <h1 className="mb-1 text-[32px] font-semibold tracking-tight">Confirm & pay</h1>
      <p className="mb-6 text-sm text-muted-foreground">Review the details before securing your seat.</p>

      <div className="glass-strong overflow-hidden rounded-[28px]">
        <div className="flex items-center gap-4 p-5">
          <img src={barber.image} alt={barber.name} className="h-14 w-14 rounded-2xl object-cover" loading="lazy" />
          <div>
            <div className="text-base font-semibold tracking-tight">{service.name}</div>
            <div className="text-xs text-muted-foreground">{barber.name} · Tomorrow {slot}</div>
          </div>
        </div>
        <div className="border-t border-border/60 px-5 py-4 text-sm">
          <Row label="Service" value={`£${service.price}`} />
          <Row label="Suggested tip (15%)" value={`£${tip}`} />
          <div className="my-3 h-px bg-border/60" />
          <Row label="Total" value={`£${total}`} bold />
        </div>
      </div>

      <div className="mt-5 glass rounded-[24px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pay with</div>
            <div className="mt-1 text-base font-semibold">Apple Pay</div>
            <div className="text-xs text-muted-foreground">Face ID · Wallet •••• 4421</div>
          </div>
          <div className="rounded-2xl bg-foreground px-3 py-2 text-background text-xs font-semibold tracking-tight"></div>
        </div>
      </div>

      {/* Slide to confirm */}
      <div className="fixed inset-x-0 bottom-24 z-40 px-5">
        <div className="mx-auto max-w-md">
          <div
            ref={trackRef}
            onPointerMove={onPointerMove}
            className="glass-strong relative h-16 overflow-hidden rounded-full shadow-elev"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/20"
              style={{ width: `calc(${progress * 100}% + 56px)` }}
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm font-medium tracking-tight text-muted-foreground">
              {confirmed ? "Confirmed" : `Slide to pay £${total}`}
            </div>
            <div
              onPointerDown={onPointerDown}
              style={{ transform: `translateX(${progress * 100}%)` }}
              className={cn(
                "absolute left-1 top-1 grid h-14 w-14 cursor-grab touch-none place-items-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform active:cursor-grabbing",
                confirmed && "left-auto right-1 transform-none"
              )}
            >
              <Check className={cn("h-5 w-5 transition-all", !confirmed && "opacity-0")} />
              {!confirmed && (
                <div className="absolute flex gap-0.5">
                  <span className="h-2 w-2 rounded-full bg-primary-foreground/40" />
                  <span className="h-2 w-2 rounded-full bg-primary-foreground/70" />
                  <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={cn("flex justify-between py-1.5", bold && "text-base")}>
    <span className={cn("text-muted-foreground", bold && "text-foreground font-medium")}>{label}</span>
    <span className={cn(bold && "font-semibold text-platinum text-lg")}>{value}</span>
  </div>
);

export default Checkout;
