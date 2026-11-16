import { useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Panel, Readout, SchemaTag, Section, Slider, cx } from '@/components/ui';
import { pupilAreaMm2, pupilDiameterMm, sceneFor, sliderToLuminance } from '@/lib/physio';

const IRIS_MM = 12; // diámetro visible del iris ≈ 11,5–12 mm
const PX = 200 / (IRIS_MM / 2); // radio del iris = 200 unidades

function formatLum(l: number) {
  if (l < 0.01) return l.toExponential(0).replace('e', '×10^');
  if (l < 10) return l.toFixed(2);
  return Math.round(l).toLocaleString('es');
}

export function Pupil() {
  const [pos, setPos] = useState(45);
  const L = sliderToLuminance(pos);
  const d = pupilDiameterMm(L);
  const scene = sceneFor(L);
  const area = pupilAreaMm2(d);
  const maxArea = pupilAreaMm2(pupilDiameterMm(1e-4));
  const bright = pos / 100;
  // tendencia: cuál músculo domina respecto del tamaño medio (~4,9 mm)
  const mode = d < 4.6 ? 'sphincter' : d > 5.2 ? 'dilator' : 'balance';

  const fibers = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => {
        const a = (i / 90) * Math.PI * 2;
        return { a, w: 0.6 + ((i * 37) % 7) / 7 };
      }),
    [],
  );
  const pr = (d / 2) * PX;

  return (
    <Section
      id="pupila"
      index="04"
      eyebrow="Iris y pupila"
      title="El sistema de regulación de la luz"
      intro="Mueve el control de iluminación y observa en tiempo real cómo responde la pupila. El tamaño se calcula con un modelo publicado de diámetro pupilar en función de la luminancia (Moon & Spencer, 1944; Watson & Yellott, 2012)."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="relative overflow-hidden lg:col-span-7">
          {/* el fondo del panel imita la luz ambiente */}
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-[background] duration-700"
            style={{ background: `radial-gradient(circle at 50% 40%, rgba(253,246,220,${0.04 + bright * 0.55}), rgba(8,11,18,${1 - bright * 0.55}) 75%)` }}
          />
          <div className="relative p-4 sm:p-8">
            <div className="flex items-center justify-between">
              <SchemaTag>Vista frontal · esquema</SchemaTag>
              <span className="font-mono text-xs text-mute">{scene.label}</span>
            </div>
            <svg viewBox="-260 -230 520 460" className="mx-auto mt-2 block w-full max-w-[520px]" role="img" aria-label={`Iris visto de frente. Diámetro pupilar ${d.toFixed(1)} milímetros.`}>
              <defs>
                <radialGradient id="pu-iris">
                  <stop offset="0" stopColor="#3b2a1c" />
                  <stop offset="0.35" stopColor="#6b5a3a" />
                  <stop offset="0.5" stopColor="#4f7b8a" />
                  <stop offset="0.92" stopColor="#2b5670" />
                  <stop offset="1" stopColor="#0d1824" />
                </radialGradient>
              </defs>
              <circle r={226} fill="#e9edf2" fillOpacity={0.9} />
              <circle r={200} fill="url(#pu-iris)" />
              {/* músculo dilatador: fibras radiales */}
              <g opacity={mode === 'dilator' ? 1 : 0.35} className="transition-opacity duration-500">
                {fibers.map((f) => (
                  <line
                    key={f.a}
                    x1={Math.cos(f.a) * (pr + 26)}
                    y1={Math.sin(f.a) * (pr + 26)}
                    x2={Math.cos(f.a) * 192}
                    y2={Math.sin(f.a) * 192}
                    stroke={mode === 'dilator' ? '#22d3ee' : '#a5d8e6'}
                    strokeOpacity={0.55}
                    strokeWidth={f.w}
                    style={{ transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                  />
                ))}
              </g>
              {/* músculo esfínter: anillo circular junto al borde pupilar */}
              <circle
                r={pr + 14}
                fill="none"
                stroke={mode === 'sphincter' ? '#fbbf24' : '#c8a46a'}
                strokeOpacity={mode === 'sphincter' ? 0.95 : 0.4}
                strokeWidth={mode === 'sphincter' ? 14 : 9}
                strokeDasharray="3 2"
                style={{ transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
              />
              <circle r={pr} fill="#020203" style={{ transition: 'r 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
              <ellipse cx={-pr * 0.35 - 30} cy={-pr * 0.4 - 30} rx={22} ry={14} fill="#fff" fillOpacity={0.55} />
              {/* cotas */}
              <g stroke="#22d3ee" strokeWidth={1.5}>
                <line x1={-pr} y1={pr + 50} x2={pr} y2={pr + 50} style={{ transition: 'all 0.8s' }} />
                <line x1={-pr} y1={pr + 42} x2={-pr} y2={pr + 58} style={{ transition: 'all 0.8s' }} />
                <line x1={pr} y1={pr + 42} x2={pr} y2={pr + 58} style={{ transition: 'all 0.8s' }} />
              </g>
              <text x={0} y={pr + 76} textAnchor="middle" fill="#22d3ee" fontSize={16} fontFamily="Geist Mono Variable, monospace" style={{ transition: 'all 0.8s' }}>
                Ø {d.toFixed(1)} mm
              </text>
            </svg>

            <div className="mt-4 flex items-center gap-3">
              <Moon className="size-5 shrink-0 text-violet" aria-hidden="true" />
              <Slider
                id="luz"
                label="Intensidad lumínica del ambiente"
                value={pos}
                min={0}
                max={100}
                onChange={setPos}
                valueText={`${formatLum(L)} cd/m² · ${scene.label}`}
                className="flex-1"
              />
              <Sun className="size-5 shrink-0 text-warn" aria-hidden="true" />
            </div>
          </div>
        </Panel>

        <div className="space-y-6 lg:col-span-5">
          <Panel className="grid grid-cols-2 gap-6 p-6">
            <Readout label="Diámetro pupilar" value={d.toFixed(1)} unit="mm" accent />
            <Readout label="Área de la pupila" value={area.toFixed(1)} unit="mm²" />
            <Readout label="Luz que entra vs. máx." value={`${Math.round((area / maxArea) * 100)}`} unit="%" />
            <Readout label="Respuesta" value={mode === 'sphincter' ? 'Miosis' : mode === 'dilator' ? 'Midriasis' : 'Intermedia'} />
          </Panel>

          <Panel className="p-6">
            <h3 className="text-lg font-semibold tracking-tight">Qué está pasando</h3>
            <p className="mt-2 text-sm text-mute">{scene.detail}</p>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed">
              <li className={cx('rounded-xl border p-4 transition-colors', mode === 'sphincter' ? 'border-warn/50 bg-warn/5' : 'border-line')}>
                <strong className="text-warn">Esfínter de la pupila · fibras circulares.</strong>{' '}
                <span className="text-mute">Con más luz, el sistema nervioso parasimpático (a través del nervio oculomotor) lo contrae y la pupila se achica: <em>miosis</em>.</span>
              </li>
              <li className={cx('rounded-xl border p-4 transition-colors', mode === 'dilator' ? 'border-cyan/50 bg-cyan/5' : 'border-line')}>
                <strong className="text-cyan">Dilatador de la pupila · fibras radiales.</strong>{' '}
                <span className="text-mute">En la oscuridad, la actividad simpática lo contrae y la pupila se agranda: <em>midriasis</em>.</span>
              </li>
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-mute">
              Es un <strong className="text-ink">reflejo automático</strong> (reflejo fotomotor): la retina detecta la luz y el tronco encefálico ajusta ambos ojos a la vez. La pupila solo cambia la luz que entra unas 16 veces, mientras que la luz del ambiente varía miles de millones de veces: el resto de la adaptación ocurre en los propios fotorreceptores.
            </p>
          </Panel>
        </div>
      </div>
    </Section>
  );
}
