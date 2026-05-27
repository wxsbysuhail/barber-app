import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ShieldCheck, CreditCard, Apple, Wallet, ArrowRight, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { services, barbers } from "@/lib/data";
import { useAppointments } from "@/lib/store";
import { SlideAction } from "@/components/SlideAction";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const service = state?.service ?? services[0];
  const barber = state?.barber ?? barbers[0];
  const slot = state?.slot ?? "14:15";
  const add = useAppointments((s) => s.add);

  const tip = Math.round(service.price * 0.15);
  const total = service.price + tip;

  const [confirmed, setConfirmed] = useState(false);

  const handleComplete = () => {
    setConfirmed(true);
    add({
      time: slot,
      client: "James Carter",
      service,
      barber,
      status: "upcoming",
      duration: `${service.duration}m`,
      price: service.price,
      tip,
    });
    
    // Success sequence
    haptics.success();
    toast.success("Transaction Secured. Digital receipt added to Vault.");
    setTimeout(() => navigate("/profile"), 1500);
  };

  return (
    <div className="min-h-screen bg-obsidian text-foreground overflow-x-hidden pb-40">
      {/* Immersive Header Backdrop */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <header className="sticky top-0 z-[100] glass px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-8 flex items-center justify-between border-b border-white/5">
        <button 
          onClick={() => { haptics.light(); navigate(-1); }} 
          className="press glass grid h-12 w-12 place-items-center rounded-2xl border border-white/5"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Transaction Safe</span>
            <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[8px] font-bold text-platinum/30 uppercase tracking-widest text-center">TLS 1.3 Encryption Active</span>
            </div>
        </div>
        <button onClick={() => haptics.light()} className="h-12 w-12 flex items-center justify-center text-platinum/20 hover:text-white transition-colors">
            <Info className="h-5 w-5" />
        </button>
      </header>

      <div className="relative z-10 px-6 pt-12 max-w-lg mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
            <h1 className="text-4xl font-black tracking-tighter mb-2">Finalize <span className="text-primary">Mastery.</span></h1>
            <p className="text-platinum/40 text-[11px] font-bold uppercase tracking-[0.2em] mb-10">Review and authorize your upcoming session</p>
        </motion.div>

        {/* 3D-Tilt Refractive Receipt Card */}
        <motion.div 
          whileHover={{ rotateX: 2, rotateY: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="group relative perspective-1000"
        >
          <div className="glass-refractive border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            {/* Gloss reflection overlay */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/20 z-20" />
            
            <div className="p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                        <img 
                            src={barber.image} 
                            alt={barber.name} 
                            className="h-20 w-20 rounded-3xl object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 shadow-glow" 
                        />
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                            <Zap className="h-4 w-4 text-primary-foreground fill-current" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">{service.name}</h3>
                        <p className="text-platinum/40 text-xs font-bold uppercase tracking-widest">{barber.name} · {slot}</p>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                    <ReceiptRow label="Service Base" value={`Rs ${service.price}`} />
                    <ReceiptRow label="Studio Telemetry Tip" value={`Rs ${tip}`} />
                    <div className="relative pt-6 mt-6 border-t border-dashed border-white/10">
                        {/* Cut-out effects on edges */}
                        <div className="absolute -left-10 -top-2.5 h-5 w-5 rounded-full bg-obsidian" />
                        <div className="absolute -right-10 -top-2.5 h-5 w-5 rounded-full bg-obsidian" />
                        
                        <div className="flex justify-between items-end">
                          <div>
                                <p className="text-[10px] font-black text-platinum/20 uppercase tracking-widest mb-1">Settlement</p>
                                <p className="text-3xl font-black tracking-tighter">Total Due</p>
                            </div>
                            <p className="text-4xl font-black tracking-tighter text-primary">Rs {total}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white/[0.02] p-5 text-center">
                <p className="text-[9px] font-bold text-platinum/20 uppercase tracking-[0.2em]">All sessions include grooming consultation & beverage</p>
            </div>
          </div>
        </motion.div>

        {/* Holographic Payment Selection */}
        <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest">Payment Relay</h3>
                <span className="text-[10px] font-bold text-primary cursor-pointer hover:underline">Switch Node</span>
            </div>

            <motion.div 
               whileTap={{ scale: 0.98 }}
               className="glass-refractive border border-white/10 rounded-[30px] p-6 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-obsidian shadow-glow">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-black tracking-tight">Apple Pay</div>
                        <div className="text-[10px] font-bold text-platinum/40 uppercase tracking-widest">Biometric Link · •••• 9210</div>
                    </div>
                </div>
                <div className="h-8 w-8 rounded-full border border-primary/40 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-primary shadow-glow" />
                </div>
            </motion.div>
        </div>

        {/* Dynamic Slide Action Footer */}
        <div className="fixed inset-x-0 bottom-[calc(2rem+env(safe-area-inset-bottom))] z-50 px-8 lg:hidden">
            <SlideAction 
               onComplete={handleComplete}
               price={`Rs ${total}`}
               label="Slide to Authorize"
            />
        </div>
      </div>
    </div>
  );
};

const ReceiptRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-platinum/30 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black tracking-tight">{value}</span>
    </div>
);

export default Checkout;
