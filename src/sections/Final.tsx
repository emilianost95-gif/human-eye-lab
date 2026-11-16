import { BookOpen, RotateCcw, ScanEye } from 'lucide-react';
import { Eye3D } from '@/components/Eye3D';
import { Button } from '@/components/ui';
import { scrollToId } from '@/lib/hooks';
import { QUIZ_RESET_EVENT } from './Quiz';
import { REFERENCES } from '@/data/references';

export function Final() {
  return (
    <>
      <section id="final" aria-labelledby="final-title" className="tech-grid relative overflow-hidden px-4 py-24 sm:px-8 md:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(129,140,248,0.14),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            <Eye3D className="absolute inset-0" pupilMm={5} />
          </div>
          <div>
            <p className="eyebrow">10 · Final experience</p>
            <h2 id="final-title" className="display mt-5 text-5xl text-balance sm:text-6xl focus:outline-none">
              Ahora sabes cómo ves el mundo.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-mute">La visión es el resultado de una extraordinaria colaboración entre luz, biología y cerebro.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => scrollToId('inicio')}>
                <ScanEye className="size-4" aria-hidden="true" /> Volver a explorar
              </Button>
              <Button
                onClick={() => {
                  window.dispatchEvent(new Event(QUIZ_RESET_EVENT));
                  scrollToId('evaluacion');
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" /> Repetir evaluación
              </Button>
              <Button onClick={() => scrollToId('anatomia')}>
                <BookOpen className="size-4" aria-hidden="true" /> Repasar anatomía
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer id="referencias" aria-labelledby="ref-title" className="border-t border-line px-4 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 id="ref-title" className="text-2xl font-semibold tracking-tight focus:outline-none">
              Referencias
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              Fuentes usadas para los datos anatómicos, las curvas de fotorreceptores y el modelo pupilar. Los esquemas son representaciones didácticas: simplifican, pero no contradicen estas fuentes.
            </p>
          </div>
          <ol className="space-y-4 text-sm leading-relaxed md:col-span-8">
            {REFERENCES.map((r, k) => (
              <li key={r.text} className="flex gap-4">
                <span className="font-mono text-xs text-cyan">[{k + 1}]</span>
                <span className="text-mute">
                  {r.text}
                  {r.url && (
                    <>
                      {' '}
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="break-all text-science underline decoration-science/30 underline-offset-4 hover:decoration-science">
                        {r.urlLabel ?? r.url}
                      </a>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mx-auto mt-16 flex max-w-7xl flex-wrap justify-between gap-4 border-t border-line pt-6 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mute">
          <span>HUMAN EYE — Inside the Vision · 2026</span>
          <span>Material educativo · no reemplaza la consulta profesional</span>
        </div>
      </footer>
    </>
  );
}
