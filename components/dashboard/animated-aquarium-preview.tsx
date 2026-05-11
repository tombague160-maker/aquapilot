import { AnimatedFish } from "@/components/dashboard/animated-fish";
import { AquariumVisualFallback } from "@/components/dashboard/aquarium-visual-fallback";
import { WaterGlowOverlay } from "@/components/dashboard/water-glow-overlay";

type AnimatedAquariumPreviewProps = {
  imageUrl: string | null;
  name: string;
};

export function AnimatedAquariumPreview({
  imageUrl,
  name,
}: AnimatedAquariumPreviewProps) {
  return (
    <div className="relative min-h-[21rem] overflow-hidden rounded-[2rem] border border-cyan-200/14 bg-slate-950 shadow-[0_32px_90px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.08)] sm:min-h-[27rem] lg:min-h-[30rem]">
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-75 saturate-[0.9] contrast-[1.08] brightness-[0.72]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(125,211,252,0.18),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.24),rgba(2,6,23,0.82))]" />
        </>
      ) : (
        <AquariumVisualFallback />
      )}

      <WaterGlowOverlay />

      <div className="absolute inset-x-6 top-5 z-20 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/56">
            Mon bac principal
          </p>
          <h2 className="mt-1 truncate text-2xl font-semibold text-white sm:text-3xl">
            {name}
          </h2>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,0.12)]">
          Vivant
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-linear-to-t from-slate-950 via-slate-950/58 to-transparent" />
      <AnimatedFish top="33%" color="cyan" delay={0} duration={24} depth="front" />
      <AnimatedFish top="42%" color="blue" delay={-8} duration={30} scale={0.75} depth="mid" />
      <AnimatedFish top="56%" color="gold" delay={-15} duration={27} reverse scale={0.82} depth="front" />
      <AnimatedFish top="66%" color="teal" delay={-4} duration={34} reverse scale={0.62} depth="back" />
      <AnimatedFish top="24%" color="cyan" delay={-18} duration={38} scale={0.54} depth="back" />

      <div className="pointer-events-none absolute inset-4 rounded-[1.55rem] border border-cyan-100/12 shadow-[inset_0_0_40px_rgba(125,211,252,0.08)]" />
    </div>
  );
}
