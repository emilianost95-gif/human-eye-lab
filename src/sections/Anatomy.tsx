import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Minus, Plus, RotateCcw, RotateCw, Tag, Undo2, Move } from 'lucide-react';
import { EyeCrossSection, type ViewMode } from '@/components/EyeCrossSection';
import { IconButton, Panel, SchemaTag, Section, Segmented, cx } from '@/components/ui';
import { C, CORNEA_APEX_X, FOVEA, OPTIC_DISC, VB, polar, lensShape, IRIS_X } from '@/lib/geometry';
import { STRUCTURES, STRUCTURE_BY_ID, type StructureId } from '@/data/structures';

/** Punto de anclaje de cada etiqueta sobre su estructura (coordenadas del esquema). */
const lens0 = lensShape(0);
const ANCHORS: Record<StructureId, { x: number; y: number }> = {
  cornea: { x: CORNEA_APEX_X + 6, y: C.y - 60 },
  acuoso: { x: 300, y: C.y + 52 },
  iris: { x: IRIS_X, y: C.y - 70 },
  pupila: { x: IRIS_X + 4, y: C.y },
  cristalino: { x: (lens0.anteriorApex + lens0.posteriorApex) / 2, y: C.y + 46 },
  vitreo: { x: C.x + 30, y: C.y - 40 },
  retina: polar(-32, 172),
  coroides: polar(-58, 179),
  esclerotica: polar(-95, 187),
  nervio: polar(15, 290),
};

/** Desplazamiento del rótulo respecto de su anclaje (en pantalla; no gira con el esquema). */
const OFFSETS: Partial<Record<StructureId, { dx: number; dy: number }>> = {
  cornea: { dx: -70, dy: -46 },
  iris: { dx: -40, dy: -92 },
  pupila: { dx: -110, dy: 0 },
  acuoso: { dx: -90, dy: 56 },
  cristalino: { dx: -40, dy: 112 },
};

interface View {
  zoom: number;
  rot: number;
  pan: { x: number; y: number };
}
const DEFAULT_VIEW: View = { zoom: 1, rot: 0, pan: { x: 0, y: 0 } };

function transformPoint(p: { x: number; y: number }, v: View) {
  const a = (v.rot * Math.PI) / 180;
  const dx = p.x - C.x;
  const dy = p.y - C.y;
  return {
    x: C.x + v.pan.x + v.zoom * (dx * Math.cos(a) - dy * Math.sin(a)),
    y: C.y + v.pan.y + v.zoom * (dx * Math.sin(a) + dy * Math.cos(a)),
  };
}

