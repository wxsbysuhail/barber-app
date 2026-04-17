import { TrendingUp, Users, Clock, Bell, ArrowUpRight } from "lucide-react";
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

const Admin = () => {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-32 pt-6 animate-float-up">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Studio Console</div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Today, Tuesday</h1>
        </div>
        <button className="press glass relative grid h-10 w-10 place-items-center rounded-full">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
        </button>
      </header>

      {/* Bento */}
      <div className="grid grid-cols-6 gap-3">
        {/* Revenue chart */}
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

        {/* Occupancy */}
        <div className="glass col-span-3 rounded-[24px] p-5 sm:col-span-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Seat occupancy</div>
          <div className="mt-3 flex items-end gap-2">
            <div className="text-3xl font-semibold tracking-tight text-platinum">86%</div>
            <Users className="mb-1 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="mt-4 space-y-2">
            {[88, 92, 78].map((p, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Chair {i + 1}</span><span>{p}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-platinum" style={{ width: `${p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass col-span-3 rounded-[24px] p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Bookings today</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-platinum">28</div>
          <div className="mt-1 text-[11px] text-muted-foreground">4 walk-ins · 24 booked</div>
        </div>
        <div className="glass col-span-3 rounded-[24px] p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg ticket</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-platinum">£64</div>
          <div className="mt-1 text-[11px] text-[hsl(var(--success))]">+£6 vs avg</div>
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
    </div>
  );
};

export default Admin;
