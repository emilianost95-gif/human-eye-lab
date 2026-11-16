import { useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Panel, Readout, SchemaTag, Section, Segmented, Slider } from '@/components/ui';
import { BLIND_SPOT_DEG, coneDensity, rodDensity } from '@/lib/physio';

type Light = 'dim' | 'day';

const WIN_AREA = 0.0015; // mm² representados en la ventana de mosaico
const CHART = { x0: 44, x1: 584, y0: 18, y1: 200, w: 600, h: 236 };
const ECC_MAX = 40;
const DENS_MAX = 200_000;

const inBlind = (e: number) => e >= BLIND_SPOT_DEG.from && e <= BLIND_SPOT_DEG.to;
const cones = (e: number) => (inBlind(e) ? 0 : coneDensity(e));
const rods = (e: number) => (inBlind(e) ? 0 : rodDensity(e));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

interface Cell {
  x: number;
  y: number;
  r: number;
  kind: 'rod' | 'L' | 'M' | 'S';
}

/** Mosaico aproximado: muestreo por «lanzamiento de dardos» con distancia mínima. */
function buildMosaic(ecc: number): Cell[] {
  const nC = Math.round(cones(ecc) * WIN_AREA);
  const nR = Math.round(rods(ecc) * WIN_AREA);
  const size = 300;
  const total = nC + nR;
  if (!total) return [];
  const r = rng(Math.round(ecc * 10) + 11);
  const cells: Cell[] = [];
  // los conos se engrosan fuera de la fóvea
  const coneR = Math.min(13, 6 + Math.abs(ecc) * 0.9);
  const rodR = 4.2;
  const place = (n: number, rad: number, make: (i: number) => Cell['kind']) => {
    let tries = 0;
    let placed = 0;
    while (placed < n && tries < n * 60) {
      tries++;
      const x = rad + r() * (size - 2 * rad);
      const y = rad + r() * (size - 2 * rad);
      if (cells.some((c) => (c.x - x) ** 2 + (c.y - y) ** 2 < (c.r + rad + 0.6) ** 2)) continue;
      cells.push({ x, y, r: rad, kind: make(placed) });
      placed++;
    }
  };
  if (nR === 0 && nC > 0) {
    // fóvea central: conos densamente empaquetados en un mosaico casi hexagonal
    const spacing = Math.sqrt((2 * size * size) / (Math.sqrt(3) * nC));
    const rad = spacing * 0.46;
    let row = 0;
    for (let y = rad; y < size - rad / 2; y += (spacing * Math.sqrt(3)) / 2, row++) {
      for (let x = rad + (row % 2 ? spacing / 2 : 0); x < size - rad / 2; x += spacing) {
        const v = r();
        cells.push({ x: x + (r() - 0.5) * spacing * 0.12, y: y + (r() - 0.5) * spacing * 0.12, r: rad, kind: Math.abs(ecc) < 0.4 ? (v < 0.66 ? 'L' : 'M') : v < 0.05 ? 'S' : v < 0.68 ? 'L' : 'M' });
      }
    }
    return cells;
  }
  const fovealR = Math.max(4.6, Math.min(coneR, Math.sqrt((size * size) / Math.max(nC, 1) / Math.PI) * 0.7));
  // proporción típica: ~5–10 % conos S; L:M ≈ 2:1 (varía entre personas)
  place(nC, Math.abs(ecc) < 1.5 ? fovealR : coneR, () => {
    const v = r();
    return Math.abs(ecc) < 0.4 ? (v < 0.66 ? 'L' : 'M') : v < 0.07 ? 'S' : v < 0.69 ? 'L' : 'M';
  });
  place(nR, rodR, () => 'rod');
  return cells;
}

const CONE_COL = { L: '#f87171', M: '#4ade80', S: '#60a5fa' } as const;

