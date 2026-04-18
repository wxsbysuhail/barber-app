import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, Bell, ArrowUpRight, Plus, Calendar, Scissors, Coffee, Check, Trash2, Play, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useAppointments, type Appointment } from "@/lib/store";
import { cn } from "@/lib/utils";

const revenueData = [
  { d: "Mon", v: 820 }, { d: "Tue", v: 940 }, { d: "Wed", v: 1120 },
  { d: "Thu", v: 980 }, { d: "Fri", v: 1480 }, { d: "Sat", v: 1820 }, { d: "Sun", v: 1340 },
];

const statusDot = (s: Appointment["status"]) => {
  if (s === "done") return "bg-muted";
  if (s === "now") return "bg-[hsl(var(--success))] animate-pulse";
  return "bg-secondary";
};

// Circular progress ring
const Ring = ({ value }: { value: number }) => {
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative grid place-items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} stroke="hsl(var(--secondary))" strokeWidth="6" fill="none" />
        <motion.circle
          cx="50" cy="50" r={r}
          stroke="url(#ringGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          initial={false}
          animate={{ strokeDasharray: `${dash} ${c}` }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--platinum))" />
            <stop offset="100%" stopColor="hsl(var(--platinum-dim))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-2xl font-semibold tracking-tight text-platinum">{value}%</div>
      </div>
    </div>
  );
};

