import { Settings, ChevronRight, Calendar, Star, CreditCard, Bell, Check } from "lucide-react";
import { barbers } from "@/lib/data";
import { useAppointments } from "@/lib/store";

const Profile = () => {
  const next = barbers[0];
  const history = useAppointments((s) => s.history);
  const upcoming = useAppointments((s) => s.appointments.filter((a) => a.status === "upcoming"));
  const totalSpent = history.reduce((sum, a) => sum + a.price + (a.tip ?? 0), 0) + 1620;

  return (
    <div className="mx-auto max-w-md px-5 pb-32 pt-6 animate-float-up">
      <header className="mb-6 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Profile</div>
        <button className="press glass grid h-10 w-10 place-items-center rounded-full">
          <Settings className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </header>

      <div className="mb-7 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-platinum text-xl font-semibold text-obsidian">
          JC
        </div>
        <div>
          <div className="text-xl font-semibold tracking-tight">James Carter</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-platinum text-platinum" />
            Crown Member · Since 2023
          </div>
        </div>
      </div>

      {/* Next appointment glowing card */}
      <div className="relative overflow-hidden rounded-[28px] glass-strong p-5 ring-glow animate-pulse-glow">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Upcoming</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">Signature Cut</div>
            <div className="mt-1 text-sm text-muted-foreground">{next.name} · Tomorrow 14:15</div>
          </div>
          <img src={next.image} alt={next.name} className="h-14 w-14 rounded-2xl object-cover" loading="lazy" />
        </div>
        <div className="mt-5 flex gap-2">
          <button className="press flex-1 rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground">
            View details
          </button>
          <button className="press glass rounded-full px-4 py-2.5 text-xs font-medium">Reschedule</button>
        </div>
      </div>

      {/* Stats bento */}
      <section className="mt-5 grid grid-cols-3 gap-3">
        {[
          { v: String(history.length + 24), l: "Visits" },
          { v: `£${(totalSpent / 1000).toFixed(1)}k`, l: "Spent" },
          { v: "4.9", l: "Rating" },
        ].map((s) => (
          <div key={s.l} className="glass-card rounded-[20px] p-4 text-center">
            <div className="text-xl font-semibold tracking-tight text-platinum">{s.v}</div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </section>

      {/* Booking history */}
      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-base font-semibold tracking-tight">Booking history</h2>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{history.length} recent</span>
        </div>
        <div className="glass-card overflow-hidden rounded-[24px]">
          {history.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No completed visits yet. Your finished cuts will appear here.
            </div>
          ) : (
            history.map((h, idx) => (
              <div
                key={h.id}
                className={`flex items-center gap-4 p-4 ${idx < history.length - 1 ? "border-b border-border/60" : ""}`}
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]">
                  <Check className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium tracking-tight">{h.service.name}</div>
                  <div className="text-[11px] text-muted-foreground">{h.barber.name} · {h.time}</div>
                </div>
                <div className="text-sm font-semibold text-platinum">£{h.price + (h.tip ?? 0)}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Menu */}
      <section className="mt-5 glass-card overflow-hidden rounded-[24px]">
        {[
          { i: Calendar, l: `Upcoming (${upcoming.length})` },
          { i: CreditCard, l: "Payment methods" },
          { i: Bell, l: "Notifications" },
        ].map(({ i: Icon, l }, idx, arr) => (
          <button
            key={l}
            className={`press flex w-full items-center justify-between p-5 text-left ${
              idx < arr.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium">{l}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </section>
    </div>
  );
};

export default Profile;
