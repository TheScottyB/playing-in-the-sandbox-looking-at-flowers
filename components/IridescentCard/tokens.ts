// components/IridescentCard/tokens.ts
// Mirrors prototype TWEAK_DEFAULTS. Normalized: percentages → 0..1, others as-is.
// Reference: /tmp/design-pkg/iridescent-card/project/Iridescent Card.html lines 31-54

export const TOKENS = {
  // Card geometry
  cardWidth: 360,
  cardHeight: 540,
  cornerRadius: 22,

  // Pose
  tiltAmount: 18,           // degrees, max rotation per axis
  perspective: 1400,        // px

  // Iridescence
  iridescenceIntensity: 0.95,
  iridescenceContrast: 1.4,
  hueOffset: 200,           // degrees
  hueSpread: 320,           // degrees

  // Specular
  specularIntensity: 0.9,
  specularSize: 0.55,

  // Grain
  noiseOpacity: 0.22,
  noiseScale: 1.4,

  // Glow (outer)
  glowIntensity: 0.7,
  glowSize: 80,

  // Edge sheen
  edgeSheen: 0.55,

  // Cardstock colors
  cardstock: '#e9e3d2',
  ink: '#0a0a0c',
  inkSoft: 'rgba(10,10,12,0.35)',
  inkLine: 'rgba(10,10,12,0.85)',
} as const;

export type Tokens = typeof TOKENS;
