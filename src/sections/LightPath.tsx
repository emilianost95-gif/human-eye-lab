import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { EyeCrossSection } from '@/components/EyeCrossSection';
import { IconButton, Panel, SchemaTag, Section, cx } from '@/components/ui';
import { C, FOVEA, IRIS_X, NERVE_DEG, VB, corneaXAt, lengthUntilX, lensXAt, polar, polylineLength } from '@/lib/geometry';
import { LIGHT_STEPS } from '@/data/lightPath';
import { useReducedMotion } from '@/lib/hooks';

type Pt = { x: number; y: number };
const PUPIL_R = 30;

/** Punto de la recta a→b con abscisa x. */
const atX = (a: Pt, b: Pt, x: number): Pt => ({ x, y: a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x) });

function buildRays() {
  const far = { x: C.x + 290, y: C.y }; // foco tras la córnea sola (quedaría detrás de la retina)
  const rays: { pts: Pt[]; blocked: boolean }[] = [];
  for (const h of [-74, -52, -24, -12, 0, 12, 24, 52, 74]) {
    const p0 = { x: 30, y: C.y + h };
    const p1 = { x: corneaXAt(h), y: C.y + h };
    if (Math.abs(h) > PUPIL_R) {
      rays.push({ pts: [p0, p1, atX(p1, far, IRIS_X - 2)], blocked: true });
      continue;
    }
    const p2 = atX(p1, far, lensXAt(h, 0, 'front'));
    const mid = { x: FOVEA.x + 30, y: C.y };
    const p3 = atX(p2, mid, lensXAt(p2.y - C.y, 0, 'back'));
    rays.push({ pts: [p0, p1, p2, p3, { x: FOVEA.x, y: FOVEA.y }], blocked: false });
  }
  return rays;
}

const STEP_MS = 5200;

