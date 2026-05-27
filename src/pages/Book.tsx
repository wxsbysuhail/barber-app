import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Star, Clock, Scissors, User, ArrowRight } from "lucide-react";
import { services, barbers, timeSlots, type Service, type Barber } from "@/lib/data";
import { useAppointments } from "@/lib/store";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { SlideAction } from "@/components/SlideAction";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

const ease = [0.32, 0.72, 0, 1] as const;

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

const DAYS = [
  { label: "Today",    date: "26" },
  { label: "Tomorrow", date: "27" },
  { label: "Wed",      date: "28" },
  { label: "Thu",      date: "29" },
  { label: "Fri",      date: "30" },
  { label: "Sat",      date: "31" },
];

// ── Segmented progress control (desktop) ──────────────────────────────────────

const SegmentedProgress = ({
  step,
  goTo,
}: {
  step: Step;
  goTo: (s: Step) => void;
}) => (
  <div className="hidden lg:flex h-8 items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-1">
    {(["Service", "Artisan", "Timing"] as const).map((label, i) => {
      const s = (i + 1) as Step;
      const isActive = step === s;
      const isDone   = step > s;
      return (
        <button
          key={label}
          onClick={() => { if (isDone) { haptics.light(); goTo(s); } }}
          disabled={!isDone && !isActive}
          className={cn(
            "flex h-full items-center gap-1.5 rounded-full px-4 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300",
            isActive ? "bg-white text-[#080808]" :
            isDone   ? "cursor-pointer text-white/45 hover:text-white/70" :
                       "cursor-default text-white/20"
          )}
        >
          {isDone && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          {label}
        </button>
      );
    })}
  </div>
);

// ── Summary row ───────────────────────────────────────────────────────────────

const SummaryRow = ({
  label, icon, value, filled,
}: {
  label: string; icon: React.ReactNode; value?: string; filled: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className={cn(
      "h-8 w-8 shrink-0 rounded-xl border flex items-center justify-center transition-all duration-500",
      filled ? "border-white/[0.1] bg-white/[0.05] text-white/55" : "border-white/[0.05] text-white/15"
    )}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20 mb-0.5">{label}</p>
      <p className={cn(
        "text-sm font-semibold truncate transition-all duration-500",
        filled && value ? "text-white/80" : "text-white/20"
      )}>
        {value ?? "Pending"}
      </p>
    </div>
    <AnimatePresence>
      {filled && value && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="shrink-0 h-5 w-5 rounded-full border border-white/[0.12] bg-white/[0.06] flex items-center justify-center"
        >
          <Check className="h-2.5 w-2.5 text-white/60" strokeWidth={3} />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ── Row card used for both services and artisans ──────────────────────────────

const RowCard = ({
  selected, onClick, children,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "press-elev group w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 transform",
      selected
        ? "border-amber-500 bg-amber-500/[0.04] scale-[1.02] shadow-[0_0_24px_-10px_rgba(245,158,11,0.25)]"
        : "border-white/[0.07] bg-white/[0.025] backdrop-blur-xl hover:border-white/[0.13] hover:bg-white/[0.05]"
    )}
  >
    {children}
  </button>
);

// ── Main component ─────────────────────────────────────────────────────────────

const Book = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step,        setStep]        = useState<Step>(1);
  const [direction,   setDirection]   = useState(1);
  const [service,     setService]     = useState<Service | null>(() => {
    if (location.state?.preselectedServiceId) {
      return services.find(s => s.id === location.state.preselectedServiceId) || null;
    }
    return null;
  });
  const [barber,      setBarber]      = useState<Barber | null>(null);
  const [slot,        setSlot]        = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const appointments = useAppointments((s) => s.appointments);
  const occupied = appointments.map((a) => a.time);

  const goTo = (s: Step) => {
    setDirection(s > step ? 1 : -1);
    setStep(s);
  };

  const next = () => {
    if (step === 3 && slot) {
      navigate("/checkout", { state: { service, barber, slot } });
      return;
    }
    goTo(Math.min(3, step + 1) as Step);
  };

  const back = () => {
    if (step === 1) { navigate("/"); return; }
    goTo((step - 1) as Step);
  };

  const canNext =
    (step === 1 && !!service) ||
    (step === 2 && !!barber)  ||
    (step === 3 && !!slot);

  const stepTitles = ["Choose a service", "Select your artisan", "Pick your time"];

  return (
    <div className="min-h-screen text-white overflow-x-hidden">

      {/* 1 px mobile progress thread */}
      <div className="fixed top-0 left-0 right-0 z-[110] h-px bg-white/[0.05] lg:hidden">
        <motion.div
          className="h-full bg-white/50"
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.7, ease }}
        />
      </div>

      <div className="mx-auto max-w-screen-xl px-5 pb-44 pt-[calc(3.5rem+env(safe-area-inset-top))] lg:px-8 lg:pt-10 lg:pb-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">

          {/* ── LEFT: interactive canvas ─────────────────────────────── */}
          <div className="lg:col-span-7">

            {/* ── Header ── */}
            <header className="mb-7 flex items-center justify-between gap-3 lg:mb-9">
              <button
                onClick={back}
                className="press h-9 w-9 shrink-0 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.07] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>

              {/* Mobile: step label pill */}
              <div className="flex-1 flex justify-center lg:hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl px-4 py-1.5"
                  >
                    <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/30">
                      {step} / 3
                    </span>
                    <div className="h-3 w-px bg-white/[0.1]" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">
                      {stepTitles[step - 1]}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop: segmented control */}
              <SegmentedProgress step={step} goTo={goTo} />

              <div className="w-9 shrink-0 lg:hidden" />
            </header>

            {/* ── Step title ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease }}
                className="mb-6"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-2">
                  Step {step} of 3
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-white/90 sm:text-4xl">
                  {stepTitles[step - 1]}
                </h1>
              </motion.div>
            </AnimatePresence>

            {/* ── Step content ── */}
            <AnimatePresence custom={direction} mode="wait">

              {/* STEP 1 — Services */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease }}
                  className="space-y-6"
                >
                  {(["The Essentials", "Elite Care"] as const).map((cat) => (
                    <div key={cat} className="space-y-2">
                      <p className="mb-3 px-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/20">
                        {cat}
                      </p>
                      {services.filter((s) => s.category === cat).map((s) => {
                        const sel = service?.id === s.id;
                        return (
                          <RowCard key={s.id} selected={sel} onClick={() => { haptics.selection(); setService(s); }}>
                            <div className={cn(
                              "h-10 w-10 shrink-0 rounded-[13px] flex items-center justify-center transition-all duration-300",
                              sel ? "bg-white/[0.12] text-white/80" : "border border-white/[0.07] bg-white/[0.04] text-white/25"
                            )}>
                              <Scissors className="h-4 w-4" strokeWidth={1.75} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white/85 truncate">{s.name}</p>
                              <p className="mt-0.5 text-[11px] text-white/30 truncate">{s.description}</p>
                            </div>

                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                              <span className="text-sm font-bold text-white/75">Rs {s.price}</span>
                              <span className="rounded-full border border-white/[0.08] px-2 py-px text-[8px] font-semibold uppercase tracking-widest text-white/30">
                                {s.duration} min
                              </span>
                            </div>

                            <AnimatePresence>
                              {sel && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="shrink-0 h-6 w-6 rounded-full border border-white/[0.18] bg-white/[0.1] flex items-center justify-center"
                                >
                                  <Check className="h-3 w-3 text-white/80" strokeWidth={2.5} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </RowCard>
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* STEP 2 — Artisans */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease }}
                  className="space-y-2"
                >
                  {barbers.map((b) => {
                    const sel = barber?.id === b.id;
                    return (
                      <RowCard key={b.id} selected={sel} onClick={() => { haptics.selection(); setBarber(b); }}>
                        <img
                          src={b.image}
                          alt={b.name}
                          className="h-14 w-14 shrink-0 rounded-[18px] object-cover ring-1 ring-white/[0.08]"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white/85 truncate">{b.name}</p>
                          <p className="mt-0.5 text-[11px] text-white/30 truncate">
                            {b.title} · {b.signature}
                          </p>
                          <p className="mt-1 text-[10px] text-white/20">{b.reviews} reviews · {b.experience}</p>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1">
                          <Star className="h-3 w-3 text-white/25" strokeWidth={1.5} />
                          <span className="text-xs font-semibold text-white/50">{b.rating}</span>
                        </div>

                        <AnimatePresence>
                          {sel && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="shrink-0 h-6 w-6 rounded-full border border-white/[0.18] bg-white/[0.1] flex items-center justify-center"
                            >
                              <Check className="h-3 w-3 text-white/80" strokeWidth={2.5} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </RowCard>
                    );
                  })}
                </motion.div>
              )}

              {/* STEP 3 — Timing */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease }}
                  className="space-y-6"
                >
                  {/* Day scroller */}
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {DAYS.map((d, i) => (
                      <button
                        key={d.label}
                        onClick={() => { haptics.light(); setSelectedDay(i); setSlot(null); }}
                        className={cn(
                          "press shrink-0 flex flex-col items-center rounded-2xl border px-4 py-3 transition-all duration-300",
                          selectedDay === i
                            ? "border-white/[0.18] bg-white/[0.07] text-white"
                            : "border-white/[0.07] bg-white/[0.025] text-white/35 hover:border-white/[0.12] hover:text-white/60"
                        )}
                      >
                        <span className="text-[9px] font-semibold uppercase tracking-widest mb-1">{d.label}</span>
                        <span className="text-xl font-bold tracking-tight">{d.date}</span>
                      </button>
                    ))}
                  </div>

                  {/* Time grid */}
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/20">
                      <Clock className="h-3 w-3" strokeWidth={1.5} /> Available windows
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((t) => {
                        const isDisabled = occupied.includes(t);
                        const isSelected = slot === t;
                        return (
                          <button
                            key={t}
                            disabled={isDisabled}
                            onClick={() => { haptics.selection(); setSlot(t); }}
                            className={cn(
                              "press rounded-xl border py-3.5 text-sm font-semibold tracking-tight transition-all duration-300",
                              "disabled:opacity-20 disabled:cursor-not-allowed disabled:pointer-events-none",
                              isSelected
                                ? "border-white/[0.22] bg-white/[0.09] text-white shadow-[0_0_22px_-6px_rgba(255,255,255,0.12)]"
                                : "border-white/[0.07] bg-white/[0.025] text-white/45 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white/75"
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── RIGHT: floating summary ticket (desktop) ─────────────── */}
          <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-10">
            <motion.div
              layout
              className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl"
              style={{
                boxShadow:
                  "0 32px 80px -20px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {/* Ticket header */}
              <div className="border-b border-white/[0.06] px-7 py-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-0.5">
                  Session Summary
                </p>
                <h2 className="text-base font-bold tracking-tight text-white/70">Koupé</h2>
              </div>

              <div className="px-7 py-6 space-y-6">

                {/* Selections */}
                <div className="space-y-4">
                  <SummaryRow
                    label="Service"
                    icon={<Scissors className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    value={service?.name}
                    filled={!!service}
                  />
                  <SummaryRow
                    label="Artisan"
                    icon={<User className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    value={barber?.name}
                    filled={!!barber}
                  />
                  <SummaryRow
                    label="Time"
                    icon={<Clock className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    value={slot ? `${DAYS[selectedDay].label} · ${slot}` : undefined}
                    filled={!!slot}
                  />
                </div>

                {/* Price breakdown — appears when service is chosen */}
                <AnimatePresence>
                  {service && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.3, ease }}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Duration</span>
                        <span className="text-xs font-semibold text-white/50">{service.duration} min</span>
                      </div>
                      <div className="h-px bg-white/[0.06]" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/35">Total</span>
                        <span className="text-2xl font-bold tracking-tight text-white/85">Rs {service.price}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <button
                  onClick={() => { haptics.medium(); next(); }}
                  disabled={!canNext}
                  className={cn(
                    "press w-full rounded-2xl py-4 text-sm font-bold tracking-wide transition-all duration-500",
                    canNext
                      ? "bg-white text-[#080808] shadow-[0_0_40px_-8px_rgba(255,255,255,0.25)] hover:shadow-[0_0_52px_-8px_rgba(255,255,255,0.35)]"
                      : "border border-white/[0.06] bg-white/[0.03] text-white/35 cursor-default"
                  )}
                >
                  {step === 3 ? "Confirm Booking" : "Continue"}
                </button>

                <p className="text-center text-[9px] font-medium uppercase tracking-widest text-white/15">
                  Secure checkout · No cancellation fee
                </p>
              </div>
            </motion.div>
          </aside>

        </div>
      </div>

      {/* ── Mobile bottom CTA (above TabBar) ─────────────────────────── */}
      <div className="fixed inset-x-0 bottom-[calc(108px+env(safe-area-inset-bottom))] z-[120] px-5 pointer-events-none lg:hidden">
        <div className="mx-auto max-w-sm pointer-events-auto">
          {step === 3 && canNext ? (
            <SlideAction
              price={`Rs ${service?.price}`}
              label="Slide to book"
              onComplete={() => {
                haptics.success();
                toast.success("Session locked. See you soon.");
                setTimeout(() => navigate("/"), 1800);
              }}
            />
          ) : (
            <button
              onClick={() => { haptics.medium(); if (canNext) next(); }}
              disabled={!canNext}
              className={cn(
                "press w-full h-14 rounded-2xl text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-500",
                canNext
                  ? "bg-white text-[#080808] shadow-[0_0_36px_-8px_rgba(255,255,255,0.22)]"
                  : "border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl text-white/20"
              )}
            >
              {canNext ? (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </>
              ) : (
                <span>Make a selection</span>
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default Book;
