import { Printer } from 'lucide-react';
import { Button, Panel, Section } from '@/components/ui';
import { STRUCTURES } from '@/data/structures';
import { LIGHT_STEPS } from '@/data/lightPath';

const SHORT_FN: Record<string, string> = {
  cornea: 'Lente fija y transparente; ~2/3 del enfoque.',
  acuoso: 'Nutre córnea y cristalino; mantiene la presión.',
  iris: 'Músculo pigmentado que regula la pupila.',
  pupila: 'Abertura por la que entra la luz (2–8 mm).',
  cristalino: 'Lente elástica; ajuste fino del enfoque.',
  vitreo: 'Gel que mantiene la forma del ojo.',
  retina: 'Fotorreceptores: luz → señal eléctrica.',
  coroides: 'Vasos que nutren la retina externa.',
  esclerotica: 'Capa blanca que protege y da forma.',
  nervio: 'Lleva las señales de la retina al cerebro.',
};

export function Summary() {
  return (
    <Section
      id="resumen"
      index="09"
      eyebrow="Resumen científico"
      title="Ficha de estudio rápido"
      intro="Todo lo esencial en una sola vista. Puedes imprimirla o guardarla como PDF desde el diálogo de impresión."
    >
      <div className="no-print mb-6 flex justify-end">
        <Button onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden="true" /> Imprimir resumen
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-6 lg:col-span-5">
          <h3 className="eyebrow">Partes del ojo y funciones</h3>
          <dl className="mt-4 divide-y divide-line">
            {STRUCTURES.map((s) => (
              <div key={s.id} className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5 text-sm">
                <dt className="font-medium text-ink">
                  <span className="mr-2 font-mono text-[0.65rem] text-mute">{String(s.n).padStart(2, '0')}</span>
                  {s.name}
                </dt>
                <dd className="text-mute">{SHORT_FN[s.id]}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="grid gap-6 lg:col-span-7">
          <Panel className="p-6">
            <h3 className="eyebrow">Recorrido de la luz</h3>
            <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
              {LIGHT_STEPS.map((s, k) => (
                <li key={s.n} className="flex items-center gap-2">
                  <span className="rounded-full border border-mute/25 px-3 py-1">
                    <span className="mr-1.5 font-mono text-[0.65rem] text-cyan">{s.n}</span>
                    {['Córnea', 'Humor acuoso', 'Pupila', 'Cristalino', 'Humor vítreo', 'Retina', 'Fotorreceptores', 'Nervio óptico', 'Cerebro'][k]}
                  </span>
                  {k < LIGHT_STEPS.length - 1 && <span className="text-mute" aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm leading-relaxed text-mute">
              La <strong className="text-ink">óptica</strong> (córnea + cristalino) forma una imagen pequeña e invertida en la retina; la <strong className="text-ink">fisiología</strong> (fotorreceptores, neuronas retinianas) la convierte en señales; el <strong className="text-ink">cerebro</strong> la interpreta.
            </p>
          </Panel>

          <div className="grid gap-6 sm:grid-cols-2">
            <Panel className="p-6">
              <h3 className="eyebrow">Regulación de la pupila</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mute">
                <li><strong className="text-ink">Mucha luz →</strong> esfínter (circular, parasimpático) → miosis.</li>
                <li><strong className="text-ink">Poca luz →</strong> dilatador (radial, simpático) → midriasis.</li>
                <li>Reflejo automático y simultáneo en ambos ojos.</li>
              </ul>
            </Panel>
            <Panel className="p-6">
              <h3 className="eyebrow">Acomodación</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mute">
                <li><strong className="text-ink">Lejos:</strong> ciliar relajado, zónulas tensas, cristalino plano.</li>
                <li><strong className="text-ink">Cerca:</strong> ciliar contraído, zónulas flojas, cristalino curvo.</li>
                <li>Disminuye con la edad (presbicia).</li>
              </ul>
            </Panel>
            <Panel className="p-6">
              <h3 className="eyebrow">Fotorreceptores</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mute">
                <li><strong className="text-violet">Bastones:</strong> muy sensibles, visión nocturna, sin color, periferia.</li>
                <li><strong className="text-cyan">Conos:</strong> color (L, M, S), alta agudeza, luz diurna, fóvea.</li>
                <li>Punto ciego: disco óptico, sin fotorreceptores.</li>
              </ul>
            </Panel>
            <Panel className="p-6">
              <h3 className="eyebrow">Hacia el cerebro</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mute">
                <li>Fotorreceptores → bipolares → ganglionares.</li>
                <li>Nervio óptico → quiasma → tálamo (NGL) → corteza visual (occipital).</li>
                <li>Ver es interpretar: el contexto influye (ilusiones).</li>
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </Section>
  );
}