export function LightPath() {
  const [step, setStep] = useState(0); // índice 0–8
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const rays = useMemo(buildRays, []);
  const s = LIGHT_STEPS[step]!;

  useEffect(() => {
    if (!playing) return;
    if (step >= LIGHT_STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((x) => x + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, step]);

  const nervePath = `M${polar(NERVE_DEG, 175).x} ${polar(NERVE_DEG, 175).y} L${polar(NERVE_DEG, 355).x} ${polar(NERVE_DEG, 355).y}`;
  const transition = reduced ? 'none' : 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)';

  return (
    <Section
      id="vision"
      index="03"
      eyebrow="Cómo funciona la visión"
      title="De la luz a la imagen"
      intro="Sigue el recorrido de la luz paso a paso: desde que entra en el ojo hasta que el cerebro construye lo que vemos. Distinguimos qué es óptica, qué es anatomía, qué es fisiología y qué ocurre en el cerebro."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="overflow-hidden lg:col-span-8">
          <div className="relative">
            <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="block w-full" role="img" aria-label={`Animación del recorrido de la luz. Paso ${s.n}: ${s.title}`}>
              <EyeCrossSection mode="anatomic" emphasis={s.emphasis} pupilR={PUPIL_R} idPrefix="lp" dimOthers={s.n <= 8} />
              {/* fuente de luz lejana */}
              <g fontFamily="Geist Mono Variable, monospace" fontSize={11} fill="#fde68a">
                <text x={30} y={C.y - 96}>LUZ DE UN OBJETO LEJANO</text>
                <text x={30} y={C.y - 82} fill="#94a3b8">rayos ≈ paralelos</text>
              </g>
              {rays.map((r, i) => {
                const L = polylineLength(r.pts);
                const shown = Math.min(L, lengthUntilX(r.pts, s.reachX));
                return (
                  <g key={i}>
                    <polyline
                      points={r.pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                      fill="none"
                      stroke={r.blocked ? '#fbbf24' : '#fde68a'}
                      strokeOpacity={r.blocked ? 0.55 : 0.95}
                      strokeWidth={r.blocked ? 1.4 : 1.8}
                      strokeDasharray={L}
                      strokeDashoffset={L - shown}
                      style={{ transition, filter: 'drop-shadow(0 0 4px rgba(253,230,138,0.7))' }}
                    />
                    {r.blocked && s.n >= 3 && (
                      <circle cx={r.pts[2]!.x} cy={r.pts[2]!.y} r={3} fill="#fbbf24">
                        <title>Rayo bloqueado por el iris</title>
                      </circle>
                    )}
                  </g>
                );
              })}
              {/* punto de enfoque en la fóvea */}
              {s.n >= 6 && (
                <g>
                  <circle cx={FOVEA.x} cy={FOVEA.y} r={s.n === 7 ? 14 : 7} fill="#fde68a" fillOpacity={0.35} style={{ transition: 'r 0.6s' }} />
                  <circle cx={FOVEA.x} cy={FOVEA.y} r={3.5} fill="#fff7d6" />
                </g>
              )}
              {/* impulsos por el nervio óptico */}
              {s.n >= 8 && (
                <g>
                  <path d={nervePath} stroke="#fbbf24" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="4 6" fill="none" />
                  {!reduced &&
                    [0, 0.5, 1].map((d) => (
                      <circle key={d} r={4.5} fill="#22d3ee">
                        <animateMotion dur="1.5s" begin={`${d}s`} repeatCount="indefinite" path={nervePath} />
                      </circle>
                    ))}
                  <text x={polar(NERVE_DEG, 355).x - 4} y={polar(NERVE_DEG, 355).y + 40} textAnchor="end" fontSize={12} fill="#22d3ee" fontFamily="Geist Mono Variable, monospace">
                    → hacia el cerebro
                  </text>
                </g>
              )}
            </svg>
            <div className="pointer-events-none absolute right-4 top-3">
              <SchemaTag>Esquema · trayectorias simplificadas</SchemaTag>
            </div>
          </div>

          {/* controles */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-3">
            <div className="flex items-center gap-1.5" role="toolbar" aria-label="Controles de la animación">
              <IconButton label={playing ? 'Pausar' : 'Reproducir'} onClick={() => (step >= 8 && !playing ? (setStep(0), setPlaying(true)) : setPlaying((p) => !p))} aria-pressed={playing}>
                {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              </IconButton>
              <IconButton label="Reiniciar" onClick={() => (setPlaying(false), setStep(0))}>
                <RotateCcw className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Paso anterior" onClick={() => (setPlaying(false), setStep((x) => Math.max(0, x - 1)))} disabled={step === 0}>
                <ChevronLeft className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Paso siguiente" onClick={() => (setPlaying(false), setStep((x) => Math.min(8, x + 1)))} disabled={step === 8}>
                <ChevronRight className="size-4" aria-hidden="true" />
              </IconButton>
            </div>
            <ol className="flex items-center gap-1" aria-label="Ir a un paso">
              {LIGHT_STEPS.map((l, i) => (
                <li key={l.n}>
                  <button
                    type="button"
                    onClick={() => (setPlaying(false), setStep(i))}
                    aria-label={`Paso ${l.n}: ${l.title}`}
                    aria-current={i === step ? 'step' : undefined}
                    className="group grid h-8 w-6 place-items-center sm:w-8"
                  >
                    <span className={cx('block h-1 rounded-full transition-all duration-500', i === step ? 'w-6 bg-cyan' : i < step ? 'w-3 bg-science/60' : 'w-3 bg-mute/30 group-hover:bg-mute')} />
                  </button>
                </li>
              ))}
            </ol>
          </div>
          {playing && (
            <div className="h-0.5 bg-line" aria-hidden="true">
              <div key={step} className="h-full origin-left bg-cyan" style={{ animation: reduced ? 'none' : `grow ${STEP_MS}ms linear forwards` }} />
            </div>
          )}
        </Panel>

        <Panel className="p-6 lg:col-span-4">
          <div key={s.n} className="animate-[fadein_0.5s_ease]" aria-live="polite">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-cyan">PASO {String(s.n).padStart(2, '0')} / 09</span>
              <span className="rounded-full border border-warn/40 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-warn">{s.domain}</span>
            </div>
            <h3 className="display mt-4 text-3xl">{s.title}</h3>
            <p className="mt-4 leading-relaxed text-ink/90">{s.text}</p>
            <p className="mt-3 text-sm leading-relaxed text-mute">{s.detail}</p>
            {s.n === 7 && <RetinaLayers />}
            {s.n >= 8 && <VisualPathway highlight={s.n === 9 ? 'cortex' : 'nerve'} />}
          </div>
        </Panel>
      </div>
    </Section>
  );
}

/** Detalle esquemático: la luz atraviesa las capas internas antes de llegar a los fotorreceptores. */
function RetinaLayers() {
  const layers = [
    { y: 18, label: 'Células ganglionares', c: '#22d3ee' },
    { y: 50, label: 'Bipolares (y horizontales, amacrinas)', c: '#818cf8' },
    { y: 84, label: 'Conos y bastones', c: '#fb7185' },
    { y: 116, label: 'Epitelio pigmentario', c: '#9f3a4b' },
  ];
  return (
    <figure className="mt-6 rounded-xl border border-line bg-void/50 p-3">
      <svg viewBox="0 0 300 136" className="w-full" role="img" aria-label="Capas de la retina: la luz entra por las células ganglionares y llega a los fotorreceptores; la señal vuelve hacia las ganglionares">
        {layers.map((l) => (
          <g key={l.y}>
            <rect x={70} y={l.y - 10} width={220} height={22} rx={4} fill={l.c} fillOpacity={0.14} stroke={l.c} strokeOpacity={0.4} />
            <text x={78} y={l.y + 5} fontSize={10} fill="#e2e8f0" fontFamily="Geist Variable, sans-serif">{l.label}</text>
          </g>
        ))}
        <g stroke="#fde68a" strokeWidth={2} fill="#fde68a">
          <line x1={22} y1={0} x2={22} y2={80} />
          <path d="M16 76 L22 88 L28 76 Z" />
        </g>
        <text x={8} y={110} fontSize={9} fill="#fde68a" fontFamily="Geist Mono Variable, monospace">LUZ</text>
        <g stroke="#22d3ee" strokeWidth={2} fill="#22d3ee">
          <line x1={50} y1={84} x2={50} y2={14} />
          <path d="M44 18 L50 6 L56 18 Z" />
        </g>
        <text x={34} y={132} fontSize={9} fill="#22d3ee" fontFamily="Geist Mono Variable, monospace">SEÑAL</text>
      </svg>
      <figcaption className="mt-1 text-xs text-mute">Esquema de capas (no a escala). La señal viaja en sentido contrario a la luz.</figcaption>
    </figure>
  );
}

/** Vía visual vista desde arriba: ojos → nervios → quiasma → tracto → NGL → radiaciones → V1. */
export function VisualPathway({ highlight }: { highlight: 'nerve' | 'cortex' }) {
  const on = (k: 'nerve' | 'cortex') => (highlight === k ? 1 : 0.45);
  return (
    <figure className="mt-6 rounded-xl border border-line bg-void/50 p-3">
      <svg viewBox="0 0 300 250" className="w-full" role="img" aria-label="Vía visual vista desde arriba: nervios ópticos, quiasma, tractos ópticos, núcleo geniculado lateral, radiaciones ópticas y corteza visual primaria en el lóbulo occipital">
        <ellipse cx={150} cy={125} rx={118} ry={118} fill="#111827" stroke="#334155" />
        <text x={150} y={22} textAnchor="middle" fontSize={8.5} fill="#94a3b8" fontFamily="Geist Mono Variable, monospace">FRENTE</text>
        <text x={150} y={238} textAnchor="middle" fontSize={8.5} fill="#94a3b8" fontFamily="Geist Mono Variable, monospace">NUCA (OCCIPITAL)</text>
        {/* ojos */}
        {[110, 190].map((x) => (
          <g key={x}>
            <circle cx={x} cy={38} r={13} fill="#e2e8f0" />
            <circle cx={x} cy={30} r={5} fill="#3d6f87" />
          </g>
        ))}
        <g fill="none" strokeLinecap="round" strokeWidth={3}>
          {/* fibras temporales: no cruzan · fibras nasales: cruzan en el quiasma */}
          <path d="M110 50 Q 146 92 112 132 M190 50 Q 154 92 188 132" stroke="#fbbf24" opacity={on('nerve')} />
          <path d="M110 50 L188 132 M190 50 L112 132" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 3" opacity={on('nerve')} />
          <path d="M112 132 Q 92 170 110 205 M188 132 Q 208 170 190 205" stroke="#22d3ee" opacity={on('cortex')} />
        </g>
        <circle cx={150} cy={92} r={5} fill="#fbbf24" />
        {[112, 188].map((x) => (
          <ellipse key={x} cx={x} cy={134} rx={9} ry={6} fill="#818cf8" />
        ))}
        {[118, 182].map((x) => (
          <ellipse key={x} cx={x} cy={214} rx={26} ry={12} fill="#22d3ee" fillOpacity={0.25 + 0.5 * on('cortex')} stroke="#22d3ee" />
        ))}
        <g fontSize={9} fill="#e2e8f0" fontFamily="Geist Variable, sans-serif">
          <text x={160} y={88}>Quiasma óptico</text>
          <text x={198} y={70} fill="#fbbf24">Nervio óptico</text>
          <text x={200} y={137}>NGL (tálamo)</text>
          <text x={214} y={176} fill="#22d3ee">Radiaciones</text>
          <text x={150} y={196} textAnchor="middle" fill="#22d3ee">Corteza visual primaria (V1)</text>
        </g>
      </svg>
      <figcaption className="mt-1 text-xs text-mute">Esquema de la vía visual, vista superior (no a escala). Línea continua: fibras de la retina temporal (no cruzan). Discontinua: fibras de la retina nasal (cruzan en el quiasma).</figcaption>
    </figure>
  );
}
