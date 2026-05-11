export type AquariumVisualSource = {
  aquariumId: string;
  name: string;
  photoUrl: string | null;
  fishCount: number;
  plantCount: number;
};

export type AquariumVisualDescriptor = {
  mode: "photo-overlay" | "generated-fallback";
  imageUrl: string | null;
  overlayTone: "deep-blue";
  animationProfile: "calm";
  canGenerateWithAi: false;
};

export function buildAquariumVisualFromPhoto(
  source: AquariumVisualSource
): AquariumVisualDescriptor {
  return {
    mode: source.photoUrl ? "photo-overlay" : "generated-fallback",
    imageUrl: source.photoUrl,
    overlayTone: "deep-blue",
    animationProfile: "calm",
    canGenerateWithAi: false,
  };
}

export async function generateAquariumIllustration() {
  return {
    isConfigured: false,
    message:
      "Generation d'illustration IA non configuree. AquaPilot utilise le rendu photo stylise avec animations locales.",
  };
}
