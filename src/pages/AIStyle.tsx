import { useState, useEffect, useRef } from "react";
import { 
  Camera, Sparkles, RotateCw, Image as ImageIcon, Scan, Activity, Zap, Info, 
  Scissors, ChevronRight, Share2, Download, ShieldCheck, Calendar, ChevronLeft, 
  Check, RefreshCw, Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { toast } from "sonner";

// Warm, user-friendly style descriptions
const styles = [
  { id: "fade", name: "Skin Fade", match: 94, duration: "60m", badge: "Perfect Fit", desc: "A clean gradient cut that highlights your natural jawline and bone structure." },
  { id: "texture", name: "Texture Crop", match: 88, duration: "45m", badge: "Great Match", desc: "Adds nice volume on top, balancing your face shape and features." },
  { id: "slick", name: "Slick Back", match: 82, duration: "45m", badge: "Compatible", desc: "A classic, smart style that stays clean and out of your face." },
  { id: "pompadour", name: "Pompadour", match: 75, duration: "75m", badge: "Alternative", desc: "Adds high volume on top, ideal for a soft or round face shape." },
  { id: "buzz", name: "Buzz Cut", match: 70, duration: "30m", badge: "Easy Style", desc: "Simple, fresh, and zero maintenance. Highlights your eyes and forehead." },
];

const mockLogs = [
  "Preparing style match AI...",
  "Looking for facial lines...",
  "Analyzing face shape...",
  "Facial symmetry: Excellent",
  "Checking hair thickness...",
  "Hair volume: High",
  "Jawline type: Sharp & angular",
  "Finding matching styles...",
  "Style recommendation ready.",
];

const AIStyle = () => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [isScanning, setIsScanning] = useState(true);
  const [isTargetLocked, setIsTargetLocked] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [mockPhotoUploaded, setMockPhotoUploaded] = useState(false);
  const [meshPoints, setMeshPoints] = useState<{ x: number; y: number; label: string }[]>([
    { x: 35, y: 35, label: "L-Orbit" },
    { x: 65, y: 35, label: "R-Orbit" },
    { x: 50, y: 52, label: "Nose Tip" },
    { x: 30, y: 70, label: "Left Jaw" },
    { x: 70, y: 70, label: "Right Jaw" },
    { x: 50, y: 82, label: "Chin" },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fluctuating grid coordinates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isScanning || !isTargetLocked) return;
      setMeshPoints(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + (Math.random() - 0.5) * 0.4,
          y: p.y + (Math.random() - 0.5) * 0.4,
        }))
      );
    }, 120);
    return () => clearInterval(interval);
  }, [isScanning, isTargetLocked]);

  // Telemetry logs streaming
  useEffect(() => {
    setLogs([]);
    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < mockLogs.length) {
        setLogs(prev => [...prev.slice(-4), mockLogs[logIdx]]);
        logIdx++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setIsTargetLocked(true);
        haptics.success();
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Web camera activation logic
  const startCamera = async () => {
    haptics.medium();
    if (cameraActive) {
      stopCamera();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 640 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMockPhotoUploaded(false);
      triggerScan();
      toast.success("Camera Connected Successfully");
    } catch (err) {
      console.warn("Camera access denied or unavailable: ", err);
      toast.error("Camera unavailable. Launching virtual scan simulation.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const triggerScan = () => {
    setIsScanning(true);
    setIsTargetLocked(false);
    setLogs([]);
    haptics.medium();
    
    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < mockLogs.length) {
        setLogs(prev => [...prev.slice(-4), mockLogs[logIdx]]);
        logIdx++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setIsTargetLocked(true);
        haptics.success();
      }
    }, 400);
  };

  const simulateUpload = () => {
    haptics.medium();
    setMockPhotoUploaded(true);
    stopCamera();
    triggerScan();
    toast.success("Photo loaded for style analysis");
  };

  const handleStyleSelect = (style: typeof styles[0]) => {
    setSelectedStyle(style);
    setIsSynthesizing(true);
    haptics.medium();
    setTimeout(() => setIsSynthesizing(false), 800);
  };

  const handleCommitSchedule = () => {
    haptics.success();
    const serviceId = selectedStyle.id === "fade" ? "fade" : "signature";
    navigate("/book", { state: { preselectedServiceId: serviceId } });
  };

  return (
    <div className="min-h-screen bg-obsidian text-white relative overflow-x-hidden">
      {/* ── Ambient Background Mesh Glows ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-amber-500/[0.02] blur-[160px]" />
        <div className="absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-white/[0.015] blur-[140px]" />
      </div>

      {/* ── Main Scrollable Canvas ───────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pb-52 pt-[calc(3.5rem+env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pt-10 lg:pb-16">
        
        {/* ── Header Row ── */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <button
            onClick={() => { haptics.light(); navigate("/"); }}
            className="press h-9 w-9 shrink-0 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.07] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>

          <div className="flex flex-col items-center text-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/80">Style Match AI</span>
            <h1 className="text-xl font-bold tracking-tight text-white/90">Personal Style Consultant</h1>
          </div>

          <button 
            onClick={() => {
              haptics.light();
              navigator.clipboard.writeText(window.location.href);
              toast.success("Style link copied to clipboard");
            }}
            className="press h-9 w-9 shrink-0 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.07] transition-colors"
          >
            <Share2 className="h-4 w-4 text-white/70" strokeWidth={2} />
          </button>
        </header>

        {/* ── Dashboard Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ── COLUMN 1: Viewport & Controller (col-span-7) ── */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Viewport Frame */}
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-[32px] overflow-hidden border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl flex items-center justify-center shadow-2xl">
              
              {/* Camera / Image Feed Layer */}
              {cameraActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
              ) : mockPhotoUploaded ? (
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.01] to-white/[0.03]">
                  {/* Neon Etched Face Silhouette */}
                  <svg className="w-48 h-48 text-white/10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <path d="M50 15 C32 15 28 32 28 50 C28 68 36 78 50 85 C64 78 72 68 72 50 C72 32 68 15 50 15 Z" strokeDasharray="3 3" />
                    <ellipse cx="50" cy="50" rx="18" ry="24" strokeWidth="0.5" />
                    <line x1="50" y1="15" x2="50" y2="85" strokeWidth="0.3" strokeDasharray="2 2" />
                    <line x1="28" y1="50" x2="72" y2="50" strokeWidth="0.3" strokeDasharray="2 2" />
                  </svg>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/20 mt-4">Scanner Ready</span>
                </div>
              )}

              {/* Holographic Matrix Grid lines overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                   style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              {/* Glowing Corner Accents */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-500/60 rounded-tl-xl" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-500/60 rounded-tr-xl" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-500/60 rounded-bl-xl" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-500/60 rounded-br-xl" />

              {/* Real-time scanning laser line */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/80 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20"
                  />
                )}
              </AnimatePresence>

              {/* Dynamic Coordinate Points overlay */}
              {isTargetLocked && !isScanning && meshPoints.map((pt, i) => (
                <motion.div
                  key={pt.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <div className="relative">
                    <span className="absolute h-3.5 w-3.5 rounded-full border border-amber-500/80 animate-ping absolute -left-1 -top-1" />
                    <span className="block h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                    <div className="absolute left-3 -top-2 px-1.5 py-0.5 rounded border border-white/[0.08] bg-black/85 backdrop-blur-md whitespace-nowrap">
                      <span className="text-[7px] font-mono font-medium text-amber-500 uppercase tracking-widest block">
                        {pt.label}
                      </span>
                      <span className="text-[6px] font-mono text-white/50 block leading-none">
                        X: {pt.x.toFixed(3)} Y: {pt.y.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Center Status Lock Notification */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/70 border border-white/[0.08] px-4 py-1.5 rounded-full backdrop-blur-xl flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", isScanning ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-white/80">
                  {isScanning ? "Analyzing shape..." : "Analysis complete"}
                </span>
              </div>
            </div>

            {/* Controller Actions Panel */}
            <div className="flex items-center gap-3">
              <button 
                onClick={startCamera}
                className={cn(
                  "press flex-1 h-14 rounded-2xl border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300",
                  cameraActive 
                    ? "border-amber-500/30 bg-amber-500/[0.05] text-amber-500" 
                    : "border-white/[0.08] bg-white/[0.03] backdrop-blur-xl text-white/80 hover:bg-white/[0.07]"
                )}
              >
                <Camera className="h-4 w-4" />
                {cameraActive ? "Turn Camera Off" : "Use Camera"}
              </button>

              <button 
                onClick={simulateUpload}
                className="press flex-1 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 text-white/80 hover:bg-white/[0.07] transition-all duration-300"
              >
                <ImageIcon className="h-4 w-4" />
                Upload Photo
              </button>

              <button 
                onClick={triggerScan}
                disabled={isScanning}
                className="press h-14 w-14 shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl flex items-center justify-center text-white/80 hover:bg-white/[0.07] transition-all duration-300 disabled:opacity-40"
              >
                <RefreshCw className={cn("h-4 w-4", isScanning && "animate-spin")} />
              </button>
            </div>

          </div>

          {/* ── COLUMN 2: Telemetry (col-span-5) ── */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Telemetry Speeds & Log Bento Card */}
            <div className="grid grid-cols-2 gap-3">
              {/* Sync Factor Card */}
              <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 flex flex-col justify-between h-28">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Match Score</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold tracking-tight text-white">{isScanning ? "..." : "98.2"}</span>
                  <span className="text-xs font-semibold italic text-amber-500">%</span>
                </div>
                <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: isScanning ? "40%" : "98%" }}
                    className="h-full bg-amber-500"
                  />
                </div>
              </div>

              {/* Symmetry Score Card */}
              <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 flex flex-col justify-between h-28">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Symmetry Score</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold tracking-tight text-white">{isScanning ? "..." : "98.2"}</span>
                  <span className="text-xs font-semibold italic text-amber-500">%</span>
                </div>
                <span className="text-[8px] font-sans text-white/20 mt-1 uppercase tracking-wider">Excellent facial balance</span>
              </div>
            </div>

            {/* Analysis Progress panel */}
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">Analysis Progress</span>
                <Activity className="h-3.5 w-3.5 text-amber-500/65 animate-pulse" />
              </div>
              <div className="font-sans text-[11px] text-white/70 space-y-2 min-h-[76px] flex flex-col justify-end">
                {isScanning ? (
                  <div className="space-y-2.5 py-1">
                    <div className="h-2 w-3/4 rounded bg-white/5 animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-white/5 animate-pulse" />
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div 
                      key={log + i} 
                      initial={{ opacity: 0, y: 4 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="h-1 w-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)] shrink-0" />
                      <span>{log}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Recommendations Style List Header */}
            <div className="pt-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">Recommended Styles</h2>
              <div className="space-y-2">
                {styles.map((item) => {
                  const isSelected = selectedStyle.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleStyleSelect(item)}
                      className={cn(
                        "press-elev w-full flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all duration-300",
                        isSelected
                          ? "border-white/[0.18] bg-white/[0.06] shadow-[0_0_24px_-10px_rgba(245,158,11,0.25)]"
                          : "border-white/[0.07] bg-white/[0.025] backdrop-blur-xl hover:border-white/[0.12] hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-xs font-bold", isSelected ? "text-amber-500" : "text-white/80")}>
                            {item.name}
                          </span>
                          <span className="text-[7.5px] font-bold uppercase tracking-wider bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded text-white/40">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[9px] text-white/30 truncate leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold tracking-tight text-white/90">{item.match}% Match</p>
                          <p className="text-[9px] text-white/40 mt-0.5 font-medium">• {item.duration.replace("m", " Min")}</p>
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                            <Check className="h-3 w-3 text-black" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA Trigger Report */}
            <button
              onClick={() => { haptics.medium(); setShowAnalysis(true); }}
              disabled={isScanning}
              className="press w-full h-16 rounded-[22px] bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)] disabled:opacity-40 mt-6"
            >
              <Sparkles className="h-4 w-4" />
              Show Style Details
            </button>

          </div>
        </div>

      </div>

      {/* ── Analysis Overlay (Native Spring Bottom Sheet) ───────────────── */}
      <AnimatePresence>
        {showAnalysis && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnalysis(false)}
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-[120] max-h-[85vh] overflow-y-auto border-t border-white/[0.08] bg-black/95 backdrop-blur-2xl rounded-t-[40px] px-6 pb-12 pt-8 shadow-2xl"
            >
              {/* Drag Handle Accent */}
              <div className="mx-auto w-12 h-1 bg-white/[0.12] rounded-full mb-8" />

              <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Modal Title Row */}
                <header className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.25em]">Personal Match Details</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase italic">
                      Your Perfect <span className="text-amber-500 not-italic">Fit.</span>
                    </h2>
                  </div>

                  <div className="h-16 w-16 rounded-2xl bg-amber-500 flex flex-col items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <span className="text-xl font-black leading-none">{selectedStyle.match}%</span>
                    <span className="text-[6.5px] font-bold uppercase tracking-widest mt-0.5 opacity-60">Match</span>
                  </div>
                </header>

                {/* Subtitle & details description */}
                <p className="text-xs text-white/40 leading-relaxed font-mono">
                  Our AI matched your unique face shape, hair volume, and features to a <span className="text-white font-bold">{selectedStyle.name}</span>.
                </p>

                {/* Report Grid Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/20 mb-1">Face Shape</p>
                    <p className="text-sm font-semibold text-white/80">Angular</p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/20 mb-1">Hair Volume</p>
                    <p className="text-sm font-semibold text-white/80">Excellent</p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/20 mb-1">Hair Thickness</p>
                    <p className="text-sm font-semibold text-white/80">High</p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/20 mb-1">Style Tone</p>
                    <p className="text-sm font-semibold text-white/80">Neutral</p>
                  </div>
                </div>

                {/* Detailed Analysis Output */}
                <div className="rounded-2xl border border-white/[0.06] bg-amber-500/[0.02] p-5 space-y-2">
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-amber-500">Style Guide Tips</span>
                  <p className="text-xs text-white/70 leading-relaxed">
                    A structured {selectedStyle.name} fits you best because it elongates your profile, balancing your forehead and jawline beautifully.
                  </p>
                </div>

                {/* Confirm & Booking Commit Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCommitSchedule}
                    className="press flex-1 h-16 rounded-[20px] bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/90 shadow-lg"
                  >
                    <Calendar className="h-4 w-4" />
                    Book This Style
                  </button>

                  <button
                    onClick={() => {
                      haptics.light();
                      toast.success("Style saved to your profile.");
                    }}
                    className="press h-16 w-16 shrink-0 rounded-[20px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl flex items-center justify-center text-white/70 hover:bg-white/[0.07]"
                  >
                    <Download className="h-5 w-5" />
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

export default AIStyle;
