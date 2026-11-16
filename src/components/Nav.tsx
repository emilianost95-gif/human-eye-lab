import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { scrollToId, useActiveSection, useScrollProgress } from '@/lib/hooks';
import { cx } from './ui';

export const SECTIONS = [
  { id: 'inicio', n: '01', label: 'Inicio' },
  { id: 'anatomia', n: '02', label: 'Anatomía' },
  { id: 'vision', n: '03', label: 'De la luz a la imagen' },
  { id: 'pupila', n: '04', label: 'Iris y pupila' },
  { id: 'acomodacion', n: '05', label: 'Acomodación' },
  { id: 'retina', n: '06', label: 'Retina' },
  { id: 'experimentos', n: '07', label: 'Experimentos' },
  { id: 'evaluacion', n: '08', label: 'Evaluación' },
  { id: 'resumen', n: '09', label: 'Resumen' },
  { id: 'final', n: '10', label: 'Final' },
] as const;

const IDS = SECTIONS.map((s) => s.id);

export function Nav() {
  const active = useActiveSection(IDS);
  const progress = useScrollProgress();
  const [open, setOpen] = useState(false);
  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // esperar a que se libere el bloqueo de scroll del menú
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <>
      <a href="#anatomia" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-void">
        Saltar al contenido
      </a>
      <header className="no-print fixed inset-x-0 top-0 z-50">
        <div className="glass !border-x-0 !border-t-0">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
            <button type="button" onClick={() => go('inicio')} className="flex items-center gap-2.5 text-sm font-semibold tracking-tight" aria-label="HUMAN EYE — volver al inicio">
              <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
                <path d="M3 16c4-6 8-9 13-9s9 3 13 9c-4 6-8 9-13 9S7 22 3 16z" fill="none" stroke="#38BDF8" strokeWidth="1.6" />
                <circle cx="16" cy="16" r="5" fill="#22D3EE" />
                <circle cx="16" cy="16" r="2.2" fill="#080B12" />
              </svg>
              <span>
                HUMAN EYE<span className="hidden text-mute sm:inline"> — Inside the Vision</span>
              </span>
            </button>
            <nav aria-label="Secciones" className="hidden items-center gap-1 lg:flex">
              {SECTIONS.slice(1, 9).map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(s.id);
                  }}
                  aria-current={active === s.id ? 'location' : undefined}
                  className={cx('rounded-full px-3 py-1.5 text-[0.8rem] transition-colors', active === s.id ? 'bg-surface-2 text-ink' : 'text-mute hover:text-ink')}
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3 lg:hidden">
              <span className="font-mono text-xs text-mute" aria-live="polite">
                <span className="text-cyan">{current.n}</span> / 10
              </span>
              <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú de secciones" aria-expanded={open} aria-controls="menu-secciones" className="inline-flex size-10 items-center justify-center rounded-full border border-mute/25">
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="h-px bg-line" aria-hidden="true">
            <div className="h-px origin-left bg-gradient-to-r from-science to-cyan" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </header>

      {/* Índice lateral (escritorio) */}
      <nav aria-label="Progreso de la experiencia" className="no-print fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 xl:flex">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              go(s.id);
            }}
            aria-label={`${s.n} ${s.label}`}
            aria-current={active === s.id ? 'location' : undefined}
            className="group flex items-center justify-end gap-3"
          >
            <span className={cx('font-mono text-[0.65rem] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100', active === s.id ? 'text-cyan' : 'text-mute')}>
              {s.n} {s.label}
            </span>
            <span className={cx('block h-px transition-all duration-500', active === s.id ? 'w-8 bg-cyan' : 'w-4 bg-mute/40 group-hover:w-6 group-hover:bg-mute')} />
          </a>
        ))}
      </nav>

      {open && (
        <div id="menu-secciones" role="dialog" aria-modal="true" aria-label="Menú de secciones" className="fixed inset-0 z-[70] overflow-y-auto bg-void/95 px-6 py-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Índice</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="inline-flex size-10 items-center justify-center rounded-full border border-mute/25" autoFocus>
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <ol className="mt-8 space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(s.id);
                  }}
                  aria-current={active === s.id ? 'location' : undefined}
                  className={cx('flex items-baseline gap-4 border-b border-line py-3.5 text-2xl tracking-tight', active === s.id ? 'text-cyan' : 'text-ink')}
                >
                  <span className="font-mono text-xs text-mute">{s.n}</span>
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#referencias" onClick={(e) => { e.preventDefault(); go('referencias'); }} className="flex items-baseline gap-4 py-3.5 text-lg text-mute">
                <span className="font-mono text-xs">—</span>Referencias
              </a>
            </li>
          </ol>
        </div>
      )}
    </>
  );
}
