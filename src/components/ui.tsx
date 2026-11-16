import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/hooks';

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

interface SectionProps {
  id: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Contenedor estándar de sección con cabecera editorial y aparición al hacer scroll (GSAP). */
export function Section({ id, index, eyebrow, title, intro, children, className }: SectionProps) {
  const headRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = headRef.current;
    if (!el || prefersReducedMotion()) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(el.querySelectorAll('[data-reveal]'), {
          y: 28,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cx('relative px-4 py-24 sm:px-8 md:py-32', className)}>
      <div className="mx-auto max-w-7xl">
        <div ref={headRef} className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12">
          <div className="md:col-span-3" data-reveal>
            <div className="flex items-center gap-3 font-mono text-xs text-mute">
              <span className="text-cyan">{index}</span>
              <span className="h-px w-10 bg-line" aria-hidden="true" />
              <span className="eyebrow !text-mute">{eyebrow}</span>
            </div>
          </div>
          <div className="md:col-span-9">
            <h2 id={`${id}-title`} data-reveal className="display text-4xl text-balance sm:text-5xl lg:text-6xl focus:outline-none">
              {title}
            </h2>
            {intro && (
              <p data-reveal className="mt-6 max-w-2xl text-base leading-relaxed text-mute sm:text-lg">
                {intro}
              </p>
            )}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

type BtnVariant = 'primary' | 'ghost' | 'outline';
export function Button({ variant = 'outline', className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        variant === 'primary' && 'bg-cyan text-void hover:bg-ink hover:shadow-[0_0_32px_rgba(34,211,238,0.45)]',
        variant === 'outline' && 'border border-mute/30 text-ink hover:border-cyan hover:text-cyan',
        variant === 'ghost' && 'text-mute hover:bg-surface-2 hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cx(
        'inline-flex size-10 items-center justify-center rounded-full border border-mute/20 text-mute transition-colors hover:border-cyan hover:text-cyan active:scale-95 disabled:opacity-35 disabled:pointer-events-none aria-pressed:border-cyan aria-pressed:bg-cyan/10 aria-pressed:text-cyan',
        className,
      )}
    >
      {children}
    </button>
  );
}

interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
}
export function Segmented<T extends string>({ value, options, onChange, label, className }: { value: T; options: SegOption<T>[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex rounded-full border border-mute/20 bg-void/60 p-1', className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              e.preventDefault();
              const i = options.findIndex((x) => x.value === value);
              const next = options[(i + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length]!;
              onChange(next.value);
              (e.currentTarget.parentElement?.querySelectorAll('button')[options.indexOf(next)] as HTMLButtonElement | undefined)?.focus();
            }}
            tabIndex={on ? 0 : -1}
            className={cx(
              'min-h-9 rounded-full px-4 text-sm transition-all duration-300',
              on ? 'bg-ink text-void shadow' : 'text-mute hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  valueText?: string;
  className?: string;
}
export function Slider({ id, label, value, min, max, step = 1, onChange, valueText, className }: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={className}>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-mute">
          {label}
        </label>
        {valueText && <output htmlFor={id} className="font-mono text-sm text-ink">{valueText}</output>}
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--fill' as string]: `${fill}%` }}
      />
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('glass corner-ticks rounded-2xl', className)}>{children}</div>;
}

export function Readout({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mute">{label}</div>
      <div className={cx('mt-1 font-mono text-2xl tabular-nums', accent ? 'text-cyan' : 'text-ink')}>
        {value}
        {unit && <span className="ml-1 text-sm text-mute">{unit}</span>}
      </div>
    </div>
  );
}

export function Note({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <p className={cx('rounded-xl border px-4 py-3 text-sm leading-relaxed', tone === 'warn' ? 'border-warn/30 bg-warn/5 text-amber-100' : 'border-science/25 bg-science/5 text-sky-100')}>
      {children}
    </p>
  );
}

/** Etiqueta de esquema: deja claro que la figura es una representación, no una imagen real. */
export function SchemaTag({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-mute/20 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute">{children}</span>;
}
