import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { haptics } from "@/lib/haptics";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    haptics.error();
    console.error("404 Error: Non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Anomalies */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-primary/20 blur-[120px] rounded-full opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-refractive p-16 rounded-[80px] border border-white/5 text-center space-y-12 max-w-xl relative z-10"
      >
        <div className="flex justify-center">
            <div className="h-32 w-32 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center relative">
               <ShieldAlert className="h-12 w-12 text-primary animate-pulse" />
               <div className="absolute inset-0 rounded-[40px] border border-primary/20 animate-ping" />
            </div>
        </div>

        <div className="space-y-4">
            <h1 className="text-8xl font-black tracking-tighter text-white italic">404</h1>
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Void Protocol Initiated</div>
            <p className="text-platinum/40 text-sm leading-relaxed max-w-xs mx-auto">
               The path <span className="text-primary italic font-bold">"{location.pathname}"</span> does not exist within the Barber.mu digital twin.
            </p>
        </div>

        <button 
           onClick={() => { haptics.medium(); navigate("/"); }}
           className="press flex items-center justify-center gap-3 w-full h-20 rounded-[32px] bg-white text-obsidian text-[10px] font-black uppercase tracking-[0.4em]"
        >
           <ArrowLeft className="h-4 w-4" />
           Return to Nexus
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
