export function AquariumVisualFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_8%,rgba(14,116,144,0.54),transparent_34%),linear-gradient(180deg,#071826,#020711)]">
      <div className="absolute inset-x-10 bottom-10 h-16 rounded-[50%] bg-cyan-300/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-10 left-8 h-24 w-24 rounded-[42%_58%_45%_55%] bg-slate-700/70 shadow-[inset_0_10px_20px_rgba(255,255,255,0.08),0_18px_30px_rgba(0,0,0,0.34)]" />
      <div className="absolute bottom-12 left-24 h-32 w-20 rotate-12 rounded-[45%_55%_52%_48%] bg-slate-800/82 shadow-[inset_0_10px_20px_rgba(255,255,255,0.08)]" />
      <div className="absolute bottom-9 right-16 h-28 w-32 -rotate-12 rounded-[46%_54%_43%_57%] bg-slate-700/80 shadow-[inset_0_10px_24px_rgba(255,255,255,0.08),0_18px_30px_rgba(0,0,0,0.3)]" />
      <div className="absolute bottom-7 left-1/2 h-12 w-40 -translate-x-1/2 rounded-[50%] bg-slate-950/72" />
      <div className="absolute bottom-10 left-[18%] h-24 w-4 rounded-t-full bg-emerald-300/74 shadow-[0_0_18px_rgba(16,185,129,0.18)]" />
      <div className="absolute bottom-10 left-[23%] h-32 w-5 rounded-t-full bg-teal-200/66" />
      <div className="absolute bottom-10 right-[24%] h-36 w-5 rounded-t-full bg-lime-300/64" />
      <div className="absolute bottom-10 right-[18%] h-24 w-4 rounded-t-full bg-emerald-200/66" />
      <div className="absolute bottom-12 left-[47%] h-28 w-5 rounded-t-full bg-cyan-200/48" />
    </div>
  );
}
