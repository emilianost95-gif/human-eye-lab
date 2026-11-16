import { useEffect, useRef, useState } from 'react';
import { Eye, Play, RotateCcw, Square } from 'lucide-react';
import { Button, Note, Panel, Section, Segmented, Slider, cx } from '@/components/ui';
import { blindSpotDistanceCm } from '@/lib/physio';

type Tab = 'blind' | 'after' | 'illusion';

export function Experiments() {
  const [tab, setTab] = useState<Tab>('blind');
  const tabs: { id: Tab; n: string; label: string }[] = [
    { id: 'blind', n: 'A', label: 'Punto ciego' },
    { id: 'after', n: 'B', label: 'Persistencia visual' },
    { id: 'illusion', n: 'C', label: 'Ilusiones ópticas' },
  ];
  return (
    <Section
      id="experimentos"
      index="07"
      eyebrow="Experimenta con tu visión"
      title="Laboratorio de experimentos visuales"
      intro="Tres experimentos clásicos para comprobar en ti mismo lo que aprendiste. Son demostraciones educativas: no sirven para diagnosticar ningún problema de la vista."
    >
      <div role="tablist" aria-label="Experimentos" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const i = tabs.findIndex((x) => x.id === tab);
              const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]!;
              setTab(next.id);
              document.getElementById(`tab-${next.id}`)?.focus();
            }}
            className={cx(
              'flex min-h-11 items-center gap-3 rounded-full border px-5 text-sm transition-all',
              tab === t.id ? 'border-cyan bg-cyan/10 text-ink' : 'border-mute/20 text-mute hover:border-mute/50 hover:text-ink',
            )}
          >
            <span className="font-mono text-xs text-cyan">{t.n}</span>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'blind' && <BlindSpot />}
        {tab === 'after' && <Afterimage />}
        {tab === 'illusion' && <Illusions />}
      </div>
      <div className="mt-6">
        <Note tone="warn">
          Estas actividades no son pruebas médicas. Si notas molestias, deja de mirar la pantalla. Ante cualquier duda sobre tu visión, consulta a un profesional de la salud visual.
        </Note>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- A. Punto ciego */
