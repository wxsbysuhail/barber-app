import { TrendingUp, Clock, Bell, ArrowUpRight, Plus, Calendar, Scissors, Coffee } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { barbers } from "@/lib/data";

const data = [
  { d: "Mon", v: 820 }, { d: "Tue", v: 940 }, { d: "Wed", v: 1120 },
  { d: "Thu", v: 980 }, { d: "Fri", v: 1480 }, { d: "Sat", v: 1820 }, { d: "Sun", v: 1340 },
];

const queue = [
  { name: "Oliver Bennett", service: "Skin Fade", wait: "8 min", barber: barbers[0] },
  { name: "Theo Marsh", service: "Beard Sculpt", wait: "22 min", barber: barbers[1] },
  { name: "Hugo Reed", service: "Signature Cut", wait: "35 min", barber: barbers[2] },
];

type TimelineItem = {
  time: string;
  client: string;
  service: string;
  barber: typeof barbers[number];
  status: "done" | "now" | "next" | "upcoming";
  duration: string;
};

const timeline: TimelineItem[] = [
  { time: "09:00", client: "James Whitmore", service: "Signature Cut", barber: barbers[0], status: "done", duration: "45m" },
  { time: "10:00", client: "Felix Dupont", service: "Beard Sculpt", barber: barbers[1], status: "done", duration: "30m" },
  { time: "10:45", client: "Arthur Quinn", service: "The Royale", barber: barbers[2], status: "now", duration: "90m" },
  { time: "12:30", client: "Oliver Bennett", service: "Skin Fade", barber: barbers[0], status: "next", duration: "60m" },
  { time: "13:45", client: "Theo Marsh", service: "Beard Sculpt", barber: barbers[1], status: "upcoming", duration: "30m" },
  { time: "14:30", client: "Hugo Reed", service: "Signature Cut", barber: barbers[2], status: "upcoming", duration: "45m" },
  { time: "15:30", client: "Lucas Ferrer", service: "Skin Fade", barber: barbers[0], status: "upcoming", duration: "60m" },
  { time: "17:00", client: "Sebastian Cole", service: "The Royale", barber: barbers[1], status: "upcoming", duration: "90m" },
];

const statusDot = (s: TimelineItem["status"]) => {
  if (s === "done") return "bg-muted";
  if (s === "now") return "bg-[hsl(var(--success))] animate-pulse";
  if (s === "next") return "bg-platinum-dim";
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
        <circle
          cx="50" cy="50" r={r}
          stroke="url(#ringGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.32, 0.72, 0, 1)" }}
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
  return (
    <div className="mx-auto max-w-2xl px-5 pb-32 pt-6 animate-float-up">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Command Center</div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Today, Tuesday</h1>
        </div>
        <button className="press glass relative grid h-10 w-10 place-items-center rounded-full">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
        </button>
      </header>

      {/* Bento */}
      <div className="grid grid-cols-6 gap-3">
        {/* Card A — Today's Appointment Timeline (LARGE) */}
        <div className="glass-strong col-span-6 rounded-[24px] p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Today's flow</div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Appointment Timeline</h2>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" strokeWidth={1.5} /> 8 booked · 2 open
            </div>
          </div>

          <div className="no-scrollbar relative max-h-[360px] overflow-y-auto pr-1">
            {/* vertical rail */}
            <div className="absolute left-[58px] top-2 bottom-2 w-px bg-border/60" />
            <ul className="space-y-4">
              {timeline.map((t) => (
                <li key={t.time} className="relative flex items-start gap-3">
                  <div className="w-12 pt-1 text-right text-[11px] font-medium tabular-nums tracking-tight text-muted-foreground">
                    {t.time}
                  </div>
                  <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${statusDot(t.status)}`} />
                  <div
                    className={`flex-1 rounded-2xl border border-border/50 p-3 transition-colors ${
                      t.status === "now" ? "bg-secondary/60 ring-1 ring-platinum-dim/30" : "bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium tracking-tight">{t.client}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Scissors className="h-3 w-3" strokeWidth={1.5} />
                          <span className="truncate">{t.service} · {t.duration}</span>
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
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card B — Revenue Analytics (MEDIUM) */}
        <div className="glass-strong col-span-6 rounded-[24px] p-5 sm:col-span-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Revenue</div>
              <div className="mt-1 text-3xl font-semibold tracking-tight text-platinum">£1,820</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--success))]">
                <ArrowUpRight className="h-3 w-3" /> +18.4% vs last week
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="mt-4 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
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

        {/* Card C — Seat Occupancy ring (SMALL) */}
        <div className="glass col-span-6 rounded-[24px] p-5 sm:col-span-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Seat occupancy</div>
          <div className="mt-3 flex items-center justify-between">
            <Ring value={86} />
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
        <div className="glass col-span-3 rounded-[24px] p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Bookings today</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-platinum">28</div>
          <div className="mt-1 text-[11px] text-muted-foreground">4 walk-ins · 24 booked</div>
        </div>
        <div className="glass col-span-3 rounded-[24px] p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg ticket</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-platinum">£64</div>
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
          <button className="press glass rounded-full px-3 py-1.5 text-[11px] font-medium">Notify all</button>
        </div>

        <div className="glass-strong divide-y divide-border/60 rounded-[24px]">
          {queue.map((q, i) => (
            <div key={q.name} className="flex items-center gap-4 p-4">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-semibold text-platinum">
                {String(i + 1).padStart(2, "0")}
              </div>
              <img src={q.barber.image} alt="" className="h-10 w-10 rounded-xl object-cover" loading="lazy" />
              <div className="flex-1">
                <div className="text-sm font-medium tracking-tight">{q.name}</div>
                <div className="text-[11px] text-muted-foreground">{q.service} · with {q.barber.name.split(" ")[0]}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-medium text-platinum">
                  <Clock className="h-3 w-3" /> {q.wait}
                </div>
                <button className="press mt-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  Push slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Manual Entry FAB */}
      <button
        aria-label="Manual entry"
        className="press glass-strong fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-[24px] px-5 py-4 text-sm font-medium tracking-tight text-platinum shadow-elev ring-1 ring-platinum-dim/20 hover:ring-platinum-dim/40"
        style={{ animation: "pulse-glow 3.5s ease-in-out infinite" }}
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} />
        Manual entry
      </button>
    </div>
  );
};

export default Admin;
