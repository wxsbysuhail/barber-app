import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Clock, Bell, ArrowUpRight, Plus, Calendar, Scissors, 
  Check, Trash2, Play, X, Zap, Target, Users, Sparkles, Activity, Search, 
  Filter, Shield, Radio, ChevronRight, Star
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useAppointments, type Appointment } from "@/lib/store";
import { barbers, type Barber, type Service } from "@/lib/data";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { toast } from "sonner";
import { useIntelligence } from "@/lib/intelligence";
import { useUI } from "@/lib/ui-store";

const revenueData = [
  { d: "Mon", v: 820 }, { d: "Tue", v: 940 }, { d: "Wed", v: 1120 },
  { d: "Thu", v: 980 }, { d: "Fri", v: 1480 }, { d: "Sat", v: 1820 }, { d: "Sun", v: 1340 },
];

const TelemetryRing = ({ value, label, size = 160, strokeWidth = 8, active = false }: { 
  value: number; label?: string; size?: number; strokeWidth?: number; active?: boolean 
}) => {
  const r = (size / 2) - (strokeWidth / 2);
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          stroke={active ? "hsl(var(--primary))" : "rgba(255,255,255,0.6)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${dash} ${c}` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={cn(active && "shadow-[0_0_15px_rgba(245,158,11,0.5)]")}
        />
      </svg>
      <div className="absolute inset-x-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-3xl font-black tracking-tighter text-white italic">{value}%</span>
        {label && <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/35">{label}</span>}
      </div>
    </div>
  );
};

const COMMAND_TABS = [
  { id: "briefing", label: "Overview" },
  { id: "command", label: "Schedule" },
  { id: "artisans", label: "Our Team" },
  { id: "services", label: "Services" }
] as const;

type CommandTabType = typeof COMMAND_TABS[number]["id"];

const Admin = () => {
  const [activeTab, setActiveTab] = useState<CommandTabType>("briefing");
  const appointments = useAppointments((s) => s.appointments);
  const history = useAppointments((s) => s.history);
  const completeAction = useAppointments((s) => s.complete);
  
  const acceptAction = useAppointments((s) => s.accept);
  const declineAction = useAppointments((s) => s.decline);
  const clientNotes = useAppointments((s) => s.clientNotes);
  const addNoteAction = useAppointments((s) => s.addNote);
  const deleteNoteAction = useAppointments((s) => s.deleteNote);
  const servicesList = useAppointments((s) => s.services);
  const addServiceAction = useAppointments((s) => s.addService);
  const updateServiceAction = useAppointments((s) => s.updateService);
  const deleteServiceAction = useAppointments((s) => s.deleteService);

  const [selectedArtisan, setSelectedArtisan] = useState<Barber | null>(null);
  const [selectedClientNotesName, setSelectedClientNotesName] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>("all");
  
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: "", duration: 45, price: 1200 });
  
  const [artisanStates, setArtisanStates] = useState<Record<string, "Ready" | "Break" | "Offline">>({
    "alex": "Ready",
    "marcus": "Ready",
    "ezra": "Break"
  });

  const toggleArtisanState = (id: string) => {
    haptics.medium();
    const currentState = artisanStates[id] || "Ready";
    const nextState = currentState === "Ready" ? "Break" : currentState === "Break" ? "Offline" : "Ready";
    setArtisanStates(prev => ({
        ...prev,
        [id]: nextState
    }));
    toast.info(`Status updated to ${nextState}`);
  };

  const handleTabChange = (tab: CommandTabType) => {
    haptics.light();
    setActiveTab(tab);
  };

  const sorted = useMemo(() => [...appointments].sort((a, b) => a.time.localeCompare(b.time)), [appointments]);
  
  const pendingAppointments = useMemo(() => appointments.filter(a => a.status === "pending"), [appointments]);
  const activeAndFutureAppointments = useMemo(() => appointments.filter(a => a.status !== "pending"), [appointments]);
  
  const todayRevenue = history.reduce((sum, a) => sum + a.price + (a.tip ?? 0), 0) + 18500;

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useIntelligence();
  const { setIntelligenceOpen } = useUI();

  const filteredAppointments = useMemo(() => {
    const act = activeAndFutureAppointments.sort((a, b) => a.time.localeCompare(b.time));
    return selectedBarberFilter === "all" ? act : act.filter(a => a.barber.id === selectedBarberFilter);
  }, [activeAndFutureAppointments, selectedBarberFilter]);

  return (
    <div className="min-h-screen bg-obsidian text-white relative overflow-x-hidden pb-52 lg:pb-16">
      {/* ── Ambient Background Mesh Glows ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/4 h-[550px] w-[550px] rounded-full bg-amber-500/[0.015] blur-[150px]" />
        <div className="absolute bottom-10 right-10 h-[450px] w-[450px] rounded-full bg-white/[0.01] blur-[130px]" />
      </div>

      {/* Studio Header HUD */}
      <header className="sticky top-0 z-[100] border-b border-white/[0.05] bg-obsidian/75 backdrop-blur-xl px-5 pt-[calc(2.25rem+env(safe-area-inset-top))] pb-5 flex items-center justify-between lg:px-8 lg:py-8">
        <div className="flex items-center gap-4">
           <div className="relative group cursor-pointer" onClick={() => haptics.medium()}>
              {/* Tactical Shield Hub */}
              <div className="h-10 w-10 lg:h-14 lg:w-14 rounded-2xl bg-white flex items-center justify-center text-black shadow-lg relative z-10 transition-transform group-hover:scale-105 active:scale-95 duration-500">
                 <Shield className="h-5 w-5 lg:h-7 lg:w-7" strokeWidth={2.5} />
              </div>
              {/* Rotating Diagnostic Rings */}
              <div className="absolute inset-[-4px] border border-amber-500/20 rounded-[20px] animate-spin-slow opacity-40" />
              <div className="absolute inset-[-6px] border border-white/5 rounded-[22px] animate-spin-reverse-slow opacity-15" />
           </div>
           
           <div>
              <div className="text-[8px] font-black tracking-[0.4em] text-amber-500 uppercase flex items-center gap-1.5">
                 <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                  Live Updates
              </div>
              <h1 className="text-sm font-bold tracking-tight text-white/95 mt-0.5">
                 Studio <span className="text-white/40">Dashboard</span>
              </h1>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={() => { haptics.light(); toast.info("Broadcasting status updates..."); }} 
             className="press h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/70 hover:bg-white/[0.07] transition-all"
           >
              <Radio className="h-4 w-4" />
           </button>
           <button 
             onClick={() => { haptics.light(); toast.info("Search active."); }} 
             className="press h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/70 hover:bg-white/[0.07] transition-all"
           >
              <Search className="h-4 w-4" />
           </button>
           <button 
             onClick={() => {
               haptics.medium();
               setServiceForm({ name: "", duration: 45, price: 1200 });
               setIsAddServiceOpen(true);
             }} 
             className="press h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/70 hover:bg-white/[0.07] transition-all"
           >
              <Plus className="h-4 w-4" />
           </button>
           
           <button 
             onClick={() => { haptics.medium(); setIntelligenceOpen(true); }}
             className="press h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/70 hover:bg-white/[0.07] transition-all relative"
           >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-amber-500 border border-obsidian z-20" />
              )}
           </button>
        </div>
      </header>
      
      {/* Tactical Mobile Ticker */}
      <div className="lg:hidden bg-amber-500/[0.04] border-b border-amber-500/10 py-1.5 overflow-hidden flex items-center">
         <motion.div 
           animate={{ x: ["100%", "-100%"] }}
           transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
           className="whitespace-nowrap flex items-center gap-8 text-[7px] font-black uppercase tracking-[0.25em] text-amber-500"
         >
            <span>All Stations Online</span>
            <div className="h-1 w-1 rounded-full bg-amber-500/40" />
            <span>Busy Rate: High</span>
            <div className="h-1 w-1 rounded-full bg-amber-500/40" />
            <span>Next session in 14m</span>
         </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* Command Nav — Shared LayoutId Pill switcher */}
        <div className="mb-10 flex justify-center sticky top-24 z-50">
           <div className="relative border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-1 rounded-full flex items-center w-full max-w-md">
             {COMMAND_TABS.map((t) => {
               const isSelected = activeTab === t.id;
               return (
                 <button
                   key={t.id}
                   onClick={() => handleTabChange(t.id)}
                   className="relative flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest text-center cursor-pointer transition-colors"
                 >
                   {isSelected && (
                     <motion.div
                       layoutId="adminTabPill"
                       className="absolute inset-0 bg-white rounded-full z-0"
                       transition={{ type: "spring", stiffness: 380, damping: 30 }}
                     />
                   )}
                   <span className={cn("relative z-10 block", isSelected ? "text-black" : "text-white/40 hover:text-white/60")}>
                     {t.label}
                   </span>
                 </button>
               );
             })}
           </div>
        </div>

        <AnimatePresence mode="wait">
           {activeTab === "briefing" && (
             <motion.div 
               key="briefing"
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               transition={{ duration: 0.3 }}
               className="space-y-10"
             >
                  {/* Strategic Intelligence Header Bento Cell */}
                  <div className="border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl p-8 sm:p-10 rounded-[32px] flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                     
                     <div className="space-y-4 max-w-xl text-center lg:text-left">
                        <div className="text-[8px] font-black tracking-[0.35em] text-white/30 uppercase">
                          Daily Studio Summary
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-3">
                          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                            Today's Bookings
                          </h2>
                          <span className="px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[8px] font-black uppercase tracking-widest text-amber-500 w-fit mx-auto sm:mx-0">
                            High Demand
                          </span>
                        </div>
                        <p className="text-white/45 text-xs leading-relaxed">
                          Client traffic is high right now. We recommend opening up more slots for Haircuts today.
                        </p>
                        
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                           <div className="glass px-3.5 py-2 rounded-xl flex items-center gap-2 border border-emerald-500/10">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Fully Booked Rate</span>
                           </div>
                           <div className="glass px-3.5 py-2 rounded-xl flex items-center gap-2 border border-amber-500/10">
                              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Demand Surge</span>
                           </div>
                        </div>
                     </div>

                     <div className="relative">
                        <TelemetryRing value={72} label="Busy Rate" active />
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500/10 animate-ping opacity-25 scale-110" />
                     </div>

                  </div>

                  {/* Pending Approvals Section */}
                  {pendingAppointments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Pending Approvals ({pendingAppointments.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingAppointments.map((a) => (
                          <motion.div 
                            key={a.id} 
                            layoutId={`pending-${a.id}`}
                            className="border border-white/[0.06] bg-white/[0.015] backdrop-blur-xl p-5 rounded-[24px] flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <span className="text-[7.5px] font-mono text-white/20 uppercase tracking-widest block mb-0.5">{a.time} Request</span>
                              <h4 className="text-base font-bold text-white truncate">{a.client}</h4>
                              <span className="text-[10px] text-amber-500 font-semibold truncate block mt-0.5">
                                {a.service.name} · {a.barber.name.split(' ')[0]}
                              </span>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  haptics.medium();
                                  acceptAction(a.id);
                                  toast.success(`Approved booking for ${a.client}`);
                                }}
                                className="press h-9 px-4 rounded-xl bg-white text-black text-[9px] font-bold uppercase tracking-wider hover:bg-white/95"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => {
                                  haptics.light();
                                  declineAction(a.id);
                                  toast.info(`Declined booking for ${a.client}`);
                                }}
                                className="press h-9 px-4 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 text-[9px] font-bold uppercase tracking-wider hover:bg-white/[0.08]"
                              >
                                Decline
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Intelligence Feeds */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     
                     {/* Earnings Summary Chart */}
                     <div className="border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl p-6 rounded-[28px] space-y-6 md:col-span-2">
                        <div className="flex justify-between items-start">
                           <div>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">Earnings Summary</span>
                              <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                               Rs {todayRevenue.toLocaleString()}
                              </div>
                           </div>
                           <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        
                        {/* High-end Area Chart */}
                        <div className="h-[120px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                             <defs>
                               <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                                 <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <Area 
                               type="monotone" 
                               dataKey="v" 
                               stroke="hsl(var(--primary))" 
                               strokeWidth={2} 
                               fillOpacity={1} 
                               fill="url(#revenueGlow)" 
                             />
                             <XAxis dataKey="d" stroke="rgba(255,255,255,0.15)" fontSize={8} tickLine={false} axisLine={false} />
                           </AreaChart>
                          </ResponsiveContainer>
                        </div>
                     </div>

                     {/* Strategic Advice Card */}
                     <div className="border border-white/[0.06] bg-amber-500/[0.01] backdrop-blur-xl p-6 rounded-[28px] flex flex-col justify-between h-full min-h-[220px]">
                        <div className="flex justify-between items-start">
                           <div>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500">Smart Suggestion</span>
                              <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">Set a Special Offer</h3>
                           </div>
                           <Zap className="h-5 w-5 text-amber-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-white/45 leading-relaxed font-mono">
                          Appointments look quiet between 4:00 PM and 5:30 PM today. Offer a 15% off discount to walk-in clients.
                        </p>
                     </div>

                  </div>
             </motion.div>
           )}

           {activeTab === "command" && (
             <motion.div 
               key="command"
               initial={{ opacity: 0, x: 15 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -15 }}
               transition={{ duration: 0.3 }}
               className="space-y-6 pb-12"
             >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.05] pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                      Today's Schedule
                    </h2>
                    
                    {/* Barber schedule filtering pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                      <button
                        onClick={() => { haptics.light(); setSelectedBarberFilter("all"); }}
                        className={cn(
                          "press px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-wider whitespace-nowrap transition-colors",
                          selectedBarberFilter === "all" ? "bg-white text-black border-white" : "bg-white/[0.03] border-white/10 text-white/40"
                        )}
                      >
                        All Team
                      </button>
                      {barbers.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => { haptics.light(); setSelectedBarberFilter(b.id); }}
                          className={cn(
                            "press px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-wider whitespace-nowrap transition-colors",
                            selectedBarberFilter === b.id ? "bg-white text-black border-white" : "bg-white/[0.03] border-white/10 text-white/40"
                          )}
                        >
                          {b.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                </div>

                <div className="space-y-2">
                   {filteredAppointments.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => { haptics.light(); setSelectedClientNotesName(t.client); }}
                        className={cn(
                          "w-full border p-5 rounded-[24px] flex items-center justify-between text-left transition-all duration-300 cursor-pointer hover:border-white/10 hover:bg-white/[0.03]",
                          t.status === "now" 
                            ? "border-amber-500/30 bg-amber-500/[0.03] shadow-[0_0_24px_-10px_rgba(245,158,11,0.25)]" 
                            : "border-white/[0.06] bg-white/[0.02]"
                        )}
                      >
                         <div className="flex items-center gap-5 min-w-0">
                            <div className="relative shrink-0">
                               <img src={t.barber.image} className="h-14 w-14 rounded-[18px] object-cover border border-white/[0.08]" alt="" />
                               {t.status === "now" && (
                                 <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center text-black shadow-lg">
                                   <Radio className="h-3.5 w-3.5 animate-pulse" />
                                 </div>
                                )}
                            </div>
                            <div className="min-w-0">
                               <span className="text-[7.5px] font-mono text-white/25 uppercase tracking-widest block mb-0.5">
                                 {t.time} Session Time
                               </span>
                               <h3 className="text-lg font-bold tracking-tight text-white truncate leading-snug">
                                 {t.client}
                               </h3>
                               <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">
                                 {t.service.name} · {t.barber.name.split(' ')[0]}
                               </span>
                            </div>
                         </div>

                         <div className="flex items-center gap-6">
                            <div className="text-right shrink-0">
                               <span className="text-lg font-bold text-white">Rs {t.price}</span>
                            </div>
                            
                            {t.status === "now" ? (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  haptics.success(); 
                                  completeAction(t.id); 
                                  toast.success("Session marked complete."); 
                                }}
                                className="press px-4 h-12 rounded-xl bg-white text-black text-[9px] font-bold uppercase tracking-wider hover:bg-white/95 shrink-0"
                              >
                                Complete
                              </button>
                            ) : (
                              <span className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.02] text-[8px] font-black uppercase tracking-widest text-white/40 shrink-0">
                                Upcoming
                              </span>
                            )}
                         </div>
                      </div>
                   ))}
                   {filteredAppointments.length === 0 && (
                     <div className="py-24 text-center space-y-4">
                        <Activity className="h-10 w-10 mx-auto text-white/10" />
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/20">All filtered schedules clear.</h4>
                     </div>
                   )}
                </div>
             </motion.div>
           )}

           {activeTab === "artisans" && (
                <motion.div 
                  key="artisans"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12"
                >
                  {barbers.map((a, i) => (
                      <div key={a.id} className="border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl p-8 rounded-[32px] space-y-6 group relative overflow-hidden">
                         
                         {/* Status badge trigger */}
                         <div className="absolute top-6 right-6">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleArtisanState(a.id); }}
                              className={cn(
                                "press h-10 px-3.5 rounded-full border flex items-center gap-2 transition-all",
                                artisanStates[a.id] === "Ready" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                artisanStates[a.id] === "Break" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                "bg-white/5 border-white/5 text-white/40"
                              )}
                            >
                               <span className={cn(
                                 "h-1.5 w-1.5 rounded-full bg-current",
                                 artisanStates[a.id] === "Ready" && "animate-pulse"
                               )} />
                               <span className="text-[8.5px] font-bold uppercase tracking-wider">{artisanStates[a.id] || "Ready"}</span>
                            </button>
                         </div>

                         <div className="flex items-center gap-5 relative z-10">
                            <div className="relative shrink-0">
                               <div className="h-20 w-20 rounded-[22px] overflow-hidden border border-white/[0.08] group-hover:border-amber-500/40 transition-colors">
                                  <img src={a.image} className="h-full w-full object-cover transition-all duration-500" alt="" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-obsidian border border-white/10 flex items-center justify-center shadow-md">
                                   <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                               <h3 className="text-xl font-bold tracking-tight text-white">{a.name}</h3>
                               <div className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30">{a.title} · Rank #0{i+1}</div>
                               <div className="flex gap-1.5 pt-2">
                                  <span className="glass px-2.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider border border-white/5 text-white/50">{a.signature}</span>
                                </div>
                            </div>
                         </div>

                         {/* Performance metrics slots */}
                         <div className="grid grid-cols-3 gap-3 relative z-10 pt-2">
                            <div className="border border-white/[0.04] bg-white/[0.01] p-4 rounded-[20px] space-y-0.5">
                               <div className="text-[7px] font-bold uppercase tracking-widest text-white/20">Client Retention</div>
                               <div className="text-base font-bold text-white">{94 + i}%</div>
                            </div>
                            <div className="border border-white/[0.04] bg-white/[0.01] p-4 rounded-[20px] space-y-0.5">
                               <div className="text-[7px] font-bold uppercase tracking-widest text-white/20">Top Service</div>
                               <div className="text-xs font-bold text-amber-500 truncate">{a.signature}</div>
                            </div>
                            <div className="border border-white/[0.04] bg-white/[0.01] p-4 rounded-[20px] space-y-0.5">
                               <div className="text-[7px] font-bold uppercase tracking-widest text-white/20">Return Rate</div>
                               <div className="text-base font-bold text-white">{98}%</div>
                            </div>
                         </div>

                         <button 
                           onClick={() => { haptics.light(); setSelectedArtisan(a); }}
                           className="press w-full h-14 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all"
                         >
                            View Profile Details
                            <ArrowUpRight className="h-3.5 w-3.5" />
                         </button>
                      </div>
                  ))}
               </motion.div>
           )}

           {activeTab === "services" && (
                <motion.div 
                  key="services"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 pb-12"
                >
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Services Catalog</h2>
                    <button
                      onClick={() => {
                        haptics.medium();
                        setServiceForm({ name: "", duration: 45, price: 1200 });
                        setIsAddServiceOpen(true);
                      }}
                      className="press h-10 px-4 rounded-xl bg-white text-black text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-white/95 shadow-md"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Service
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicesList.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          haptics.light();
                          setEditingServiceId(s.id);
                          setServiceForm({ name: s.name, duration: s.duration, price: s.price });
                        }}
                        className="press-elev border border-white/[0.06] bg-white/[0.02] p-6 rounded-[28px] flex items-center justify-between cursor-pointer group hover:border-amber-500/20 hover:bg-white/[0.03] transition-all"
                      >
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{s.name}</h3>
                          <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mt-1">
                            {s.duration} Min · Rs {s.price}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-amber-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                </motion.div>
           )}
        </AnimatePresence>

        {/* Tactical Ledger Modal Overlay */}
        <AnimatePresence>
           {selectedArtisan && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
              >
                 <motion.div 
                   initial={{ scale: 0.95, y: 15 }}
                   animate={{ scale: 1, y: 0 }}
                   exit={{ scale: 0.95, y: 15 }}
                   transition={{ type: "spring", damping: 25, stiffness: 220 }}
                   className="w-full max-w-lg border border-white/[0.08] bg-obsidian/95 backdrop-blur-2xl rounded-[36px] p-8 sm:p-10 relative overflow-hidden"
                 >
                    <div className="absolute top-6 right-6">
                       <button onClick={() => setSelectedArtisan(null)} className="press h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white">
                          <X className="h-4 w-4" />
                       </button>
                    </div>

                    <div className="space-y-8">
                       <div className="flex items-center gap-5 pt-4">
                          <div className="h-24 w-24 rounded-[24px] bg-white/5 overflow-hidden border border-white/[0.08] shrink-0">
                             <img src={selectedArtisan.image} className="h-full w-full object-cover" alt="" />
                          </div>
                          <div className="space-y-1">
                             <span className="text-[7.5px] font-black tracking-[0.3em] text-amber-500 uppercase">Stylist Profile</span>
                             <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">{selectedArtisan.name}</h2>
                             <div className="flex items-center gap-1.5 mt-0.5 text-white/40">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Top Professional Stylist</span>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="border border-white/[0.06] bg-white/[0.02] p-5 rounded-[22px] space-y-2">
                             <span className="text-[8px] font-bold uppercase tracking-widest text-white/35 block">Specialty Style</span>
                             <span className="text-lg font-bold text-white">{selectedArtisan.signature}</span>
                          </div>
                          <div className="border border-white/[0.06] bg-white/[0.02] p-5 rounded-[22px] space-y-2">
                             <span className="text-[8px] font-bold uppercase tracking-widest text-white/35 block">Weekly Earnings</span>
                             <span className="text-lg font-bold text-amber-500">Rs 28,500 <span className="text-[9px] text-white/20">/ Wk</span></span>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block">Recent Client Sessions</span>
                          <div className="space-y-2">
                             {[
                                { s: "Skin Fade", c: "Felix Dupont", p: "Rs 1,200", t: "09:45" },
                                { s: "Beard Sculpt", c: "Arthur Quinn", p: "Rs 800", t: "Yesterday" },
                             ].map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                                   <div className="flex items-center gap-3">
                                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                      <div>
                                         <div className="text-xs font-semibold text-white">{d.s}</div>
                                         <div className="text-[7.5px] font-bold uppercase tracking-widest text-white/40 mt-0.5">{d.c}</div>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <div className="text-xs font-bold text-white">{d.p}</div>
                                      <div className="text-[7px] font-mono text-white/20 uppercase tracking-widest mt-0.5">{d.t}</div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>

                       <button 
                         onClick={() => { haptics.success(); setSelectedArtisan(null); toast.success("Updates saved successfully."); }}
                         className="press w-full h-14 rounded-2xl bg-white text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center"
                       >
                          Save Updates
                       </button>
                    </div>
                 </motion.div>
              </motion.div>
           )}
        </AnimatePresence>

        {/* Client Private Notes CRM Bottom-up Sheet */}
        <AnimatePresence>
          {selectedClientNotesName && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedClientNotesName(null)}
                className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-sm pointer-events-auto"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-[200] max-h-[85vh] rounded-t-[32px] border-t border-white/10 bg-obsidian p-6 pb-12 shadow-2xl flex flex-col gap-6 overflow-y-auto pointer-events-auto"
              >
                <div className="mx-auto h-1 w-12 rounded-full bg-white/20" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">{selectedClientNotesName}</h3>
                    <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">Private Artisan CRM</p>
                  </div>
                  <button 
                    onClick={() => setSelectedClientNotesName(null)}
                    className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Note creation auto-save input */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block">Add Private Note</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g., Prefers dry haircut styling, sensitive skin..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50 text-white"
                      />
                      <button
                        onClick={() => {
                          if (!newNoteText.trim()) return;
                          addNoteAction(selectedClientNotesName, newNoteText.trim());
                          setNewNoteText("");
                          toast.success("CRM notes saved and updated");
                        }}
                        className="press px-4 rounded-xl bg-white text-black text-[9px] font-bold uppercase tracking-wider flex items-center justify-center"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Historical CRM Notes List */}
                  <div className="space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block">Artisan Note History</span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {(clientNotes[selectedClientNotesName] || []).length === 0 ? (
                        <p className="text-[10px] text-white/25 italic">No private notes recorded for this client.</p>
                      ) : (
                        (clientNotes[selectedClientNotesName] || []).map((n) => (
                          <div key={n.id} className="p-3.5 bg-white/[0.015] border border-white/[0.04] rounded-2xl flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-white/80 leading-relaxed">{n.text}</p>
                              <span className="text-[7px] text-white/20 uppercase tracking-wider block mt-1.5">
                                {new Date(n.timestamp).toLocaleDateString()} · {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                haptics.light();
                                deleteNoteAction(selectedClientNotesName, n.id);
                                toast.info("Note deleted");
                              }}
                              className="text-white/20 hover:text-red-400 transition-colors p-1 shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Add Service Catalog Modal */}
        <AnimatePresence>
          {isAddServiceOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-md border border-white/[0.08] bg-obsidian/95 rounded-[32px] p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">New Catalog Service</h3>
                  <button 
                    onClick={() => setIsAddServiceOpen(false)}
                    className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-white/35">Service Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Signature Cut"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-white/35">Duration (Min)</label>
                      <input
                        type="number"
                        placeholder="45"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-white/35">Price (Rs)</label>
                      <input
                        type="number"
                        placeholder="1200"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsAddServiceOpen(false)}
                    className="flex-1 h-12 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 text-xs font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!serviceForm.name) return toast.error("Service name required");
                      addServiceAction({
                        name: serviceForm.name,
                        duration: serviceForm.duration,
                        price: serviceForm.price,
                      });
                      setIsAddServiceOpen(false);
                      toast.success("Service added to catalog");
                    }}
                    className="flex-1 h-12 rounded-xl bg-white text-black text-xs font-semibold uppercase tracking-wider"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit / Modify Service Catalog Modal */}
        <AnimatePresence>
          {editingServiceId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-md border border-white/[0.08] bg-obsidian/95 rounded-[32px] p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Modify Service</h3>
                  <button 
                    onClick={() => setEditingServiceId(null)}
                    className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-white/35">Service Title</label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-white/35">Duration (Min)</label>
                      <input
                        type="number"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-white/35">Price (Rs)</label>
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingServiceId(null)}
                      className="flex-1 h-12 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 text-xs font-semibold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!serviceForm.name) return toast.error("Service name required");
                        updateServiceAction(editingServiceId, {
                          name: serviceForm.name,
                          duration: serviceForm.duration,
                          price: serviceForm.price,
                        });
                        setEditingServiceId(null);
                        toast.success("Service updated in catalog");
                      }}
                      className="flex-1 h-12 rounded-xl bg-white text-black text-xs font-semibold uppercase tracking-wider"
                    >
                      Save Changes
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      deleteServiceAction(editingServiceId);
                      setEditingServiceId(null);
                      toast.success("Service deleted from catalog");
                    }}
                    className="w-full h-12 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Service
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
