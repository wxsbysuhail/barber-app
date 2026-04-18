import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { services, barbers } from "@/lib/data";
import { useAppointments } from "@/lib/store";

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const service = state?.service ?? services[0];
  const barber = state?.barber ?? barbers[0];
  const slot = state?.slot ?? "14:15";
  const add = useAppointments((s) => s.add);

  const tip = Math.round(service.price * 0.15);
  const total = service.price + tip;

  const [confirmed, setConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth - 60);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const fillWidth = useTransform(x, (v) => `${v + 60}px`);
  const labelOpacity = useTransform(x, [0, trackWidth * 0.4], [1, 0]);

  const handleDragEnd = () => {
    if (confirmed) return;
    const current = x.get();
    if (current > trackWidth * 0.88) {
      animate(x, trackWidth, { duration: 0.18, ease: [0.32, 0.72, 0, 1] });
      setConfirmed(true);
      // Persist appointment
      add({
        time: slot,
        client: "James Carter",
        service,
        barber,
        status: "upcoming",
        duration: `${service.duration}m`,
        price: service.price,
        tip,
      });
      // Haptic-like feedback via vibration where available
      if ("vibrate" in navigator) navigator.vibrate?.(30);
      setTimeout(() => navigate("/profile"), 1100);
    } else {
      animate(x, 0, { type: "spring", stiffness: 380, damping: 32 });
    }
  };

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

      <div className="glass-card-strong overflow-hidden rounded-[28px]">
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

      <div className="mt-5 glass-card rounded-[24px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pay with</div>
            <div className="mt-1 text-base font-semibold">Apple Pay</div>
            <div className="text-xs text-muted-foreground">Face ID · Wallet •••• 4421</div>
          </div>
          <div className="rounded-2xl bg-foreground px-3 py-2 text-background text-xs font-semibold tracking-tight">Pay</div>
        </div>
      </div>

      {/* Slide to confirm */}
      <div className="fixed inset-x-0 bottom-24 z-40 px-5">
        <div className="mx-auto max-w-md">
          <div
            ref={trackRef}
            className="glass-card-strong relative h-16 overflow-hidden rounded-full shadow-elev"
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary/20"
              style={{ width: fillWidth }}
            />
            <motion.div
              style={{ opacity: labelOpacity }}
              className="pointer-events-none absolute inset-0 grid place-items-center text-sm font-medium tracking-tight text-muted-foreground"
            >
              {confirmed ? "Confirmed" : `Slide to pay £${total}`}
            </motion.div>
            {confirmed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute inset-0 grid place-items-center text-sm font-semibold tracking-tight text-primary"
              >
                Confirmed
              </motion.div>
            )}
            <motion.div
              drag={confirmed ? false : "x"}
              dragConstraints={{ left: 0, right: trackWidth }}
              dragElastic={0.05}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              style={{ x }}
              className={cn(
                "absolute left-1 top-1 grid h-14 w-14 cursor-grab touch-none place-items-center rounded-full bg-primary text-primary-foreground shadow-glow active:cursor-grabbing"
              )}
            >
              <motion.div
                animate={confirmed ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute"
              >
                <Check className="h-6 w-6" strokeWidth={2.5} />
              </motion.div>
              {!confirmed && (
                <div className="flex gap-0.5">
                  <span className="h-2 w-2 rounded-full bg-primary-foreground/40" />
                  <span className="h-2 w-2 rounded-full bg-primary-foreground/70" />
                  <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </motion.div>
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
