export function WaterGlowOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(45,212,191,0.16),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.78))]" />
      <div className="aqua-dashboard-caustics absolute inset-0 opacity-60 mix-blend-screen" />
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-cyan-100/20 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-cyan-200/12 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-blue-300/12 to-transparent" />
      {Array.from({ length: 10 }, (_, index) => (
        <span
          key={index}
          className="aqua-dashboard-bubble absolute bottom-8 size-1.5 rounded-full bg-cyan-100/55 shadow-[0_0_12px_rgba(125,211,252,0.42)]"
          style={{
            left: `${8 + index * 8.7}%`,
            animationDelay: `${index * 0.7}s`,
            animationDuration: `${7 + (index % 4)}s`,
            opacity: 0.25 + (index % 4) * 0.13,
          }}
        />
      ))}
    </div>
  );
}
