/**
 * Geometría del esquema en corte horizontal del ojo derecho (visto desde arriba).
 * Escala: 16 unidades SVG ≈ 1 mm. Valores del «ojo esquemático» adulto:
 * longitud axial ≈ 24 mm, radio de la córnea ≈ 7,8 mm, diámetro corneal ≈ 11,5 mm,
 * profundidad de cámara anterior ≈ 3,5 mm, cristalino ≈ 4 mm de espesor y ≈ 9 mm de diámetro.
 * Luz entrando por la izquierda; nasal = abajo, temporal = arriba.
 */

export const VB = { w: 900, h: 520 } as const;
export const C = { x: 470, y: 260 } as const;
export const PX_PER_MM = 16;

export const R_SCLERA = 187; // eje del trazo (grosor 10)
export const R_CHOROID = 179; // grosor 6
export const R_RETINA = 172; // grosor 8
export const R_VITREOUS = 168;

export const deg = (d: number) => (d * Math.PI) / 180;
export const polar = (angleDeg: number, r: number) => ({ x: C.x + r * Math.cos(deg(angleDeg)), y: C.y + r * Math.sin(deg(angleDeg)) });

/** Arco centrado en C entre dos ángulos (en grados, sentido horario en pantalla). */
export function arc(fromDeg: number, toDeg: number, r: number) {
  const a = polar(fromDeg, r);
  const b = polar(toDeg, r);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} A${r} ${r} 0 ${large} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

// Limbo esclerocorneal: semicuerda corneal 92 (≈ 5,75 mm)
export const LIMBUS_HALF = 92;
export const LIMBUS_DEG = 180 - (Math.acos(Math.sqrt(R_SCLERA ** 2 - LIMBUS_HALF ** 2) / R_SCLERA) * 180) / Math.PI; // ≈ 150,5°
export const LIMBUS_X = C.x - Math.sqrt(R_SCLERA ** 2 - LIMBUS_HALF ** 2);
export const R_CORNEA = 125;
export const CORNEA_CX = LIMBUS_X + Math.sqrt(R_CORNEA ** 2 - LIMBUS_HALF ** 2);
export const CORNEA_APEX_X = CORNEA_CX - R_CORNEA;

/** x de la superficie anterior de la córnea a una altura h respecto del eje óptico. */
export const corneaXAt = (h: number) => CORNEA_CX - Math.sqrt(Math.max(0, R_CORNEA ** 2 - h ** 2));

export function corneaPath() {
  return `M${LIMBUS_X.toFixed(1)} ${C.y - LIMBUS_HALF} A${R_CORNEA} ${R_CORNEA} 0 0 0 ${LIMBUS_X.toFixed(1)} ${C.y + LIMBUS_HALF}`;
}

export const ORA_DEG = 137; // ora serrata: límite anterior de la retina funcional
export const IRIS_X = 322;

