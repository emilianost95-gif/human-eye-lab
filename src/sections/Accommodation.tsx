import { useState } from 'react';
import { EyeCrossSection } from '@/components/EyeCrossSection';
import { Note, Panel, Readout, SchemaTag, Section, Segmented, Slider, cx } from '@/components/ui';
import { C, FOVEA, corneaXAt, lensShape, lensXAt, ciliaryTip } from '@/lib/geometry';
import { accommodationDemandD, clamp, lerp } from '@/lib/physio';

type Pt = { x: number; y: number };
const atX = (a: Pt, b: Pt, x: number): Pt => ({ x, y: a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x) });

/** Distancia (m) desde la posición del deslizador (0–100, escala logarítmica de 0,25 m a 6 m). */
const posToDist = (p: number) => 0.25 * Math.pow(24, p / 100);
const distToPos = (d: number) => (Math.log(d / 0.25) / Math.log(24)) * 100;

const VBX = 120;
const VBW = 600;

export function Accommodation() {
  const [pos, setPos] = useState(100);
  const [locked, setLocked] = useState(false);
  const dist = posToDist(pos);
  const demand = accommodationDemandD(dist >= 5.99 ? Infinity : dist); // D
  const acc = locked ? 0 : clamp(demand / 4, 0, 1); // 4 D = acomodación usada a 25 cm
  const error = demand - acc * 4; // dioptrías no compensadas (>0: foco detrás de la retina)
  const near = dist < 1;

  // trazado de rayos esquemático
  const lens = lensShape(acc);
  const srcX = near ? lerp(VBX + 10, VBX + 150, clamp((dist - 0.25) / 0.75, 0, 1)) : VBX - 10;
  const focus: Pt = { x: FOVEA.x + error * 15, y: C.y };
  const rays = [-18, -9, 0, 9, 18].map((h) => {
    const p1 = { x: corneaXAt(h), y: C.y + h };
    const p0 = near ? { x: srcX, y: C.y } : { x: VBX - 10, y: C.y + h };
    const aim = { x: FOVEA.x + 140, y: C.y };
    const p2 = atX(p1, near ? { x: aim.x + 120, y: C.y } : aim, lensXAt(h, acc, 'front'));
    const p3 = atX(p2, focus, lensXAt(p2.y - C.y, acc, 'back'));
    const end = Math.abs(focus.x - p3.x) < 1 ? focus : atX(p3, focus, FOVEA.x);
    return [p0, p1, p2, p3, end];
  });
  const blur = Math.abs(error) * 6;
  const tipT = ciliaryTip(-1, acc);

  const verdict = Math.abs(error) < 0.15 ? 'Imagen nítida en la retina' : error > 0 ? 'Foco detrás de la retina: imagen borrosa' : 'Foco delante de la retina: imagen borrosa';

  return (
    <Section
      id="acomodacion"
      index="05"
      eyebrow="El cristalino y la acomodación"
      title="Cómo enfocamos el mundo"
      intro="Para ver nítido a distintas distancias, el ojo cambia la forma del cristalino. Elige un objeto cercano o lejano y observa al músculo ciliar, las fibras zonulares y la curvatura de la lente."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="overflow-hidden lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <Segmented
              label="Distancia del objeto"
              value={near ? 'near' : dist >= 5.99 ? 'far' : 'mid'}
              onChange={(v) => setPos(v === 'near' ? 0 : 100)}
              options={[
                { value: 'near', label: 'Objeto cercano' },
                { value: 'far', label: 'Objeto lejano' },
              ]}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-mute">
              <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} className="size-4 accent-cyan" />
              Bloquear el cristalino (sin acomodar)
            </label>
          </div>
          <div className="relative">
            <svg viewBox={`${VBX} 70 ${VBW} 380`} className="block w-full" role="img" aria-label={`Acomodación con el objeto a ${dist >= 5.99 ? 'más de 6 metros' : dist.toFixed(2) + ' metros'}. ${verdict}.`}>
              <EyeCrossSection mode="anatomic" accommodation={acc} ciliaryContraction={acc} pupilR={near ? 22 : 30} idPrefix="acc" emphasis={['cristalino']} dimOthers={false} />
              {/* objeto */}
              {near ? (
                <g>
                  <circle cx={srcX} cy={C.y} r={5} fill="#fde68a" />
                  <text x={srcX - 4} y={C.y - 14} textAnchor="start" fontSize={11} fill="#fde68a" fontFamily="Geist Mono Variable, monospace">objeto a {Math.round(dist * 100)} cm</text>
                </g>
              ) : (
                <text x={VBX + 6} y={C.y - 40} fontSize={11} fill="#fde68a" fontFamily="Geist Mono Variable, monospace">objeto lejano →</text>
              )}
              {rays.map((pts, i) => (
                <polyline key={i} points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="#fde68a" strokeWidth={1.5} strokeOpacity={0.9} style={{ filter: 'drop-shadow(0 0 3px rgba(253,230,138,.6))' }} />
              ))}
              {/* mancha en la retina */}
              <ellipse cx={FOVEA.x - 2} cy={C.y} rx={3} ry={Math.max(3, blur)} fill="#fde68a" fillOpacity={blur > 4 ? 0.35 : 0.9} />
              {Math.abs(error) >= 0.15 && <circle cx={focus.x} cy={focus.y} r={4} fill="none" stroke="#fb7185" strokeDasharray="2 2" />}
              {/* rótulos */}
              <g fontSize={11} fontFamily="Geist Variable, sans-serif" fill="#e2e8f0">
                <line x1={tipT.x - 6} y1={tipT.y - 8} x2={300} y2={98} stroke="#a78bfa" />
                <text x={296} y={96} textAnchor="end" fill="#c4b5fd">Músculo ciliar · {acc > 0.3 ? 'contraído' : 'relajado'}</text>
                <line x1={lens.equatorX - 2} y1={C.y - lens.half - 14} x2={300} y2={128} stroke="#cbd5e1" strokeOpacity={0.6} />
                <text x={296} y={126} textAnchor="end" fill="#cbd5e1">Fibras zonulares · {acc > 0.3 ? 'flojas' : 'tensas'}</text>
                <line x1={lens.posteriorApex} y1={C.y + 40} x2={lens.posteriorApex + 50} y2={C.y + 120} stroke="#a5b4fc" />
                <text x={lens.posteriorApex + 54} y={C.y + 124} fill="#c7d2fe">Cristalino · {acc > 0.3 ? 'más curvo' : 'aplanado'}</text>
              </g>
            </svg>
            <div className="pointer-events-none absolute bottom-3 left-4">
              <SchemaTag>Esquema · deformación exagerada para que sea visible</SchemaTag>
            </div>
          </div>
          <div className="border-t border-line px-4 py-4 sm:px-6">
            <Slider
              id="dist"
              label="Distancia del objeto"
              min={0}
              max={100}
              value={pos}
              onChange={setPos}
              valueText={dist >= 5.99 ? '≥ 6 m (≈ infinito óptico)' : dist < 1 ? `${Math.round(dist * 100)} cm` : `${dist.toFixed(1)} m`}
            />
            <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-mute">
              <button type="button" onClick={() => setPos(0)} className="hover:text-cyan">25 cm</button>
              <button type="button" onClick={() => setPos(distToPos(1))} className="hover:text-cyan">1 m</button>
              <button type="button" onClick={() => setPos(100)} className="hover:text-cyan">6 m</button>
            </div>
          </div>
        </Panel>

        <div className="space-y-6 lg:col-span-4">
          <Panel className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <Readout label="Demanda" value={demand.toFixed(1)} unit="D" />
              <Readout label="Acomodación" value={(acc * 4).toFixed(1)} unit="D" accent />
            </div>
            <p className={cx('mt-5 rounded-lg px-3 py-2 text-sm', Math.abs(error) < 0.15 ? 'bg-cyan/10 text-cyan' : 'bg-tissue/10 text-rose-200')} aria-live="polite">
              {verdict}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-mute">Demanda de acomodación = 1 / distancia (m). Un objeto a 25 cm exige 4 dioptrías extra; uno a 6 m o más, prácticamente 0.</p>
          </Panel>
          <Panel className="p-6 text-sm leading-relaxed">
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold text-ink">Visión lejana</dt>
                <dd className="mt-1 text-mute">El músculo ciliar se relaja, el anillo que forma se agranda y las zónulas quedan tensas: tiran del cristalino y lo aplanan. Menor potencia.</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Visión cercana</dt>
                <dd className="mt-1 text-mute">El músculo ciliar se contrae, el anillo se estrecha y las zónulas se aflojan: el cristalino, elástico, se vuelve más curvo. Mayor potencia.</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Enfoque</dt>
                <dd className="mt-1 text-mute">Una imagen es nítida cuando los rayos de cada punto del objeto convergen exactamente sobre la retina.</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Acomodación</dt>
                <dd className="mt-1 text-mute">Es el ajuste automático de la potencia del cristalino. Al mirar de cerca se acompaña de convergencia de los ojos y de contracción de la pupila.</dd>
              </div>
            </dl>
          </Panel>
          <Note>Con la edad el cristalino pierde elasticidad y la acomodación disminuye: es la presbicia, que suele notarse a partir de los 40–45 años.</Note>
        </div>
      </div>
    </Section>
  );
}
