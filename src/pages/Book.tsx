import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Star, Clock } from "lucide-react";
import { services, barbers, timeSlots, type Service, type Barber } from "@/lib/data";
import { useAppointments } from "@/lib/store";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const Book = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<Service | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const appointments = useAppointments((s) => s.appointments);
  const occupied = appointments.map((a) => a.time);

  const next = () => {
    if (step === 3 && slot) {
      navigate("/checkout", { state: { service, barber, slot } });
      return;
    }
    setStep((s) => Math.min(3, s + 1) as Step);
  };

  const canNext = (step === 1 && service) || (step === 2 && barber) || (step === 3 && slot);

  return (
    <div className="mx-auto max-w-md px-5 pb-32 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <button
          onClick={() => (step === 1 ? navigate("/") : setStep((s) => (s - 1) as Step))}
          className="press glass grid h-10 w-10 place-items-center rounded-full"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/60" : "w-4 bg-border"
              )}
            />
          ))}
        </div>
        <div className="w-10" />
      </header>

      <motion.div layoutId="book-hero" className="mb-6">
        <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
          {step === 1 && "Choose service"}
          {step === 2 && "Pick your barber"}
          {step === 3 && "Select a time"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 && "Curated for the discerning gentleman."}
          {step === 2 && "Specialists, hand-picked."}
          {step === 3 && "Tomorrow · Real-time availability"}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="space-y-3"
          >
            {services.map((s) => (
              <motion.button
                layoutId={`service-${s.id}`}
                key={s.id}
                onClick={() => setService(s)}
                className={cn(
                  "press glass-card flex w-full items-center justify-between rounded-[22px] p-5 text-left transition-all",
                  service?.id === s.id && "ring-2 ring-primary shadow-glow"
                )}
              >
                <div>
                  <div className="text-base font-semibold tracking-tight">{s.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration} min</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-platinum">£{s.price}</div>
                  {service?.id === s.id && (
                    <div className="mt-1 inline-grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 no-scrollbar"
          >
            {barbers.map((b) => (
              <button
                key={b.id}
                onClick={() => setBarber(b)}
                className={cn(
                  "press group relative w-[78%] flex-shrink-0 snap-center overflow-hidden rounded-[28px] text-left",
                  barber?.id === b.id && "ring-2 ring-primary shadow-glow"
                )}
              >
                <img src={b.image} alt={b.name} className="h-[440px] w-full object-cover" loading="lazy" width={768} height={1024} />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-2">
                    <span className="glass rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest">{b.title}</span>
                    <span className="flex items-center gap-1 text-[11px] text-platinum">
                      <Star className="h-3 w-3 fill-current" /> {b.rating}
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight">{b.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {b.experience} · Signature: {b.signature}
                  </div>
                </div>
                {barber?.id === b.id && (
                  <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-2 no-scrollbar">
              {["Today", "Tomorrow", "Wed 24", "Thu 25", "Fri 26", "Sat 27"].map((d, i) => (
                <button
                  key={d}
                  className={cn(
                    "press glass-card min-w-[68px] rounded-2xl px-3 py-3 text-center transition",
                    i === 1 && "bg-primary text-primary-foreground"
                  )}
                >
                  <div className="text-[10px] uppercase tracking-widest opacity-70">{d.split(" ")[0]}</div>
                  <div className="mt-1 text-lg font-semibold">{d.split(" ")[1] || "Now"}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {timeSlots.map((t) => {
                const disabled = occupied.includes(t);
                return (
                  <button
                    key={t}
                    disabled={disabled}
                    onClick={() => setSlot(t)}
                    className={cn(
                      "press glass-card rounded-2xl py-4 text-sm font-medium transition",
                      slot === t && "bg-primary text-primary-foreground shadow-glow",
                      disabled && "opacity-25"
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-24 z-40 px-5">
        <div className="mx-auto max-w-md">
          <button
            onClick={next}
            disabled={!canNext}
            className={cn(
              "press w-full rounded-full bg-primary py-4 text-sm font-semibold tracking-tight text-primary-foreground shadow-elev transition-all",
              !canNext && "opacity-30"
            )}
          >
            {step === 3 ? "Continue to checkout" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Book;