function BlindSpot() {
  const [eye, setEye] = useState<'right' | 'left'>('right');
  const [mode, setMode] = useState<'dot' | 'line'>('dot');
  const [sep, setSep] = useState(300);
  const sepCm = sep / 37.8; // 96 px CSS ≈ 2,54 cm (aproximado; depende de la pantalla)
  const dist = blindSpotDistanceCm(sepCm);
  const crossLeft = eye === 'right';

  const Cross = <span className="text-5xl font-light leading-none text-slate-900 select-none" aria-label="cruz">+</span>;
  const Target =
    mode === 'dot' ? (
      <span className="block size-10 rounded-full bg-rose-600" aria-label="punto rojo" />
    ) : (
      <span className="block h-10 w-24" aria-label="línea interrumpida por un hueco">
        <span className="mt-[18px] flex h-1 w-full items-center">
          <span className="h-1 flex-1 bg-slate-900" />
          <span className="h-1 w-8 bg-transparent" />
          <span className="h-1 flex-1 bg-slate-900" />
        </span>
      </span>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel className="overflow-hidden lg:col-span-8">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <Segmented label="Ojo que observa" value={eye} onChange={setEye} options={[{ value: 'right', label: 'Ojo derecho' }, { value: 'left', label: 'Ojo izquierdo' }]} />
          <Segmented label="Estímulo" value={mode} onChange={setMode} options={[{ value: 'dot', label: 'Punto' }, { value: 'line', label: 'Relleno de línea' }]} />
        </div>
        <div className="overflow-x-auto bg-slate-100">
          <div className="mx-auto flex h-64 items-center justify-center" style={{ width: Math.max(sep + 140, 320) }}>
            <div className="flex items-center" style={{ gap: sep - 40, flexDirection: crossLeft ? 'row' : 'row-reverse' }}>
              {Cross}
              {Target}
            </div>
          </div>
        </div>
        <div className="border-t border-line px-4 py-4 sm:px-6">
          <Slider id="sep" label="Separación entre la cruz y el estímulo" min={160} max={520} step={10} value={sep} onChange={setSep} valueText={`${sep} px`} />
          <p className="mt-2 text-xs text-mute">Distancia estimada a la que desaparece: ≈ {Math.round(dist)} cm de la pantalla (aproximado; depende del tamaño real de tu pantalla).</p>
        </div>
      </Panel>
      <Panel className="p-6 lg:col-span-4">
        <h3 className="text-lg font-semibold">Cómo hacerlo</h3>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mute marker:text-cyan">
          <li>Tápate el ojo {eye === 'right' ? 'izquierdo' : 'derecho'} con la mano.</li>
          <li>Con el ojo {eye === 'right' ? 'derecho' : 'izquierdo'}, mira fijamente la cruz. No muevas la mirada hacia el estímulo.</li>
          <li>Acércate y aléjate despacio de la pantalla (empieza a unos 50–60 cm).</li>
          <li>{mode === 'dot' ? 'A cierta distancia, el punto rojo desaparece.' : 'A cierta distancia, el hueco desaparece y ves una línea continua.'}</li>
        </ol>
        <h4 className="mt-6 text-sm font-semibold text-cyan">¿Por qué ocurre?</h4>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          La imagen del estímulo cae sobre el disco óptico, donde sale el nervio óptico y no hay conos ni bastones. Ese punto de la retina no detecta luz.{' '}
          {mode === 'line'
            ? 'Con la línea se ve algo más: el cerebro no deja un hueco negro, sino que «completa» la zona con lo que la rodea.'
            : 'No vemos un agujero porque el cerebro completa la zona con la información de alrededor y porque el otro ojo cubre ese hueco.'}
        </p>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------- B. Postimagen */
const ADAPT_S = 20;
const TEST_S = 12;

function Afterimage() {
  const [phase, setPhase] = useState<'idle' | 'adapt' | 'test' | 'done'>('idle');
  const [left, setLeft] = useState(ADAPT_S);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (phase !== 'adapt' && phase !== 'test') return;
    timer.current = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(timer.current);
  }, [phase]);

  useEffect(() => {
    if (left > 0) return;
    if (phase === 'adapt') {
      setPhase('test');
      setLeft(TEST_S);
    } else if (phase === 'test') setPhase('done');
  }, [left, phase]);

  const start = () => {
    setLeft(ADAPT_S);
    setPhase('adapt');
  };
  const stop = () => {
    setPhase('idle');
    setLeft(ADAPT_S);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel className="overflow-hidden lg:col-span-8">
        <div className={cx('relative grid aspect-[16/10] place-items-center transition-colors duration-300', phase === 'test' || phase === 'done' ? 'bg-[#d9dde3]' : 'bg-[#11141b]')}>
          {(phase === 'idle' || phase === 'adapt') && (
            <svg viewBox="0 0 400 250" className="h-[78%]" role="img" aria-label="Figura de adaptación: círculo cian, cuadrado amarillo y triángulo magenta con un punto de fijación en el centro">
              <circle cx={110} cy={125} r={62} fill="#00e5ff" />
              <rect x={168} y={70} width={110} height={110} fill="#ffe600" />
              <polygon points="300,190 350,60 395,190" fill="#ff2bd6" transform="translate(-14 0)" />
              <circle cx={200} cy={125} r={5} fill="#000" stroke="#fff" strokeWidth={2} />
            </svg>
          )}
          {(phase === 'test' || phase === 'done') && <span className="size-2.5 rounded-full bg-slate-800" aria-hidden="true" />}
          <div className="absolute left-4 top-3 font-mono text-xs" aria-live="polite">
            {phase === 'adapt' && <span className="text-sky-100">Mira fijamente el punto central · {left} s</span>}
            {phase === 'test' && <span className="text-slate-700">Ahora mira el punto · {left} s</span>}
            {phase === 'done' && <span className="text-slate-700">¿Qué viste?</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
          {phase === 'idle' || phase === 'done' ? (
            <Button variant="primary" onClick={start}>
              {phase === 'done' ? <RotateCcw className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {phase === 'done' ? 'Repetir' : 'Comenzar (20 s)'}
            </Button>
          ) : (
            <Button onClick={stop}>
              <Square className="size-4" aria-hidden="true" /> Detener
            </Button>
          )}
          <span className="text-xs text-mute">Sin parpadeos ni destellos: solo una figura fija y luego una superficie gris.</span>
        </div>
      </Panel>
      <Panel className="p-6 lg:col-span-4">
        <h3 className="text-lg font-semibold">Qué deberías ver</h3>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          Sobre la superficie gris aparecen por unos segundos las mismas formas en colores «opuestos»: un círculo rojizo, un cuadrado azulado y un triángulo verdoso. Es una <strong className="text-ink">postimagen negativa</strong>.
        </p>
        <h4 className="mt-6 text-sm font-semibold text-cyan">¿Por qué ocurre?</h4>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          Al mirar fijo un color durante un rato, los conos más estimulados por él se <em>adaptan</em>: reducen temporalmente su respuesta. Al pasar a un fondo neutro, que estimula a todos por igual, los conos adaptados responden menos que los demás, y el sistema visual —que compara señales opuestas (rojo–verde, azul–amarillo)— interpreta el color complementario.
        </p>
        <p className="mt-3 text-xs text-mute">El efecto se desvanece en segundos, a medida que los fotorreceptores se recuperan.</p>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------- C. Ilusiones */
function Illusions() {
  const [which, setWhich] = useState<'contrast' | 'muller' | 'ebb'>('contrast');
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
        <Segmented
          label="Ilusión"
          value={which}
          onChange={setWhich}
          options={[
            { value: 'contrast', label: 'Contraste simultáneo' },
            { value: 'muller', label: 'Müller-Lyer' },
            { value: 'ebb', label: 'Ebbinghaus' },
          ]}
        />
      </div>
      {which === 'contrast' && <Contrast />}
      {which === 'muller' && <MullerLyer />}
      {which === 'ebb' && <Ebbinghaus />}
    </Panel>
  );
}

function IllusionLayout({ figure, controls, title, text }: { figure: React.ReactNode; controls: React.ReactNode; title: string; text: React.ReactNode }) {
  return (
    <div className="grid lg:grid-cols-12">
      <div className="border-line lg:col-span-7 lg:border-r">
        {figure}
        <div className="border-t border-line px-4 py-4 sm:px-6">{controls}</div>
      </div>
      <div className="p-6 lg:col-span-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-mute">{text}</div>
      </div>
    </div>
  );
}

function Contrast() {
  const [reveal, setReveal] = useState(false);
  return (
    <IllusionLayout
      title="¿Qué cuadrado es más claro?"
      figure={
        <svg viewBox="0 0 600 300" className="block w-full" role="img" aria-label="Dos cuadrados del mismo gris sobre un fondo que va de oscuro a claro">
          <defs>
            <linearGradient id="ct-bg">
              <stop offset="0" stopColor="#0a0a0a" />
              <stop offset="1" stopColor="#f2f2f2" />
            </linearGradient>
          </defs>
          <rect width="600" height="300" fill={reveal ? '#7f7f7f' : 'url(#ct-bg)'} style={{ transition: 'fill 0.6s' }} />
          {reveal && <rect width="600" height="300" fill="#5b6575" />}
          <rect x="100" y="100" width="100" height="100" fill="#808080" />
          <rect x="400" y="100" width="100" height="100" fill="#808080" />
          {reveal && <rect x="200" y="140" width="200" height="20" fill="#808080" />}
        </svg>
      }
      controls={
        <Button onClick={() => setReveal((r) => !r)} aria-pressed={reveal}>
          <Eye className="size-4" aria-hidden="true" /> {reveal ? 'Volver a mostrar el fondo' : 'Quitar el fondo y unir los cuadrados'}
        </Button>
      }
      text={
        <>
          <p>Ambos cuadrados son exactamente del mismo gris (#808080). Sobre fondo oscuro parece más claro; sobre fondo claro, más oscuro.</p>
          <p>
            El sistema visual no mide la luz de forma absoluta: compara cada zona con su entorno. Este procesamiento comienza en la retina (inhibición lateral entre neuronas vecinas) y continúa en la corteza, y sirve para reconocer objetos aunque cambie la iluminación.
          </p>
        </>
      }
    />
  );
}

function MullerLyer() {
  const [len, setLen] = useState(300);
  const [reveal, setReveal] = useState(false);
  const REF = 260;
  const fin = 26;
  const cx0 = 300;
  const Line = ({ y, l, out }: { y: number; l: number; out: boolean }) => {
    const a = cx0 - l / 2;
    const b = cx0 + l / 2;
    const d = out ? -1 : 1; // out: aletas hacia afuera (>—<), parecen más larga
    return (
      <g stroke="#f8fafc" strokeWidth={3} strokeLinecap="round" fill="none">
        <line x1={a} y1={y} x2={b} y2={y} />
        <polyline points={`${a + d * fin},${y - fin} ${a},${y} ${a + d * fin},${y + fin}`} />
        <polyline points={`${b - d * fin},${y - fin} ${b},${y} ${b - d * fin},${y + fin}`} />
      </g>
    );
  };
  const diff = Math.round(((len - REF) / REF) * 100);
  return (
    <IllusionLayout
      title="Iguala las dos líneas"
      figure={
        <svg viewBox="0 0 600 300" className="block w-full" role="img" aria-label="Ilusión de Müller-Lyer: dos líneas horizontales con aletas en los extremos">
          <Line y={95} l={REF} out={false} />
          <Line y={215} l={len} out />
          {reveal && (
            <g stroke="#22d3ee" strokeDasharray="4 4">
              <line x1={cx0 - REF / 2} y1={40} x2={cx0 - REF / 2} y2={270} />
              <line x1={cx0 + REF / 2} y1={40} x2={cx0 + REF / 2} y2={270} />
            </g>
          )}
        </svg>
      }
      controls={
        <div className="space-y-4">
          <Slider id="ml" label="Longitud de la línea inferior" min={160} max={320} step={2} value={len} onChange={(v) => (setLen(v), setReveal(false))} valueText={reveal ? `${diff > 0 ? '+' : ''}${diff} % respecto de la superior` : 'ajústala a ojo'} />
          <Button onClick={() => setReveal(true)} disabled={reveal}>
            <Eye className="size-4" aria-hidden="true" /> Revelar medida real
          </Button>
        </div>
      }
      text={
        <>
          <p>Mueve el control hasta que las dos líneas te parezcan iguales y luego revela la medida. La mayoría de las personas deja la línea inferior más corta que la superior.</p>
          <p>
            Las aletas hacia afuera hacen que la línea parezca más larga. Una explicación propuesta es que el cerebro interpreta esas formas como esquinas en profundidad (como el interior o el exterior de una habitación) y ajusta el tamaño percibido; otras explicaciones apelan a cómo se integran los contornos. El fenómeno está bien documentado, aunque su causa exacta sigue en discusión.
          </p>
          {reveal && <p className="text-cyan">Tu ajuste: {diff > 0 ? '+' : ''}{diff} % respecto de la línea superior.</p>}
        </>
      }
    />
  );
}

function Ebbinghaus() {
  const [ring, setRing] = useState(40);
  const [reveal, setReveal] = useState(false);
  const R = 30;
  const around = (cx: number, r: number, dist: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return <circle key={i} cx={cx + Math.cos(a) * dist} cy={150 + Math.sin(a) * dist} r={r} fill="#94a3b8" />;
    });
  return (
    <IllusionLayout
      title="¿Qué círculo naranja es más grande?"
      figure={
        <svg viewBox="0 0 600 300" className="block w-full" role="img" aria-label="Ilusión de Ebbinghaus: dos círculos naranjas iguales, uno rodeado de círculos grandes y otro de círculos pequeños">
          {around(160, ring, R + ring + 14, 6)}
          {around(440, 11, R + 24, 10)}
          <circle cx={160} cy={150} r={R} fill="#fb923c" />
          <circle cx={440} cy={150} r={R} fill="#fb923c" />
          {reveal && (
            <g stroke="#22d3ee" strokeDasharray="4 4">
              <line x1={20} y1={150 - R} x2={580} y2={150 - R} />
              <line x1={20} y1={150 + R} x2={580} y2={150 + R} />
            </g>
          )}
        </svg>
      }
      controls={
        <div className="space-y-4">
          <Slider id="eb" label="Tamaño de los círculos que rodean al de la izquierda" min={12} max={56} value={ring} onChange={setRing} valueText={`${ring * 2} px`} />
          <Button onClick={() => setReveal((r) => !r)} aria-pressed={reveal}>
            <Eye className="size-4" aria-hidden="true" /> {reveal ? 'Ocultar guías' : 'Mostrar guías'}
          </Button>
        </div>
      }
      text={
        <>
          <p>Los dos círculos naranjas son idénticos. El de la izquierda, rodeado de círculos grandes, suele parecer más pequeño.</p>
          <p>
            El tamaño percibido no depende solo del tamaño de la imagen en la retina: el cerebro lo estima comparando con el contexto. Al agrandar los círculos de alrededor, el efecto suele aumentar.
          </p>
          <p>La retina registra bien la información; lo que «se equivoca» es la interpretación, que en la vida diaria casi siempre nos ayuda.</p>
        </>
      }
    />
  );
}
