import { Camera, Sparkles, RotateCw, Image as ImageIcon } from "lucide-react";

const styles = ["Skin Fade", "Texture Crop", "Slick Back", "Pompadour", "Buzz", "Curtains"];

const AIStyle = () => {
  return (
    <div className="mx-auto max-w-md px-5 pb-32 pt-6 animate-float-up">
      <header className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">AI Consultation</div>
        <h1 className="mt-1 text-[32px] font-semibold tracking-tight">Style preview</h1>
      </header>

      {/* Camera viewport */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] bg-gradient-obsidian shadow-elev">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(30_20%_30%/0.3),transparent_60%)]" />
        {/* face guide */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-[55%] w-[60%] rounded-[50%] border border-platinum/30" />
        </div>
        {/* corner brackets */}
        {[
          "top-6 left-6 border-l border-t",
          "top-6 right-6 border-r border-t",
          "bottom-6 left-6 border-l border-b",
          "bottom-6 right-6 border-r border-b",
        ].map((c, i) => (
          <div key={i} className={`absolute h-8 w-8 rounded-md border-platinum/60 ${c}`} />
        ))}
        <div className="absolute left-1/2 top-6 -translate-x-1/2 glass rounded-full px-3 py-1.5 text-[10px] uppercase tracking-widest">
          Align face within frame
        </div>
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-5">
          <button className="press glass grid h-12 w-12 place-items-center rounded-full">
            <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button className="press grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
            <Camera className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <button className="press glass grid h-12 w-12 place-items-center rounded-full">
            <RotateCw className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Styles */}
      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-platinum" strokeWidth={1.5} />
          <h2 className="text-base font-semibold tracking-tight">Recommended styles</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {styles.map((s, i) => (
            <button
              key={s}
              className={`press glass rounded-full px-4 py-2 text-xs font-medium ${
                i === 0 ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 glass rounded-[24px] p-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Match score</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight text-platinum">94%</div>
        <p className="mt-2 text-xs text-muted-foreground">
          Based on face structure, hairline density, and your previous bookings, the Skin Fade is highly recommended.
        </p>
      </div>
    </div>
  );
};

export default AIStyle;
