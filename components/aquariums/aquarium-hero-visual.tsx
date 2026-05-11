type AquariumHeroVisualProps = {
  name: string;
  typeLabel: string;
  volume: string;
  temperature: string;
  fishCount: number;
  plantCount: number;
  activeAlerts: number;
  pendingReminders: number;
  photoUrl: string | null;
};

export function AquariumHeroVisual({
  name,
  typeLabel,
  volume,
  temperature,
  fishCount,
  plantCount,
  activeAlerts,
  pendingReminders,
  photoUrl,
}: AquariumHeroVisualProps) {
  const contextLabel = `${name}, ${typeLabel}, ${volume}, ${temperature}, ${fishCount} poisson(s), ${plantCount} plante(s), ${activeAlerts} alerte(s), ${pendingReminders} rappel(s)`;

  return (
    <section
      className="aqua-fade-up aqua-delay-2 relative mx-auto mt-2 flex min-h-[20.5rem] w-full max-w-[31rem] items-center justify-center sm:min-h-[28rem] sm:max-w-[40rem]"
      aria-label={contextLabel}
    >
      <div className="pointer-events-none absolute inset-x-8 bottom-4 h-20 rounded-[50%] bg-cyan-300/12 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 top-10 h-52 rounded-[50%] bg-cyan-200/8 blur-3xl" />

      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="relative z-10 max-h-[25rem] w-full rounded-[2rem] object-cover opacity-90 shadow-[0_34px_80px_rgba(0,0,0,0.52)] sm:max-h-[31rem]"
        />
      ) : (
        <svg
          viewBox="0 60 430 320"
          className="aqua-tank-float relative z-10 h-auto w-full overflow-visible drop-shadow-[0_42px_50px_rgba(0,0,0,0.5)]"
          role="img"
          aria-label="Illustration originale d'un aquarium AquaPilot"
        >
          <defs>
            <linearGradient id="tankTop" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#b9ecff" stopOpacity="0.28" />
              <stop offset="45%" stopColor="#80d8ff" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#0f2334" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="tankFront" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2d8bb2" stopOpacity="0.22" />
              <stop offset="58%" stopColor="#11364c" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#06141f" stopOpacity="0.62" />
            </linearGradient>
            <linearGradient id="tankSide" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#6ad7ff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#07131f" stopOpacity="0.54" />
            </linearGradient>
            <radialGradient id="rockGlow" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#6e94a7" />
              <stop offset="100%" stopColor="#172638" />
            </radialGradient>
            <linearGradient id="plantStem" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6ef7b0" />
              <stop offset="100%" stopColor="#1f7d64" />
            </linearGradient>
            <filter id="tankSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="tankShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#020611" floodOpacity="0.6" />
            </filter>
          </defs>

          <ellipse cx="220" cy="340" rx="166" ry="34" fill="#030a14" opacity="0.62" />
          <ellipse cx="210" cy="329" rx="122" ry="20" fill="#1d5572" opacity="0.2" />

          <g filter="url(#tankShadow)">
            <polygon
              points="62,151 143,94 374,144 294,201"
              fill="url(#tankTop)"
              stroke="#9bdfff"
              strokeOpacity="0.42"
              strokeWidth="2.2"
            />
            <polygon
              points="62,151 294,201 294,326 62,276"
              fill="url(#tankFront)"
              stroke="#b5efff"
              strokeOpacity="0.5"
              strokeWidth="2.4"
            />
            <polygon
              points="294,201 374,144 374,270 294,326"
              fill="url(#tankSide)"
              stroke="#b5efff"
              strokeOpacity="0.48"
              strokeWidth="2.2"
            />
            <polyline
              points="143,94 143,220 62,276"
              fill="none"
              stroke="#b5efff"
              strokeOpacity="0.28"
              strokeWidth="1.6"
            />
            <polyline
              points="374,144 294,201 62,151"
              fill="none"
              stroke="#d6f7ff"
              strokeOpacity="0.54"
              strokeWidth="1.8"
            />
          </g>

          <g opacity="0.9">
            <path
              d="M88 147c38-18 67 12 104-2 43-16 76-9 126 10"
              fill="none"
              stroke="#d7f7ff"
              strokeLinecap="round"
              strokeOpacity="0.48"
              strokeWidth="4"
            />
            <path
              d="M104 157c25-10 38 7 63-4 22-9 38-6 63 8 24 13 53 2 85 11"
              fill="none"
              stroke="#a9e8ff"
              strokeLinecap="round"
              strokeOpacity="0.55"
              strokeWidth="3.2"
            />
            <path
              d="M174 121c21 7 36 8 54 1M238 136c18 4 37 5 56-1"
              fill="none"
              stroke="#e5fbff"
              strokeLinecap="round"
              strokeOpacity="0.44"
              strokeWidth="2.8"
            />
          </g>

          <g>
            <path
              d="M84 246c16-38 50-53 76-35 15 10 33 1 52-13 25-18 65-13 82 18 24-7 53 10 58 39 6 33-23 50-60 46-54-6-90 11-132 13-52 4-97-22-76-68Z"
              fill="url(#rockGlow)"
              opacity="0.95"
            />
            <path
              d="M119 230c16-12 31-15 47-8 11 5 20 4 34-8M226 224c23-9 41-5 57 9M136 280c22 5 42 1 63-9M231 284c23-3 44-12 68-6"
              fill="none"
              stroke="#92b8c8"
              strokeLinecap="round"
              strokeOpacity="0.24"
              strokeWidth="4"
            />
            <path
              d="M153 256c17-19 39-18 52 0 9 13 0 33-25 34-26 1-42-17-27-34Z"
              fill="#091421"
              opacity="0.72"
            />
            <path
              d="M255 247c19-15 37-11 43 8 4 13-10 29-32 28-24-2-30-21-11-36Z"
              fill="#07111e"
              opacity="0.68"
            />
            <path
              d="M99 270c15-18 34-17 45-4 8 10 0 28-22 29-22 0-35-11-23-25Z"
              fill="#08131f"
              opacity="0.67"
            />
          </g>

          <g filter="url(#tankSoftGlow)">
            <path d="M209 224c6-32 16-51 32-72" stroke="url(#plantStem)" strokeLinecap="round" strokeWidth="5" />
            <path d="M221 202c-31-20-42-40-29-60 29 12 41 31 29 60Z" fill="#2e8f72" opacity="0.88" />
            <path d="M233 186c22-30 45-38 65-27-17 29-39 40-65 27Z" fill="#3aa982" opacity="0.82" />
            <path d="M201 228c-23-23-26-43-7-58 22 17 26 37 7 58Z" fill="#256d61" opacity="0.82" />
            <path d="M138 294c0-27 6-45 15-68M153 297c4-26 16-48 31-66M280 296c2-25 12-48 31-69M298 294c-2-24 2-42 12-59" stroke="url(#plantStem)" strokeLinecap="round" strokeWidth="3.6" opacity="0.82" />
            <path d="M134 290c-12-23-11-40 4-51 14 20 13 37-4 51ZM166 287c22-18 39-19 52-3-19 17-36 18-52 3ZM292 286c-19-23-18-42 3-57 15 25 14 43-3 57ZM313 279c16-20 33-27 51-19-13 22-30 29-51 19Z" fill="#2fb98a" opacity="0.72" />
          </g>

          <g filter="url(#tankSoftGlow)">
            <path d="M238 234c20-11 37-9 49 6-16 12-33 11-49-6Z" fill="#1d4ed8" />
            <circle cx="278" cy="240" r="2.2" fill="#b7f7ff" />
            <path d="M235 235l-11-8 2 14Z" fill="#2563eb" />
            <path d="M158 221c18-9 32-6 43 7-14 11-30 9-43-7Z" fill="#d2cb45" opacity="0.86" />
            <circle cx="193" cy="228" r="2" fill="#f9f6b1" />
            <path d="M155 222l-9-7 1 12Z" fill="#b9b53b" />
            <path d="M276 270c17-9 31-7 42 6-14 10-28 8-42-6Z" fill="#d6c447" opacity="0.84" />
            <path d="M273 271l-9-7 1 12Z" fill="#b5a938" />
            <path d="M193 274c12 4 18 13 20 27M199 278c-7 8-15 14-25 18" fill="none" stroke="#c7d3db" strokeLinecap="round" strokeOpacity="0.34" strokeWidth="3" />
          </g>

          <g opacity="0.66">
            <circle cx="90" cy="242" r="2" fill="#d7f7ff" />
            <circle cx="102" cy="224" r="1.6" fill="#d7f7ff" />
            <circle cx="116" cy="202" r="1.4" fill="#d7f7ff" />
            <circle cx="341" cy="231" r="2.2" fill="#c8f7ff" />
            <circle cx="350" cy="213" r="1.4" fill="#c8f7ff" />
          </g>
        </svg>
      )}

      <div className="sr-only">
        {volume}. {temperature}. {fishCount} poissons. {plantCount} plantes.
        {activeAlerts} alertes actives. {pendingReminders} rappels.
      </div>
    </section>
  );
}
