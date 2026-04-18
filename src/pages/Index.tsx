import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Scissors, Clock, MapPin } from "lucide-react";
import heroShop from "@/assets/hero-shop.jpg";
import { services, barbers, timeSlots } from "@/lib/data";
import { useAppointments } from "@/lib/store";

const Index = () => {
  const next = barbers[0];
  const appointments = useAppointments((s) => s.appointments);
  const occupied = new Set(appointments.map((a) => a.time));
  const openSlots = timeSlots.filter((t) => !occupied.has(t)).length;

  return (
    <div className="mx-auto max-w-md px-5 pb-32 pt-6 animate-float-up">
      {/* Status / brand */}
      <div className="mb-6 flex items-center justify-between">
        <Logo />
        <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
          Open · 18:30
        </div>
      </div>

      {/* Hero */}
      <section className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Good evening, James</p>
        <h1 className="mt-2 text-[42px] font-semibold leading-[1.02] tracking-tight">
          The art of the <span className="italic font-light text-platinum">cut.</span>
        </h1>
      </section>

      {/* Next appointment — glowing hero card */}
      <Link to="/profile" className="press group block">
        <div className="relative overflow-hidden rounded-[28px] ring-glow animate-pulse-glow">
          <img src={heroShop} alt="Crown studio interior" className="h-56 w-full object-cover" width={1536} height={1024} />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="glass rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest">Next appointment</span>
              <ArrowUpRight className="h-5 w-5 text-platinum opacity-0 transition group-hover:opacity-100" />
            </div>
            <div>
              <div className="text-xs text-platinum/70">Tomorrow · 14:15</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">Signature Cut</div>
              <div className="mt-1 text-sm text-muted-foreground">with {next.name}</div>
            </div>
          </div>
        </div>
      </Link>

      {/* Bento grid */}
      <section className="mt-5 grid grid-cols-2 gap-3">
        <Link to="/book" className="press group glass-card col-span-2 rounded-[24px] p-5">
          <motion.div layoutId="book-hero" className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Quick action</div>
              <div className="mt-1 text-xl font-semibold tracking-tight">Book a chair</div>
              <div className="mt-1 text-xs text-muted-foreground">{openSlots} slots open today</div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground transition group-hover:rotate-6">
              <Scissors className="h-5 w-5" strokeWidth={1.5} />
            </div>
          </motion.div>
        </Link>

        <Link to="/style" className="press glass rounded-[24px] p-4">
          <Sparkles className="h-5 w-5 text-platinum" strokeWidth={1.5} />
          <div className="mt-6 text-sm font-semibold">AI Style Preview</div>
          <div className="text-[11px] text-muted-foreground">Try before you cut</div>
        </Link>

        <div className="glass rounded-[24px] p-4">
          <Clock className="h-5 w-5 text-platinum" strokeWidth={1.5} />
          <div className="mt-6 text-sm font-semibold">23 min</div>
          <div className="text-[11px] text-muted-foreground">Avg wait now</div>
        </div>

        <div className="glass col-span-2 flex items-center justify-between rounded-[24px] p-5">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Studio</div>
            <div className="mt-1 text-base font-semibold">Crown · Soho</div>
            <div className="text-xs text-muted-foreground">14 Greek Street, London</div>
          </div>
          <MapPin className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </section>

      {/* Services preview */}
      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Services</h2>
          <Link to="/book" className="text-xs text-muted-foreground hover:text-foreground">See all</Link>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
          {services.map((s) => (
            <Link to="/book" key={s.id} className="press glass min-w-[180px] rounded-[22px] p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.duration} min</div>
              <div className="mt-2 text-base font-semibold tracking-tight">{s.name}</div>
              <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{s.description}</div>
              <div className="mt-4 text-sm font-medium text-platinum">£{s.price}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
