/**
 * Modelos fisiológicos simplificados usados por las simulaciones.
 * Cada función documenta su fuente y sus límites: son aproximaciones
 * didácticas, no modelos clínicos.
 */

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Diámetro pupilar (mm) en función de la luminancia de adaptación (cd/m²).
 * Fórmula de Moon & Spencer (1944), revisada por Watson & Yellott (2012):
 *   D = 4.9 − 3·tanh(0.4·log10(L))
 * Da ~7.9 mm en oscuridad profunda y ~1.9 mm con luz muy intensa (adulto joven).
 */
export function pupilDiameterMm(luminance: number): number {
  const L = Math.max(luminance, 1e-6);
  return 4.9 - 3 * Math.tanh(0.4 * Math.log10(L));
}

/** Convierte una posición de deslizador 0–100 a luminancia en escala logarítmica (10⁻⁴ a 10⁵ cd/m²). */
export function sliderToLuminance(pos: number): number {
  const p = clamp(pos, 0, 100) / 100;
  return 10 ** lerp(-4, 5, p);
}

/** Área de la pupila en mm² para un diámetro dado. */
export const pupilAreaMm2 = (diameterMm: number) => Math.PI * (diameterMm / 2) ** 2;

export interface LightScene {
  upTo: number; // luminancia máxima (cd/m²) de este rango
  label: string;
  detail: string;
}

/** Escenas de referencia (órdenes de magnitud habituales en la literatura de fotometría). */
export const LIGHT_SCENES: LightScene[] = [
  { upTo: 0.003, label: 'Noche sin luna', detail: 'Visión escotópica: solo responden los bastones.' },
  { upTo: 3, label: 'Crepúsculo · luz de luna', detail: 'Visión mesópica: conos y bastones trabajan a la vez.' },
  { upTo: 300, label: 'Interior iluminado', detail: 'Visión fotópica: dominan los conos.' },
  { upTo: 10_000, label: 'Día nublado al aire libre', detail: 'Visión fotópica con buena agudeza y color.' },
  { upTo: Infinity, label: 'Pleno sol', detail: 'Luz muy intensa: la pupila llega a su tamaño mínimo.' },
];

export function sceneFor(luminance: number): LightScene {
  return LIGHT_SCENES.find((s) => luminance <= s.upTo) ?? LIGHT_SCENES[LIGHT_SCENES.length - 1]!;
}

/**
 * Demanda de acomodación (dioptrías) para enfocar un objeto a `distanceM` metros.
 * Un objeto en el «infinito» óptico (≥ 6 m en la práctica) requiere ~0 D.
 */
export function accommodationDemandD(distanceM: number): number {
  if (!Number.isFinite(distanceM) || distanceM <= 0) return 0;
  return 1 / distanceM;
}

/**
 * Densidades aproximadas de fotorreceptores (células/mm²) según excentricidad
 * (grados desde la fóvea, lado temporal). Curvas suavizadas a partir de
 * Østerberg (1935) y Curcio et al. (1990). Orden de magnitud correcto; no
 * reproducen los datos punto por punto.
 */
export function coneDensity(eccDeg: number): number {
  const e = Math.abs(eccDeg);
  // pico foveal ~ 160 000–200 000/mm², cae rápido y se estabiliza ~ 4 000–5 000/mm²
  return 4500 + 175_000 * Math.exp(-e / 0.45) + 14_000 * Math.exp(-e / 4);
}

export function rodDensity(eccDeg: number): number {
  const e = Math.abs(eccDeg);
  // 0 en el centro de la fóvea; pico ~ 155 000/mm² hacia los 18–20°; descenso gradual hacia la periferia
  if (e < 0.3) return 0;
  const p = 19;
  const k = 1.5;
  return 155_000 * Math.pow(e / p, k) * Math.exp(k * (1 - e / p));
}

/** Excentricidad del punto ciego (disco óptico): ~12–17° hacia el lado nasal de la fóvea. */
export const BLIND_SPOT_DEG = { from: 12.5, to: 17.5 } as const;

/** Distancia de observación (cm) a la que desaparece un punto separado `sepCm` de la cruz (~15° de ángulo). */
export function blindSpotDistanceCm(sepCm: number, angleDeg = 15): number {
  return sepCm / Math.tan((angleDeg * Math.PI) / 180);
}
