import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Settings, ChevronRight, Calendar, Star, CreditCard, Bell, Check, Crown, 
  ShieldCheck, History, Wallet, User as UserIcon, LogOut, ArrowUpRight, 
  Diamond, RotateCw, Zap, Shield, Sparkles, Smartphone, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { barbers } from "@/lib/data";
import { useAppointments } from "@/lib/store";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { toast } from "sonner";

const TABS = [
  { id: "identity", label: "My Profile" },
  { id: "chronicle", label: "History" },
  { id: "vault", label: "Payments" }
] as const;

type TabType = typeof TABS[number]["id"];

const Profile = () => {
  const history = useAppointments((s) => s.history);
  const appointments = useAppointments((s) => s.appointments);
  const upcoming = appointments.filter((a) => a.status === "upcoming");

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [isVaultScanning, setIsVaultScanning] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
      if (tab === "vault") {
        setIsVaultScanning(true);
        setTimeout(() => setIsVaultScanning(false), 1400);
      }
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    haptics.light();
    setActiveTab(tab);
    if (tab === "vault") {
      setIsVaultScanning(true);
      setTimeout(() => setIsVaultScanning(false), 1400);
    }
  };

  const totalSpent = history.reduce((sum, a) => sum + a.price + (a.tip ?? 0), 0) + 1620;

  // 3D Card Hover + Specular Glare calculation
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setRotate({ x: x * 12, y: -y * 12 });

    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    setGlare({ x: glareX, y: glareY });
  };

  return (
    <div className="min-h-screen bg-obsidian text-white relative overflow-x-hidden pb-52">
      {/* ── Ambient Background Mesh Glows ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-amber-500/[0.015] blur-[150px]" />
        <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-white/[0.01] blur-[130px]" />
      </div>

      {/* ── Native Minimalist Header ── */}
      <header className="sticky top-0 z-[100] border-b border-white/[0.05] bg-obsidian/75 backdrop-blur-xl px-5 pt-[calc(2.25rem+env(safe-area-inset-top))] pb-5 flex items-center justify-between lg:px-8 lg:py-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Account</h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { haptics.light(); toast.success("Notifications: 0 new messages."); }}
            className="press h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/70 hover:bg-white/[0.07] transition-all"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button 
            onClick={() => { haptics.light(); toast.info("Settings panel is secure."); }}
            className="press h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/70 hover:bg-white/[0.07] transition-all"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* Profile Tabs — Dynamic Shared LayoutId control */}
        <div className="mb-10 flex justify-center">
          <div className="relative border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-1 rounded-full flex items-center w-full max-w-sm">
            {TABS.map((t) => {
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className="relative flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest text-center cursor-pointer transition-colors"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="profileTabPill"
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

        {/* Tab Canvas panels */}
        <AnimatePresence mode="wait">
          {activeTab === "identity" && (
            <motion.div 
              key="identity"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12"
            >
              {/* LEFT COLUMN: Holographic Member Pass & Quick Stats */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 3D Holographic Identity Card */}
                <motion.div 
                  ref={cardRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => { setRotate({ x: 0, y: 0 }); setIsHovered(false); }}
                  onMouseEnter={() => setIsHovered(true)}
                  animate={{ rotateX: rotate.x, rotateY: rotate.y }}
                  className="group relative aspect-[1.62/1] w-full overflow-hidden rounded-[36px] border border-white/[0.1] bg-white/[0.02] backdrop-blur-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between"
                  style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                >
                  {/* Base Holographic Reflection layer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-white/5 opacity-50" />
                  
                  {/* specular cursor tracking shine overlay */}
                  <div 
                    className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
                    }}
                  />

                  {/* Specular scanline reflections */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />

                  {/* Top content */}
                  <div className="relative z-10 flex justify-between items-start" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-white text-black text-2xl font-black flex items-center justify-center shadow-lg">
                        JC
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white/95">James Carter</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Diamond className="h-3 w-3 text-amber-500" />
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">Obsidian Member</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <ShieldCheck className="h-7 w-7 text-white/20 group-hover:text-amber-500/40 transition-colors" />
                      <span className="absolute -inset-1 rounded-full border border-amber-500/20 animate-ping opacity-25" />
                    </div>
                  </div>

                  {/* Bottom content */}
                  <div className="relative z-10 flex justify-between items-end" style={{ transform: "translateZ(20px)" }}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/10 bg-emerald-500/[0.04]">
                        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[7.5px] font-black uppercase tracking-widest text-emerald-500">Verified Account</span>
                      </div>
                      <div>
                        <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest block">Member ID</span>
                        <span className="text-[10px] font-mono text-white/50 tracking-wider">BC-9428-A1-JC</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Stats Bento Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: "Past Sessions", v: history.length + 24, i: History },
                    { l: "Available Credits", v: "Rs 1,240", i: Wallet },
                    { l: "Status Level", v: "Elite", i: Star }
                  ].map((s, idx) => (
                    <motion.div
                      key={s.l}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl rounded-[24px] p-4 text-center space-y-3 group hover:border-white/[0.12] transition-colors"
                    >
                      <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-white/20 group-hover:text-amber-500 transition-colors">
                        <s.i className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xl font-bold tracking-tight text-white">{s.v}</div>
                        <div className="text-[7.5px] font-bold uppercase tracking-widest text-white/30">{s.l}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: Digital Membership Details */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl rounded-[32px] p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black uppercase tracking-[0.35em] text-amber-500">Premium Membership</span>
                      <h3 className="text-xl font-bold tracking-tight text-white">Obsidian Member</h3>
                    </div>
                    <Crown className="h-6 w-6 text-amber-500/80" />
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed">
                    Welcome to the Obsidian circle. Your account is active, granting you unfiltered access to our top artisan barbers, custom lookbooks, and priority booking options.
                  </p>

                  <div className="pt-4 border-t border-white/[0.06] space-y-3.5">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Active Privileges</span>
                    <div className="flex items-center gap-3 text-white/70">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
                      <span className="text-xs font-semibold">Priority Booking Access</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
                      <span className="text-xs font-semibold">Instant Booking Dispatch</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
                      <span className="text-xs font-semibold">Custom Lookbook Archives</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { haptics.medium(); toast.error("Logout disabled for preview mode."); }}
                  className="press w-full h-16 rounded-[24px] border border-red-500/10 bg-red-500/[0.02] text-red-500/70 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/[0.05] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>

              </div>
            </motion.div>
          )}

          {activeTab === "chronicle" && (
            <motion.div 
              key="chronicle"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-4xl mx-auto pb-12"
            >
              <div className="flex items-end justify-between border-b border-white/[0.05] pb-4 mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Grooming History
                </h2>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                  {history.length + 24} Sessions completed
                </span>
              </div>

              <div className="space-y-12 max-w-2xl mx-auto">
                {history.length === 0 ? (
                  <div className="border border-white/[0.06] bg-white/[0.025] rounded-[32px] p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <History className="h-10 w-10 text-white/10" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                      No sessions recorded yet.
                    </span>
                  </div>
                ) : history.map((item, idx) => (
                  <div key={item.id}>
                    <div className="press-elev w-full group border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl rounded-[28px] overflow-hidden flex flex-col sm:flex-row transition-all duration-300">
                      
                      {/* Snapshot image container */}
                      <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-white/5 relative overflow-hidden shrink-0 border-b sm:border-b-0 sm:border-r border-white/[0.06]">
                        {item.snapshotUrl ? (
                          <img src={item.snapshotUrl} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Snapshot" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-105 transition-transform duration-300">
                            <History className="h-14 w-14" />
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 z-10">
                          <span className="glass px-2.5 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-widest border border-white/10">
                            Lookbook • Oct 2025
                          </span>
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-6">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[8px] font-black tracking-widest text-amber-500 uppercase block mb-1">
                              Session Details
                            </span>
                            <h3 className="text-2xl font-bold tracking-tight text-white">
                              {item.service.name}
                            </h3>
                            <span className="text-[10px] font-bold text-white/40 tracking-wider block mt-1">
                              {item.barber.name} · {item.time}
                            </span>
                          </div>
                          
                          <ArrowUpRight className="h-5 w-5 text-white/20 group-hover:text-amber-500/60 transition-colors shrink-0" />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.05] text-[8px] font-bold uppercase tracking-widest text-white/30">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Verified Complete</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-white/60">5.0 Star Rating</span>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "vault" && (
            <motion.div 
              key="vault"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-xl mx-auto space-y-6 relative pb-12"
            >
              {/* Vault Security scan screen overlay */}
              <AnimatePresence>
                {isVaultScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 rounded-[32px] border border-white/[0.08] bg-obsidian/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-5 min-h-[300px]"
                  >
                    <div className="relative">
                      <Shield className="h-16 w-16 text-amber-500 animate-pulse" />
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.3, opacity: 0.15 }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className="absolute inset-0 bg-amber-500 rounded-full blur-xl"
                      />
                      <div className="absolute inset-0 border-2 border-amber-500/30 rounded-full animate-ping" />
                    </div>
                    
                    <div className="text-center space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500 block">
                        Securing Access...
                      </span>
                      <span className="text-[7px] font-mono uppercase tracking-widest text-white/20 block italic">
                        Protecting your payment information
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title Header */}
              <div className="text-center space-y-3 mb-8">
                <div className="mx-auto h-16 w-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-amber-500 shadow-xl">
                  <Wallet className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Billing & Wallet
                </h2>
              </div>

              {/* Vault Card Lists */}
              <div className="space-y-2.5">
                {[
                  { l: "Primary Card", v: "Visa ···· 4212", i: CreditCard, s: "Verified" },
                  { l: "Auto-Top-up", v: "Enabled · Rs 1,500.00", i: RotateCw, s: "Active" },
                  { l: "Billing Statements", v: "Download Receipts", i: History, s: "148 Records" },
                  { l: "Gift Vouchers", v: "Rs 1,250.00 Remaining", i: Zap, s: "3 Credits" },
                ].map((item) => (
                  <button 
                    key={item.l}
                    onClick={() => { haptics.light(); toast.success(`${item.l} is secure.`); }}
                    className="press w-full border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-6 rounded-[24px] flex items-center justify-between text-left transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                        <item.i className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-white/25 block mb-0.5">
                          {item.l}
                        </span>
                        <span className="text-base font-bold tracking-tight text-white/90">
                          {item.v}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-amber-500 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0">
                      {item.s}
                    </span>
                  </button>
                ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Profile;
