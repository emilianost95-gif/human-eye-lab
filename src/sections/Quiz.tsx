import { useEffect, useRef, useState } from 'react';
import { Award, Check, RotateCcw, X, ArrowRight } from 'lucide-react';
import { Button, Panel, Section, cx } from '@/components/ui';
import { QUIZ, badgeFor } from '@/data/quiz';
import { safeStorage } from '@/lib/hooks';

export const QUIZ_RESET_EVENT = 'humaneye:quiz-reset';
const BEST_KEY = 'humaneye.quiz.best';
const BASE = 100;
const STREAK_BONUS = 25;

export function Quiz() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState<number | null>(() => {
    const v = Number(safeStorage.get(BEST_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  });
  const headingRef = useRef<HTMLHeadingElement>(null);

  const q = QUIZ[i]!;
  const chosen = answers[i] ?? null;
  const answered = chosen !== null;
  const correctCount = answers.filter((a, k) => a === QUIZ[k]!.answer).length;
  const pct = Math.round((correctCount / QUIZ.length) * 100);

  const reset = () => {
    setI(0);
    setAnswers(QUIZ.map(() => null));
    setPoints(0);
    setStreak(0);
    setFinished(false);
  };

  useEffect(() => {
    const onReset = () => reset();
    window.addEventListener(QUIZ_RESET_EVENT, onReset);
    return () => window.removeEventListener(QUIZ_RESET_EVENT, onReset);
  }, []);

  const choose = (k: number) => {
    if (answered) return;
    const ok = k === q.answer;
    setAnswers((a) => a.map((v, idx) => (idx === i ? k : v)));
    if (ok) {
      setPoints((p) => p + BASE + streak * STREAK_BONUS);
      setStreak((s) => s + 1);
    } else setStreak(0);
  };

  const next = () => {
    if (i < QUIZ.length - 1) {
      setI(i + 1);
      requestAnimationFrame(() => headingRef.current?.focus());
    } else {
      setFinished(true);
      if (best === null || pct > best) {
        setBest(pct);
        safeStorage.set(BEST_KEY, String(pct));
      }
    }
  };

  const badge = badgeFor(pct);

  return (
    <Section
      id="evaluacion"
      index="08"
      eyebrow="Comprueba lo aprendido"
      title="Evaluación interactiva"
      intro="Diez preguntas que piden aplicar lo aprendido, no solo recordarlo. Recibirás una explicación después de cada respuesta. Las respuestas correctas seguidas suman puntos extra."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-6 sm:p-8 lg:col-span-8">
          {/* progreso */}
          <div className="flex items-center justify-between gap-4 font-mono text-xs text-mute">
            <span>
              {finished ? 'RESULTADO' : `PREGUNTA ${String(i + 1).padStart(2, '0')} / ${QUIZ.length}`}
            </span>
            <span className="text-cyan">{points} pts</span>
          </div>
          <div
            className="mt-3 flex gap-1"
            role="progressbar"
            aria-label="Progreso de la evaluación"
            aria-valuemin={0}
            aria-valuemax={QUIZ.length}
            aria-valuenow={answers.filter((a) => a !== null).length}
          >
            {QUIZ.map((qq, k) => {
              const a = answers[k];
              return (
                <span
                  key={qq.id}
                  className={cx(
                    'h-1.5 flex-1 rounded-full transition-colors duration-500',
                    a === null || a === undefined ? (k === i && !finished ? 'bg-mute/50' : 'bg-line') : a === qq.answer ? 'bg-cyan' : 'bg-tissue',
                  )}
                />
              );
            })}
          </div>

          {!finished ? (
            <div key={q.id} className="mt-8 animate-[fadein_0.5s_ease]">
              <span className="eyebrow">{q.topic}</span>
              <h3 ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-semibold leading-snug tracking-tight focus:outline-none sm:text-3xl">
                {q.q}
              </h3>
              <fieldset className="mt-6">
                <legend className="sr-only">Opciones de respuesta</legend>
                <div className="grid gap-3">
                  {q.options.map((opt, k) => {
                    const isRight = answered && k === q.answer;
                    const isWrong = answered && k === chosen && k !== q.answer;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => choose(k)}
                        disabled={answered}
                        aria-pressed={chosen === k}
                        className={cx(
                          'group flex w-full items-start gap-4 rounded-xl border px-4 py-3.5 text-left text-[0.95rem] leading-relaxed transition-all duration-300',
                          !answered && 'border-mute/20 hover:-translate-y-0.5 hover:border-cyan/60 hover:bg-cyan/5',
                          isRight && 'border-cyan bg-cyan/10',
                          isWrong && 'border-tissue bg-tissue/10',
                          answered && !isRight && !isWrong && 'border-line opacity-55',
                        )}
                      >
                        <span
                          className={cx(
                            'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs',
                            isRight ? 'border-cyan bg-cyan text-void' : isWrong ? 'border-tissue bg-tissue text-void' : 'border-mute/40 text-mute group-hover:border-cyan group-hover:text-cyan',
                          )}
                          aria-hidden="true"
                        >
                          {isRight ? <Check className="size-3.5" /> : isWrong ? <X className="size-3.5" /> : String.fromCharCode(65 + k)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div aria-live="polite">
                {answered && (
                  <div className={cx('mt-6 rounded-xl border p-5 animate-[fadein_0.4s_ease]', chosen === q.answer ? 'border-cyan/40 bg-cyan/5' : 'border-tissue/40 bg-tissue/5')}>
                    <p className={cx('font-semibold', chosen === q.answer ? 'text-cyan' : 'text-rose-300')}>
                      {chosen === q.answer ? `¡Correcto! +${BASE + (streak - 1) * STREAK_BONUS} pts${streak > 1 ? ` · racha ×${streak}` : ''}` : 'No es correcto.'}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-mute">{q.explain}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={next} disabled={!answered}>
                  {i < QUIZ.length - 1 ? 'Siguiente pregunta' : 'Ver resultado'} <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-10 animate-[fadein_0.6s_ease] text-center" aria-live="polite">
              <BadgeMark pct={pct} />
              <p className="eyebrow mt-6">Insignia obtenida</p>
              <h3 className="display mt-2 text-4xl">{badge.name}</h3>
              <p className="mx-auto mt-4 max-w-md text-mute">{badge.message}</p>
              <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-4 font-mono">
                <div>
                  <div className="text-3xl text-cyan">{pct}%</div>
                  <div className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-mute">aciertos</div>
                </div>
                <div>
                  <div className="text-3xl">{correctCount}/{QUIZ.length}</div>
                  <div className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-mute">correctas</div>
                </div>
                <div>
                  <div className="text-3xl">{points}</div>
                  <div className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-mute">puntos</div>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <Button variant="primary" onClick={reset}>
                  <RotateCcw className="size-4" aria-hidden="true" /> Volver a intentarlo
                </Button>
              </div>
            </div>
          )}
        </Panel>

        <Panel className="p-6 lg:col-span-4">
          <h3 className="text-lg font-semibold">Tu recorrido</h3>
          <ol className="mt-4 space-y-2 text-sm">
            {QUIZ.map((qq, k) => {
              const a = answers[k];
              return (
                <li key={qq.id} className="flex items-center gap-3">
                  <span className={cx('grid size-6 place-items-center rounded-full font-mono text-[0.65rem]', a === null || a === undefined ? 'border border-line text-mute' : a === qq.answer ? 'bg-cyan text-void' : 'bg-tissue text-void')}>
                    {k + 1}
                  </span>
                  <span className={cx(k === i && !finished ? 'text-ink' : 'text-mute')}>{qq.topic}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-6 border-t border-line pt-4 text-sm text-mute">
            Racha actual: <span className="font-mono text-ink">{streak}</span>
            {best !== null && (
              <>
                {' · '}Mejor resultado: <span className="font-mono text-cyan">{best}%</span>
              </>
            )}
          </div>
        </Panel>
      </div>
    </Section>
  );
}

function BadgeMark({ pct }: { pct: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto size-36">
      <svg viewBox="0 0 140 140" className="size-full -rotate-90" aria-hidden="true">
        <circle cx={70} cy={70} r={r} fill="none" stroke="#1f2a3d" strokeWidth={8} />
        <circle cx={70} cy={70} r={r} fill="none" stroke="url(#bm)" strokeWidth={8} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)' }} />
        <defs>
          <linearGradient id="bm">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>
      <Award className="absolute inset-0 m-auto size-12 text-cyan" aria-hidden="true" />
    </div>
  );
}