export function Anatomy() {
  const [selected, setSelected] = useState<StructureId>('cornea');
  const [hovered, setHovered] = useState<StructureId | null>(null);
  const [mode, setMode] = useState<ViewMode>('anatomic');
  const [labels, setLabels] = useState(true);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [narrow, setNarrow] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrow((e?.contentRect.width ?? 900) < 620));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const info = STRUCTURE_BY_ID[selected];
  const zoomBy = (f: number) => setView((v) => ({ ...v, zoom: Math.min(3, Math.max(0.7, +(v.zoom * f).toFixed(2))) }));
  const rotBy = (d: number) => setView((v) => ({ ...v, rot: (((v.rot + d + 180) % 360) + 360) % 360 - 180 }));

  const onPointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest('[role="button"]')) return; // clic sobre estructura = seleccionar
    drag.current = { x: e.clientX, y: e.clientY, px: view.pan.x, py: view.pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg) return;
    const scale = (narrow ? 660 : VB.w) / svg.getBoundingClientRect().width;
    setView((v) => ({ ...v, pan: { x: d.px + (e.clientX - d.x) * scale, y: d.py + (e.clientY - d.y) * scale } }));
  };
  const endDrag = () => (drag.current = null);

  const onKeyView = (e: React.KeyboardEvent) => {
    const step = 20;
    const map: Record<string, () => void> = {
      '+': () => zoomBy(1.2),
      '=': () => zoomBy(1.2),
      '-': () => zoomBy(1 / 1.2),
      r: () => rotBy(15),
      R: () => rotBy(-15),
      '0': () => setView(DEFAULT_VIEW),
      ArrowLeft: () => setView((v) => ({ ...v, pan: { ...v.pan, x: v.pan.x - step } })),
      ArrowRight: () => setView((v) => ({ ...v, pan: { ...v.pan, x: v.pan.x + step } })),
      ArrowUp: () => setView((v) => ({ ...v, pan: { ...v.pan, y: v.pan.y - step } })),
      ArrowDown: () => setView((v) => ({ ...v, pan: { ...v.pan, y: v.pan.y + step } })),
    };
    const fn = map[e.key];
    if (fn && e.target === e.currentTarget) {
      e.preventDefault();
      fn();
    }
  };

  const tf = `translate(${view.pan.x} ${view.pan.y}) translate(${C.x} ${C.y}) rotate(${view.rot}) scale(${view.zoom}) translate(${-C.x} ${-C.y})`;
  const isDefault = view.zoom === 1 && view.rot === 0 && view.pan.x === 0 && view.pan.y === 0;

  return (
    <Section
      id="anatomia"
      index="02"
      eyebrow="Anatomía interactiva"
      title="Explora cada estructura"
      intro="Corte horizontal del ojo derecho visto desde arriba. Selecciona una estructura en el esquema o en la lista para ver qué es, dónde está y qué papel cumple en la visión."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="relative overflow-hidden lg:col-span-8">
          {/* barra de controles */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <Segmented
              label="Tipo de vista"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'anatomic', label: 'Anatómica' },
                { value: 'simple', label: 'Simplificada' },
              ]}
            />
            <div className="flex items-center gap-1.5" role="toolbar" aria-label="Controles de visualización">
              <IconButton label="Rotar a la izquierda 15°" onClick={() => rotBy(-15)}>
                <RotateCcw className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Rotar a la derecha 15°" onClick={() => rotBy(15)}>
                <RotateCw className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Alejar" onClick={() => zoomBy(1 / 1.2)} disabled={view.zoom <= 0.7}>
                <Minus className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Acercar" onClick={() => zoomBy(1.2)} disabled={view.zoom >= 3}>
                <Plus className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label={labels ? 'Ocultar etiquetas' : 'Mostrar etiquetas'} aria-pressed={labels} onClick={() => setLabels((l) => !l)}>
                <Tag className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Restablecer visualización" onClick={() => setView(DEFAULT_VIEW)} disabled={isDefault}>
                <Undo2 className="size-4" aria-hidden="true" />
              </IconButton>
            </div>
          </div>

          <div className="relative">
            <svg
              ref={svgRef}
              viewBox={narrow ? '200 40 660 440' : `0 0 ${VB.w} ${VB.h}`}
              className={cx('block w-full touch-none select-none', view.zoom > 1 ? 'cursor-grab active:cursor-grabbing' : '')}
              role="group"
              aria-label="Esquema interactivo del ojo. Usa + y − para el zoom, R para rotar, flechas para desplazar y 0 para restablecer."
              tabIndex={0}
              onKeyDown={onKeyView}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <rect width={VB.w} height={VB.h} fill="transparent" />
              {/* eje óptico */}
              <g transform={tf}>
                <line x1={60} y1={C.y} x2={C.x + 200} y2={C.y} stroke="#94a3b8" strokeOpacity={0.18} strokeDasharray="2 6" />
                <EyeCrossSection mode={mode} selected={selected} hovered={hovered} onSelect={setSelected} onHover={setHovered} idPrefix="anat" />
              </g>

              {/* rótulos (no rotan con el esquema para que sigan siendo legibles) */}
              {labels && (
                <g pointerEvents="none">
                  {STRUCTURES.map((s) => {
                    const a = transformPoint(ANCHORS[s.id], view);
                    const off = OFFSETS[s.id] ?? { dx: 34, dy: -20 };
                    const dir = off.dx < 0 ? -1 : 1;
                    const on = selected === s.id || hovered === s.id;
                    if (narrow) {
                      return (
                        <g key={s.id}>
                          <circle cx={a.x} cy={a.y} r={17} fill={on ? '#22d3ee' : '#0b1220'} stroke={on ? '#f8fafc' : '#38bdf8'} strokeWidth={2} />
                          <text x={a.x} y={a.y + 7} textAnchor="middle" fontSize={20} fontWeight={600} fill={on ? '#080b12' : '#f8fafc'} fontFamily="Geist Mono Variable, monospace">
                            {s.n}
                          </text>
                        </g>
                      );
                    }
                    const lx = a.x + off.dx;
                    const ly = a.y + off.dy;
                    return (
                      <g key={s.id} className="transition-opacity" opacity={on || !hovered ? 1 : 0.55}>
                        <circle cx={a.x} cy={a.y} r={3.5} fill={on ? '#22d3ee' : '#f8fafc'} />
                        <polyline points={`${a.x},${a.y} ${lx},${ly} ${lx + dir * 8},${ly}`} fill="none" stroke={on ? '#22d3ee' : '#94a3b8'} strokeOpacity={on ? 1 : 0.6} strokeWidth={1} />
                        <text
                          x={lx + dir * 12}
                          y={ly + 4}
                          textAnchor={dir < 0 ? 'end' : 'start'}
                          fontSize={13}
                          fontWeight={on ? 600 : 500}
                          fill={on ? '#22d3ee' : '#e2e8f0'}
                          fontFamily="Geist Variable, sans-serif"
                          paintOrder="stroke"
                          stroke="#080b12"
                          strokeWidth={4}
                        >
                          <tspan fontFamily="Geist Mono Variable, monospace" fontSize={10} fill="#94a3b8">
                            {String(s.n).padStart(2, '0')}{' '}
                          </tspan>
                          {s.name}
                        </text>
                      </g>
                    );
                  })}
                  {mode === 'anatomic' && !narrow && (
                    <g fontSize={10} fontFamily="Geist Mono Variable, monospace" fill="#fde68a">
                      {(() => {
                        const f = transformPoint(FOVEA, view);
                        const d = transformPoint(OPTIC_DISC, view);
                        return (
                          <>
                            <text x={f.x - 10} y={f.y - 10} textAnchor="end" paintOrder="stroke" stroke="#080b12" strokeWidth={3}>fóvea</text>
                            <text x={d.x - 10} y={d.y + 16} textAnchor="end" fill="#fbbf24" paintOrder="stroke" stroke="#080b12" strokeWidth={3}>disco óptico</text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </g>
              )}

              {/* referencias de orientación */}
              <g fontFamily="Geist Mono Variable, monospace" fontSize={narrow ? 18 : 10} fill="#94a3b8" fillOpacity={0.75} pointerEvents="none">
                <text x={narrow ? 214 : 24} y={narrow ? 66 : 30}>TEMPORAL ↑</text>
                <text x={narrow ? 214 : 24} y={narrow ? 466 : VB.h - 18}>NASAL ↓</text>
                <text x={narrow ? 846 : VB.w - 24} y={narrow ? 466 : VB.h - 18} textAnchor="end">
                  ZOOM {view.zoom.toFixed(1)}× · {view.rot}°
                </text>
              </g>
              {/* barra de escala 5 mm */}
              <g transform={`translate(${(narrow ? 846 : VB.w - 24) - 80 * view.zoom} ${narrow ? 60 : 30})`} pointerEvents="none">
                <line x1={0} y1={0} x2={80 * view.zoom} y2={0} stroke="#94a3b8" strokeWidth={1.5} />
                <text x={(80 * view.zoom) / 2} y={16} textAnchor="middle" fontSize={narrow ? 18 : 10} fontFamily="Geist Mono Variable, monospace" fill="#94a3b8">5 mm</text>
              </g>
            </svg>
            <div className="pointer-events-none flex flex-wrap items-center justify-center gap-2 px-4 pb-3 sm:absolute sm:bottom-3 sm:left-1/2 sm:-translate-x-1/2 sm:p-0">
              <SchemaTag>Esquema 2D a escala aproximada</SchemaTag>
              {view.zoom > 1 && (
                <span className="flex items-center gap-1 font-mono text-[0.65rem] text-mute">
                  <Move className="size-3" aria-hidden="true" /> Arrastra para desplazar
                </span>
              )}
            </div>
          </div>

          {/* lista accesible / leyenda */}
          <ul className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-5" aria-label="Estructuras del ojo">
            {STRUCTURES.map((s) => (
              <li key={s.id} className="bg-surface/80">
                <button
                  type="button"
                  onClick={() => setSelected(s.id)}
                  onPointerEnter={() => setHovered(s.id)}
                  onPointerLeave={() => setHovered(null)}
                  aria-pressed={selected === s.id}
                  className={cx('flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors', selected === s.id ? 'bg-cyan/10 text-cyan' : 'text-mute hover:bg-surface-2 hover:text-ink')}
                >
                  <span className="font-mono text-[0.68rem] opacity-70">{String(s.n).padStart(2, '0')}</span>
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {/* ficha de la estructura seleccionada */}
        <Panel className="p-6 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
          <div key={info.id} className="animate-[fadein_0.5s_ease]" aria-live="polite">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-cyan">{String(info.n).padStart(2, '0')} / 10</span>
              <span className="rounded-full border border-violet/40 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-violet">{info.kind}</span>
            </div>
            <h3 className="display mt-4 text-4xl">{info.name}</h3>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/90">{info.description}</p>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="eyebrow !text-[0.65rem]">Función</dt>
                <dd className="mt-1 leading-relaxed text-mute">{info.func}</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.65rem]">Ubicación</dt>
                <dd className="mt-1 leading-relaxed text-mute">{info.location}</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.65rem]">En el proceso visual</dt>
                <dd className="mt-1 leading-relaxed text-mute">{info.role}</dd>
              </div>
            </dl>
            <p className="mt-6 border-l-2 border-cyan/60 pl-4 text-sm leading-relaxed text-sky-100/90">{info.fact}</p>
            <div className="mt-6 flex justify-between">
              <button type="button" className="text-sm text-mute hover:text-cyan" onClick={() => setSelected(STRUCTURES[(info.n + 8) % 10]!.id)}>
                ← Anterior
              </button>
              <button type="button" className="text-sm text-mute hover:text-cyan" onClick={() => setSelected(STRUCTURES[info.n % 10]!.id)}>
                Siguiente →
              </button>
            </div>
          </div>
        </Panel>
      </div>
      <p className="mt-4 text-xs text-mute">
        También se dibujan el cuerpo ciliar y las fibras zonulares (vista anatómica), que sostienen el cristalino y participan en la acomodación (sección 05). Esquema a partir del «ojo esquemático» adulto (≈ 24 mm de longitud axial).
      </p>
    </Section>
  );
}