/** Cuerpo ciliar (arriba = -1, abajo = 1). */
export function ciliaryPath(side: -1 | 1, contraction = 0) {
  const a = polar(side * ORA_DEG, 182);
  const b = polar(side * 151, 182);
  // al contraerse, el anillo muscular se desplaza hacia adelante y hacia el eje
  const tip = { x: 346 - 4 * contraction, y: C.y + side * (100 - 8 * contraction) };
  const cy = C.y + side * 118;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${tip.x + 14} ${cy} ${tip.x} ${tip.y} Q ${tip.x - 18} ${C.y + side * 92} ${b.x.toFixed(1)} ${b.y.toFixed(1)} Z`;
}
export const ciliaryTip = (side: -1 | 1, contraction = 0) => ({ x: 346 - 4 * contraction, y: C.y + side * (100 - 8 * contraction) });

export interface LensShape {
  equatorX: number;
  half: number; // semidiámetro
  ra: number; // radio superficie anterior
  rp: number; // radio superficie posterior
  anteriorApex: number;
  posteriorApex: number;
}

/** Cristalino según acomodación (0 = mirada lejana, 1 = máxima acomodación para cerca). */
export function lensShape(acc = 0): LensShape {
  const half = 72 - 7 * acc;
  const ra = 160 - 70 * acc; // ~10 mm → ~5,6 mm
  const rp = 96 - 12 * acc; // ~6 mm → ~5,3 mm
  const equatorX = 347 - 2 * acc;
  const sagA = ra - Math.sqrt(ra ** 2 - half ** 2);
  const sagP = rp - Math.sqrt(rp ** 2 - half ** 2);
  return { equatorX, half, ra, rp, anteriorApex: equatorX - sagA, posteriorApex: equatorX + sagP };
}

export function lensPath(acc = 0) {
  const s = lensShape(acc);
  const top = C.y - s.half;
  const bot = C.y + s.half;
  return `M${s.equatorX.toFixed(1)} ${top.toFixed(1)} A${s.ra.toFixed(1)} ${s.ra.toFixed(1)} 0 0 0 ${s.equatorX.toFixed(1)} ${bot.toFixed(1)} A${s.rp.toFixed(1)} ${s.rp.toFixed(1)} 0 0 0 ${s.equatorX.toFixed(1)} ${top.toFixed(1)} Z`;
}

/** x de la cara anterior/posterior del cristalino a una altura h. */
export function lensXAt(h: number, acc = 0, face: 'front' | 'back' = 'front') {
  const s = lensShape(acc);
  const hh = Math.min(Math.abs(h), s.half - 1);
  if (face === 'front') return s.anteriorApex + s.ra - Math.sqrt(s.ra ** 2 - hh ** 2);
  return s.posteriorApex - s.rp + Math.sqrt(s.rp ** 2 - hh ** 2);
}

/** Iris (arriba o abajo) para un radio pupilar dado en unidades SVG. */
export function irisPath(side: -1 | 1, pupilR: number) {
  const root = C.y + side * 96;
  const margin = C.y + side * pupilR;
  const xr = IRIS_X - 8;
  const xm = IRIS_X + 4;
  return `M${xr} ${root} L${xr + 9} ${root} Q ${xm + 6} ${(root + margin) / 2} ${xm + 4} ${margin} L${xm - 3} ${margin} Q ${xm - 4} ${(root + margin) / 2} ${xr} ${root} Z`;
}

/** Cámaras con humor acuoso (anterior + posterior) para el radio pupilar dado. */
export function aqueousPath(pupilR: number, acc = 0) {
  const s = lensShape(acc);
  const ri = R_CORNEA - 6;
  const lx = LIMBUS_X + 3;
  // frente: cara interna de la córnea; fondo: iris y cara anterior del cristalino
  const lensFrontMid = s.anteriorApex;
  return [
    `M${lx.toFixed(1)} ${C.y - LIMBUS_HALF + 4}`,
    `A${ri} ${ri} 0 0 0 ${lx.toFixed(1)} ${C.y + LIMBUS_HALF - 4}`,
    `L${IRIS_X - 6} ${C.y + 94}`,
    `L${IRIS_X + 2} ${C.y + pupilR}`,
    `Q ${lensFrontMid - 2} ${C.y} ${IRIS_X + 2} ${C.y - pupilR}`,
    `L${IRIS_X - 6} ${C.y - 94}`,
    'Z',
  ].join(' ');
}

// Nervio óptico: sale ~15° hacia el lado nasal del polo posterior.
export const NERVE_DEG = 15;
export function opticNervePath() {
  const dir = { x: Math.cos(deg(NERVE_DEG)), y: Math.sin(deg(NERVE_DEG)) };
  const perp = { x: -dir.y, y: dir.x };
  const w0 = 22; // en el disco (≈ 1,8 mm de semiancho con vainas)
  const w1 = 27;
  const a = polar(NERVE_DEG, 168);
  const b = polar(NERVE_DEG, 360);
  const p = (pt: { x: number; y: number }, w: number) => `${(pt.x + perp.x * w).toFixed(1)} ${(pt.y + perp.y * w).toFixed(1)}`;
  return `M${p(a, -w0)} L${p(b, -w1)} L${p(b, w1)} L${p(a, w0)} Z`;
}
export const OPTIC_DISC = polar(NERVE_DEG, R_RETINA);
export const FOVEA = polar(0, R_RETINA - 4);

/** Longitud acumulada de una polilínea hasta una x dada (para animar rayos). */
export function lengthUntilX(pts: { x: number; y: number }[], x: number): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (b.x <= x) {
      len += seg;
      continue;
    }
    if (a.x < x) len += seg * ((x - a.x) / (b.x - a.x));
    break;
  }
  return len;
}

export const polylineLength = (pts: { x: number; y: number }[]) =>
  pts.slice(1).reduce((acc, b, i) => acc + Math.hypot(b.x - pts[i]!.x, b.y - pts[i]!.y), 0);