const Admin = () => {
  const appointments = useAppointments((s) => s.appointments);
  const history = useAppointments((s) => s.history);
  const confirm = useAppointments((s) => s.confirm);
  const complete = useAppointments((s) => s.complete);
  const cancel = useAppointments((s) => s.cancel);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const sorted = [...appointments].sort((a, b) => a.time.localeCompare(b.time));
  const totalChairs = 3;
  const liveCount = appointments.filter((a) => a.status === "now").length;
  const occupancy = Math.round((liveCount / totalChairs) * 100) + 70; // base load
  const cappedOccupancy = Math.min(100, occupancy);

  const todayRevenue = history.reduce((sum, a) => sum + a.price + (a.tip ?? 0), 0) + 1820;
  const bookings = appointments.length + history.length;
  const avgTicket = bookings ? Math.round(todayRevenue / bookings) : 0;

  const target = appointments.find((a) => a.id === confirmingId);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-32 pt-6 animate-float-up">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Command Center</div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Today, Tuesday</h1>
        </div>
        <button className="press glass-card relative grid h-10 w-10 place-items-center rounded-full">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
        </button>
      </header>

      {/* Bento */}
      <div className="grid grid-cols-6 gap-3">
        {/* Card A — Timeline */}
        <div className="glass-card-strong col-span-6 rounded-[24px] p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Today's flow</div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Appointment Timeline</h2>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" strokeWidth={1.5} /> {appointments.length} booked
            </div>
          </div>

          <div className="no-scrollbar relative max-h-[420px] overflow-y-auto pr-1">
            <div className="absolute left-[58px] top-2 bottom-2 w-px bg-border/60" />
            <ul className="space-y-4">
              <AnimatePresence initial={false}>
                {sorted.map((t) => (
                  <motion.li
                    layout
                    key={t.id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -16, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    className="relative flex items-start gap-3"
                  >
                    <div className="w-12 pt-1 text-right text-[11px] font-medium tabular-nums tracking-tight text-muted-foreground">
                      {t.time}
                    </div>
                    <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${statusDot(t.status)}`} />
                    <div
                      className={cn(
                        "flex-1 rounded-2xl border-[0.5px] border-white/10 p-3 transition-colors",
                        t.status === "now" ? "bg-secondary/60 ring-1 ring-platinum-dim/30" : "bg-secondary/20"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium tracking-tight">{t.client}</div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Scissors className="h-3 w-3" strokeWidth={1.5} />
                            <span className="truncate">{t.service.name} · {t.duration} · £{t.price}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.status === "now" && (
                            <span className="rounded-full bg-[hsl(var(--success))]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[hsl(var(--success))]">
                              Live
                            </span>
                          )}
                          <img src={t.barber.image} alt="" className="h-7 w-7 rounded-lg object-cover" loading="lazy" />
                        </div>
                      </div>

                      {/* Management actions */}
                      <div className="mt-3 flex items-center gap-1.5">
                        {t.status !== "now" && (
                          <button
                            onClick={() => confirm(t.id)}
                            className="press flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary"
                          >
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                            Confirm
                          </button>
                        )}
                        {t.status === "now" && (
                          <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--success))]/10 px-3 py-1.5 text-[11px] font-medium text-[hsl(var(--success))]">
                            <Play className="h-3 w-3" strokeWidth={2} fill="currentColor" />
                            Active
                          </span>
                        )}
                        <button
                          onClick={() => complete(t.id)}
                          className="press flex items-center gap-1.5 rounded-full border-[0.5px] border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-platinum hover:bg-white/10"
                        >
                          Finish
                        </button>
                        <div className="ml-auto" />
                        <button
                          onClick={() => setConfirmingId(t.id)}
                          aria-label="Cancel appointment"
                          className="press grid h-7 w-7 place-items-center rounded-full border-[0.5px] border-white/10 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              {appointments.length === 0 && (
                <div className="py-10 text-center text-xs text-muted-foreground">All clear. The chairs await.</div>
              )}
            </ul>
          </div>
        </div>

        {/* Card B — Revenue */}
        <div className="glass-card-strong col-span-6 rounded-[24px] p-5 sm:col-span-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Revenue</div>
              <motion.div
                key={todayRevenue}
                initial={{ scale: 0.96, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="mt-1 text-3xl font-semibold tracking-tight text-platinum"
              >
                £{todayRevenue.toLocaleString()}
              </motion.div>
              <div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--success))]">
                <ArrowUpRight className="h-3 w-3" /> +18.4% vs last week
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="mt-4 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--platinum))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--platinum))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 16,
                    fontSize: 12,
                  }}
                  cursor={{ stroke: "hsl(var(--border))" }}
                />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--platinum))" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card C — Occupancy */}
        <div className="glass-card col-span-6 rounded-[24px] p-5 sm:col-span-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Seat occupancy</div>
          <div className="mt-3 flex items-center justify-between">
            <Ring value={cappedOccupancy} />
            <div className="space-y-1.5 text-right">
              {[
                { label: "Chair 1", v: 88 },
                { label: "Chair 2", v: 92 },
                { label: "Chair 3", v: 78 },
              ].map((c) => (
                <div key={c.label} className="text-[10px] text-muted-foreground">
                  <span className="tabular-nums text-platinum-dim">{c.v}%</span> · {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="glass-card col-span-3 rounded-[24px] p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Bookings today</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-platinum">{bookings}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{history.length} done · {appointments.length} live</div>
        </div>
        <div className="glass-card col-span-3 rounded-[24px] p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg ticket</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-platinum">£{avgTicket}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[hsl(var(--success))]">
            <Coffee className="h-3 w-3" strokeWidth={1.5} /> +£6 vs avg
          </div>
        </div>
      </div>

      {/* Smart Queue */}
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Smart queue</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Live waitlist</h2>
          </div>
          <button className="press glass-card rounded-full px-3 py-1.5 text-[11px] font-medium">Notify all</button>
        </div>

        <div className="glass-card-strong divide-y divide-border/60 rounded-[24px]">
          {appointments.filter((a) => a.status === "upcoming").slice(0, 3).map((q, i) => (
            <div key={q.id} className="flex items-center gap-4 p-4">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-semibold text-platinum">
                {String(i + 1).padStart(2, "0")}
              </div>
              <img src={q.barber.image} alt="" className="h-10 w-10 rounded-xl object-cover" loading="lazy" />
              <div className="flex-1">
                <div className="text-sm font-medium tracking-tight">{q.client}</div>
                <div className="text-[11px] text-muted-foreground">{q.service.name} · with {q.barber.name.split(" ")[0]}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-medium text-platinum">
                  <Clock className="h-3 w-3" /> {q.time}
                </div>
                <button className="press mt-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  Push slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAB */}
      <button
        aria-label="Manual entry"
        className="press glass-card-strong fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-[24px] px-5 py-4 text-sm font-medium tracking-tight text-platinum shadow-elev ring-1 ring-platinum-dim/20 hover:ring-platinum-dim/40"
        style={{ animation: "pulse-glow 3.5s ease-in-out infinite" }}
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} />
        Manual entry
      </button>

      {/* Cancel confirmation sheet */}
      <AnimatePresence>
        {target && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingId(null)}
              className="fixed inset-0 z-50 bg-obsidian/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md p-4"
            >
              <div className="glass-card-strong rounded-[28px] p-6">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Cancel appointment</div>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight">Free up this slot?</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {target.client} · {target.time} · {target.service.name}
                    </p>
                  </div>
                  <button onClick={() => setConfirmingId(null)} className="press grid h-8 w-8 place-items-center rounded-full bg-white/5">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="press flex-1 rounded-full border-[0.5px] border-white/10 bg-white/5 py-3 text-sm font-medium"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={() => {
                      cancel(target.id);
                      setConfirmingId(null);
                    }}
                    className="press flex-1 rounded-full bg-destructive py-3 text-sm font-semibold text-destructive-foreground"
                  >
                    Cancel & free slot
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