export function Retina() {
  const [ecc, setEcc] = useState(0);
  const [light, setLight] = useState<Light>('day');
  const chartRef = useRef<SVGSVGElement>(null);
  const cells = useMemo(() => buildMosaic(ecc), [ecc]);
  const blind = inBlind(ecc);

  const xOf = (e: number) => CHART.x0 + ((e + ECC_MAX) / (2 * ECC_MAX)) * (CHART.x1 - CHART.x0);
  const yOf = (d: number) => CHART.y1 - (Math.min(d, DENS_MAX) / DENS_MAX) * (CHART.y1 - CHART.y0);
  const curve = (fn: (e: number) => number) => {
    const pts: string[] = [];
    for (let e = -ECC_MAX; e <= ECC_MAX; e += 0.25) pts.push(`${xOf(e).toFixed(1)},${yOf(fn(e)).toFixed(1)}`);
    return pts.join(' ');
  };

  const pickFromPointer = (e: RPointerEvent<SVGSVGElement>) => {
    const svg = chartRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CHART.w;
    const v = ((x - CHART.x0) / (CHART.x1 - CHART.x0)) * 2 * ECC_MAX - ECC_MAX;
    setEcc(Math.round(Math.max(-ECC_MAX, Math.min(ECC_MAX, v)) * 2) / 2);
  };

  const where = blind ? 'Disco óptico (punto ciego)' : Math.abs(ecc) < 1 ? 'Fóvea' : Math.abs(ecc) < 8 ? 'Mácula' : 'Retina periférica';

  return (
    <Section
      id="retina"
      index="06"
      eyebrow="La retina: donde comienza la visión"
      title="Millones de receptores capturan la luz"
      intro="La retina humana tiene unos 90–120 millones de bastones y unos 4–6 millones de conos, repartidos de forma muy desigual. Recorre la retina desde la fóvea hacia la periferia y cambia la iluminación para ver quién trabaja en cada caso."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-4 sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">Densidad de fotorreceptores</h3>
            <SchemaTag>Curvas aproximadas · Østerberg 1935, Curcio 1990</SchemaTag>
          </div>
          <svg
            ref={chartRef}
            viewBox={`0 0 ${CHART.w} ${CHART.h}`}
            className="mt-4 block w-full cursor-crosshair touch-none"
            role="img"
            aria-label="Gráfico de densidad de conos y bastones según la distancia a la fóvea. Haz clic para elegir una posición."
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              pickFromPointer(e);
            }}
            onPointerMove={(e) => e.buttons && pickFromPointer(e)}
          >
            {[0, 50_000, 100_000, 150_000, 200_000].map((d) => (
              <g key={d}>
                <line x1={CHART.x0} x2={CHART.x1} y1={yOf(d)} y2={yOf(d)} stroke="#1f2a3d" />
                <text x={CHART.x0 - 6} y={yOf(d) + 3} textAnchor="end" fontSize={9} fill="#94a3b8" fontFamily="Geist Mono Variable, monospace">{d / 1000}k</text>
              </g>
            ))}
            <rect x={xOf(BLIND_SPOT_DEG.from)} y={CHART.y0} width={xOf(BLIND_SPOT_DEG.to) - xOf(BLIND_SPOT_DEG.from)} height={CHART.y1 - CHART.y0} fill="#fbbf24" fillOpacity={0.12} />
            <text x={xOf(15)} y={CHART.y0 + 12} textAnchor="middle" fontSize={9} fill="#fbbf24" fontFamily="Geist Mono Variable, monospace">punto ciego</text>
            <polyline points={curve(rods)} fill="none" stroke="#818cf8" strokeWidth={2} />
            <polyline points={curve(cones)} fill="none" stroke="#22d3ee" strokeWidth={2} />
            {[-40, -20, 0, 20, 40].map((t) => (
              <text key={t} x={xOf(t)} y={CHART.y1 + 16} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="Geist Mono Variable, monospace">{Math.abs(t)}°</text>
            ))}
            <text x={CHART.x0} y={CHART.h - 6} fontSize={9} fill="#94a3b8" fontFamily="Geist Mono Variable, monospace">← TEMPORAL</text>
            <text x={CHART.x1} y={CHART.h - 6} textAnchor="end" fontSize={9} fill="#94a3b8" fontFamily="Geist Mono Variable, monospace">NASAL →</text>
            <text x={xOf(0)} y={CHART.h - 6} textAnchor="middle" fontSize={9} fill="#fde68a" fontFamily="Geist Mono Variable, monospace">fóvea</text>
            <line x1={xOf(ecc)} x2={xOf(ecc)} y1={CHART.y0} y2={CHART.y1} stroke="#f8fafc" strokeDasharray="3 3" />
            <circle cx={xOf(ecc)} cy={yOf(cones(ecc))} r={4} fill="#22d3ee" />
            <circle cx={xOf(ecc)} cy={yOf(rods(ecc))} r={4} fill="#818cf8" />
          </svg>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-mute">
            <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-cyan" />Conos / mm²</span>
            <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-violet" />Bastones / mm²</span>
          </div>
          <Slider id="ecc" className="mt-6" label="Posición en la retina (excentricidad)" min={-40} max={40} step={0.5} value={ecc} onChange={setEcc} valueText={`${Math.abs(ecc)}° ${ecc < 0 ? 'temporal' : ecc > 0 ? 'nasal' : ''} · ${where}`} />
          <p className="mt-4 text-sm leading-relaxed text-mute">
            Haz clic o arrastra sobre el gráfico para elegir una posición. Los conos se concentran en un pico estrecho en la fóvea; los bastones faltan en su centro y alcanzan su máximo a unos 20°. En el disco óptico (lado nasal) no hay ninguno de los dos.
          </p>
        </Panel>

        <Panel className="p-4 sm:p-6 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">Mosaico · {where}</h3>
            <Segmented
              label="Iluminación"
              value={light}
              onChange={setLight}
              options={[
                { value: 'dim', label: 'Luz tenue' },
                { value: 'day', label: 'Luz diurna' },
              ]}
            />
          </div>
          <div className="relative mt-4 aspect-square overflow-hidden rounded-xl border border-line bg-[#0b0710]">
            <svg viewBox="0 0 300 300" className="size-full" role="img" aria-label={`Mosaico de fotorreceptores en ${where}: ${cells.filter((c) => c.kind !== 'rod').length} conos y ${cells.filter((c) => c.kind === 'rod').length} bastones representados.`}>
              {cells.map((c, i) =>
                c.kind === 'rod' ? (
                  <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={light === 'dim' ? '#c7d2fe' : '#3b3f5c'} fillOpacity={light === 'dim' ? 0.95 : 0.6} style={{ transition: 'fill 0.6s' }} />
                ) : (
                  <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={light === 'day' ? CONE_COL[c.kind] : '#1f2937'} fillOpacity={light === 'day' ? 0.85 : 0.9} stroke={CONE_COL[c.kind]} strokeOpacity={light === 'day' ? 0 : 0.35} style={{ transition: 'fill 0.6s' }} />
                ),
              )}
            </svg>
            {blind && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <p className="text-sm text-amber-100">
                  <strong className="block text-base text-warn">Sin fotorreceptores</strong>
                  Aquí salen los axones que forman el nervio óptico. La luz que cae en este punto no se detecta.
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Readout label="Conos / mm²" value={Math.round(cones(ecc)).toLocaleString('es')} accent />
            <Readout label="Bastones / mm²" value={Math.round(rods(ecc)).toLocaleString('es')} />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-mute">
            {light === 'dim'
              ? 'Con poca luz solo los bastones responden (visión escotópica): vemos formas y movimiento, pero sin color. Por eso de noche distinguimos mejor un objeto tenue mirando un poco «de costado».'
              : 'Con luz diurna trabajan los conos (visión fotópica); los bastones quedan saturados. Los colores representan los conos L (rojo), M (verde) y S (azul), sensibles a ondas largas, medias y cortas.'}{' '}
            Mosaico ilustrativo de ~0,0015 mm²: las proporciones siguen las curvas, no las posiciones reales.
          </p>
        </Panel>
      </div>

      {/* comparación */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Panel className="overflow-x-auto lg:col-span-7">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Comparación entre bastones y conos</caption>
            <thead>
              <tr className="border-b border-line font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mute">
                <th scope="col" className="px-5 py-4 font-normal">Característica</th>
                <th scope="col" className="px-5 py-4 font-normal text-violet">Bastones</th>
                <th scope="col" className="px-5 py-4 font-normal text-cyan">Conos</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-5 [&_td]:py-3.5 [&_th]:px-5 [&_th]:py-3.5 [&_tr]:border-b [&_tr]:border-line/60">
              <tr><th scope="row" className="font-medium">Cantidad aproximada</th><td>~90–120 millones</td><td>~4–6 millones</td></tr>
              <tr><th scope="row" className="font-medium">Sensibilidad</th><td>Muy alta: responden con muy poca luz</td><td>Menor: necesitan buena iluminación</td></tr>
              <tr><th scope="row" className="font-medium">Tipo de visión</th><td>Nocturna (escotópica)</td><td>Diurna (fotópica)</td></tr>
              <tr><th scope="row" className="font-medium">Color</th><td>No distinguen colores (un solo pigmento: rodopsina)</td><td>Visión del color (tres tipos: L, M y S)</td></tr>
              <tr><th scope="row" className="font-medium">Agudeza</th><td>Baja: muchos bastones comparten una vía hacia el cerebro</td><td>Alta, máxima en la fóvea</td></tr>
              <tr><th scope="row" className="font-medium">Dónde abundan</th><td>Periferia; ausentes en el centro de la fóvea</td><td>Concentrados en la fóvea</td></tr>
            </tbody>
          </table>
        </Panel>
        <div className="grid gap-4 lg:col-span-5">
          {[
            { t: 'Mácula', c: 'text-warn', d: 'Zona central de la retina, de unos 5–6 mm de diámetro, con pigmento amarillento. Es responsable de la visión central detallada (leer, reconocer caras).', e: 3 },
            { t: 'Fóvea', c: 'text-cyan', d: 'Pequeña depresión en el centro de la mácula (~1,5 mm). Su centro solo tiene conos muy juntos y las demás capas se apartan para que la luz llegue directo: máxima agudeza.', e: 0 },
            { t: 'Punto ciego', c: 'text-tissue', d: 'El disco óptico, ~15° hacia el lado nasal de la fóvea, donde sale el nervio óptico. No tiene fotorreceptores; el cerebro «rellena» el hueco y por eso no lo notamos.', e: 15 },
          ].map((x) => (
            <button key={x.t} type="button" onClick={() => setEcc(x.e)} className="glass rounded-2xl p-5 text-left transition-colors hover:border-cyan/40">
              <span className={`text-base font-semibold ${x.c}`}>{x.t}</span>
              <span className="mt-1.5 block text-sm leading-relaxed text-mute">{x.d}</span>
              <span className="mt-2 block font-mono text-[0.65rem] uppercase tracking-[0.14em] text-science">Ver en el mosaico →</span>
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}
