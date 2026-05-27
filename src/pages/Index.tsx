import { ArrowRight, Sparkles, Star, MapPin, ChevronRight, ShieldCheck, Check, X, Download, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { barbers } from "@/lib/data";
import { Logo } from "@/components/Logo";
import { haptics } from "@/lib/haptics";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ease = [0.32, 0.72, 0, 1] as const;

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay: i * 0.07 },
});

const BentoCard = ({
  children,
  className = "",
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) => (
  <motion.div
    {...stagger(index)}
    className={[
      "rounded-[26px] border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl",
      "transition-colors duration-500 hover:border-white/[0.13] hover:bg-white/[0.045]",
      className,
    ].join(" ")}
  >
    {children}
  </motion.div>
);

const Index = () => {
  const [checkInState, setCheckInState] = useState<"idle" | "processing" | "success">("idle");
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [nextSessionTime, setNextSessionTime] = useState("14:15");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showiOSGuide, setShowiOSGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    haptics.medium();
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isiOS) {
      setShowiOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        toast.success("Thank you for installing Koupé!");
      }
    } else {
      setShowiOSGuide(true);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden pb-32">
      {/* Ambient mesh blobs — fixed, non-interactive */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-[560px] w-[560px] rounded-full bg-white/[0.012] blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full bg-white/[0.008] blur-[130px]" />
      </div>

      {/* ── Mobile header (lg:hidden) ───────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] lg:hidden">
        <Logo />
        <Link
          to="/profile"
          onClick={() => haptics.light()}
          className="h-8 w-8 shrink-0 rounded-full bg-gradient-platinum flex items-center justify-center text-[#080808] font-black text-[10px] transition-opacity hover:opacity-80"
        >
          JC
        </Link>
      </header>

      {/* ── Bento grid ─────────────────────────────────────────────── */}
      <section className="px-4 pt-2 sm:px-5 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">

          {/* ── 1 · HERO ── full / full / col-7 ─────────────────────── */}
          <BentoCard
            index={0}
            className="sm:col-span-2 lg:col-span-7 relative overflow-hidden p-10 lg:p-14 lg:min-h-[360px] flex flex-col justify-between gap-10"
          >
            {/* CTA ambient under-glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full blur-[90px]"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
            />

            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25 mb-3">Koupé</p>
                <h1 className="text-5xl font-bold tracking-[-0.04em] leading-[0.93] text-white/90 sm:text-6xl lg:text-[5.5rem]">
                  The Art of
                  <br />
                  <span className="text-shimmer-gold">Grooming.</span>
                </h1>
              </div>

              <p className="text-sm font-normal leading-relaxed text-white/30 max-w-xs">
                Premium artisan sessions, curated for your aesthetic.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/book"
                onClick={() => haptics.medium()}
                className="press group/cta inline-flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-[#080808] tracking-tight"
                style={{
                  boxShadow:
                    "0 0 40px -8px rgba(255,255,255,0.22), 0 8px 24px -8px rgba(0,0,0,0.5)",
                }}
              >
                <span>Book Session</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </BentoCard>

          {/* ── 2 · SESSION COUNTDOWN ── full / full / col-5 ────────── */}
          <BentoCard
            index={1}
            className="sm:col-span-2 lg:col-span-5 p-9 flex flex-col justify-between gap-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-0.5">
                  Next Session
                </p>
                <p className="text-xs font-medium text-white/45">Tomorrow · Alexander Vale</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.45)]" />
                <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-400/70">
                  Confirmed
                </span>
              </div>
            </div>

            <div>
              <div className="text-[5rem] font-bold leading-none tracking-[-0.05em] text-white/90 tabular-nums">
                {nextSessionTime.split(":")[0]}<span className="text-white/15">:</span>{nextSessionTime.split(":")[1]}
              </div>
              <p className="mt-2 text-xs text-white/25 font-medium">
                Signature Cut · 45 min · Rs 1,200
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => { haptics.light(); setIsRescheduleOpen(true); }}
                className="press flex-1 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl py-3.5 text-xs font-semibold text-white/50 tracking-wide transition-colors hover:bg-white/[0.08] hover:text-white/70"
              >
                Reschedule
              </button>
              
              <motion.button
                disabled={checkInState !== "idle"}
                whileTap={{ scale: checkInState === "idle" ? 0.97 : 1 }}
                onClick={() => {
                  haptics.medium();
                  setCheckInState("processing");
                  setTimeout(() => {
                    setCheckInState("success");
                    haptics.success();
                    toast.success("Location Verified. Welcome to Koupé.");
                  }, 1500);
                }}
                className={cn(
                  "press flex-1 rounded-xl border py-3.5 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all duration-300",
                  checkInState === "idle" && "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.08] hover:text-white",
                  checkInState === "processing" && "border-white/5 bg-white/[0.01] text-white/30 cursor-not-allowed",
                  checkInState === "success" && "bg-green-900/30 border-green-500/20 text-green-400"
                )}
              >
                {checkInState === "idle" && "Check-In"}
                {checkInState === "processing" && (
                  <svg className="animate-spin h-4 w-4 text-white/40" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {checkInState === "success" && (
                  <>
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    Checked In
                  </>
                )}
              </motion.button>
            </div>
          </BentoCard>

          {/* Reschedule Bottom Sheet */}
          <AnimatePresence>
            {isRescheduleOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsRescheduleOpen(false)}
                  className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm pointer-events-auto"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed inset-x-0 bottom-0 z-[200] max-h-[85vh] rounded-t-[32px] border-t border-white/10 bg-obsidian p-6 pb-12 shadow-2xl flex flex-col gap-6 pointer-events-auto"
                >
                  <div className="mx-auto h-1 w-12 rounded-full bg-white/20" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Reschedule Session</h3>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mt-1">Select a new slot for tomorrow</p>
                    </div>
                    <button 
                      onClick={() => setIsRescheduleOpen(false)}
                      className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {["09:00", "10:30", "12:00", "14:15", "15:45", "17:15"].map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          haptics.medium();
                          toast.success(`Rescheduled to tomorrow at ${time}`);
                          setIsRescheduleOpen(false);
                          setNextSessionTime(time);
                        }}
                        className="py-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold tracking-wide text-center transition-colors"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        {/* ── 3 · ARTISAN LIST ── full / full / col-5 ─────────────── */}
        <BentoCard index={2} className="sm:col-span-2 lg:col-span-5 p-9">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-0.5">
                Marketplace
              </p>
              <h3 className="text-sm font-semibold text-white/80">Your Local Masters</h3>
            </div>
            <Link
              to="/book"
              className="flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-widest text-white/20 transition-colors hover:text-white/50"
            >
              Browse <ChevronRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>

          <div className="space-y-5">
            {barbers.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07, duration: 0.5, ease }}
                className="flex items-center gap-3.5"
              >
                <img
                  src={b.image}
                  alt={b.name}
                  className="h-11 w-11 shrink-0 rounded-[14px] object-cover ring-1 ring-white/[0.07]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/80 truncate">{b.name}</p>
                  <p className="text-[11px] text-white/25 font-medium mt-0.5">
                    {b.title} · {b.experience}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <Star className="h-3 w-3 text-white/20" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-white/35">{b.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </BentoCard>

        {/* ── 4 · ELITE CLUB ── full / half / col-3 ───────────────── */}
        <BentoCard
          index={3}
          className="lg:col-span-3 relative overflow-hidden p-9 flex flex-col justify-between"
        >
          {/* Gold ambient */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full blur-[72px]"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,76,0.11) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.04]">
              <Star className="h-4 w-4 text-[#C9A84C]/55" strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-1">
              Membership
            </p>
            <h3 className="text-sm font-semibold text-white/80">Elite Club</h3>
            <p className="mt-1 text-[11px] font-medium text-white/30">Crown Member</p>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]/45">
              Active · Verified
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 text-white/15 transition-colors duration-300 group-hover:text-white/35"
              strokeWidth={2}
            />
          </div>
        </BentoCard>

        {/* ── 5 · THE STUDIO ── full / half / col-4 ───────────────── */}
        <BentoCard index={4} className="lg:col-span-4 p-9 flex flex-col justify-between">
          <div>
            <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.04]">
              <MapPin className="h-4 w-4 text-white/20" strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-1">
              Location
            </p>
            <h3 className="text-sm font-semibold text-white/80">The Studio</h3>
            <p className="mt-1 text-[11px] font-medium text-white/30">Port Louis, MU</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.4)]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/60">
              Open · 09:00 – 20:00
            </span>
          </div>
        </BentoCard>

        {/* ── 6 · INSTALL APP ── full width / col-12 ───────────────── */}
        <BentoCard index={5} className="lg:col-span-12 p-8 sm:p-10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/[0.08] bg-gradient-to-br from-white/[0.01] to-white/[0.04]">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-64 w-64 rounded-full bg-amber-500/[0.015] blur-[80px] pointer-events-none" />
          
          <div className="space-y-2 text-center sm:text-left relative z-10">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] mb-2 sm:mb-0">
              <Download className="h-4 w-4 text-amber-500" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">Install Koupé Web App</h3>
            <p className="text-xs text-white/35 max-w-md leading-relaxed">
              Add Koupé directly to your home screen for instantaneous access, offline capabilities, and a true full-screen native styling experience.
            </p>
          </div>

          <button
            onClick={handleInstallClick}
            className="press shrink-0 px-6 py-3.5 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-wider relative z-10 hover:bg-white/95"
            style={{
              boxShadow: "0 0 30px -5px rgba(255,255,255,0.25)"
            }}
          >
            Install App
          </button>
        </BentoCard>
      </div>
    </section>

    {/* iOS PWA Install Guide Bottom Sheet */}
    <AnimatePresence>
      {showiOSGuide && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowiOSGuide(false)}
            className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-sm pointer-events-auto"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[300] max-h-[85vh] rounded-t-[32px] border-t border-white/10 bg-obsidian p-6 pb-12 shadow-2xl flex flex-col gap-6 pointer-events-auto"
          >
            <div className="mx-auto h-1 w-12 rounded-full bg-white/20" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Add to Home Screen</h3>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-1">iOS Safari Installation Guide</p>
              </div>
              <button 
                onClick={() => setShowiOSGuide(false)}
                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 py-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.015] border border-white/[0.03]">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-platinum/80 shrink-0 font-bold text-xs">1</div>
                <div>
                  <h4 className="text-sm font-semibold text-white/90">Open Safari Share Menu</h4>
                  <p className="text-xs text-white/35 mt-1">Tap the Share button <Share className="inline h-3.5 w-3.5 mx-1 text-sky-400" /> at the bottom or top of your Safari browser bar.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.015] border border-white/[0.03]">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-platinum/80 shrink-0 font-bold text-xs">2</div>
                <div>
                  <h4 className="text-sm font-semibold text-white/90">Add to Home Screen</h4>
                  <p className="text-xs text-white/35 mt-1">Scroll down the share sheet options and tap <strong>'Add to Home Screen'</strong>.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.015] border border-white/[0.03]">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-platinum/80 shrink-0 font-bold text-xs">3</div>
                <div>
                  <h4 className="text-sm font-semibold text-white/90">Launch Standalone App</h4>
                  <p className="text-xs text-white/35 mt-1">A Koupé app icon will appear on your home screen. Tap it to launch full-screen.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowiOSGuide(false)}
              className="press w-full h-14 rounded-2xl bg-white text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center"
            >
              Acknowledge
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
  );
};

export default Index;
