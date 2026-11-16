import { useEffect, useRef } from 'react';
import { ArrowDown, ScanEye } from 'lucide-react';
import { Eye3D } from '@/components/Eye3D';
import { Button } from '@/components/ui';
import { prefersReducedMotion, scrollToId } from '@/lib/hooks';

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl.from('[data-hero-eye]', { scale: 0.82, opacity: 0, duration: 2.2 })
          .from('[data-hero-line]', { yPercent: 110, duration: 1.4, stagger: 0.09 }, 0.25)
          .from('[data-hero-fade]', { opacity: 0, y: 16, duration: 1.1, stagger: 0.08 }, 0.7);
        // al hacer scroll, el ojo se acerca y se desvanece (transición hacia la anatomía)
        gsap.to('[data-hero-scrub]', {
          scale: 1.25,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section id="inicio" ref={root} aria-labelledby="inicio-title" className="tech-grid relative flex min-h-[100svh] flex-col overflow-hidden px-4 pt-20 pb-10 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12),transparent_60%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />

      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-6 lg:grid-cols-12">
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-6">
          <p data-hero-fade className="eyebrow mb-6 flex items-center gap-2">
            <ScanEye className="size-4" aria-hidden="true" /> Interactive Anatomy &amp; Vision Laboratory
          </p>
          <h1 id="inicio-title" className="display text-[clamp(3.2rem,11vw,8.5rem)]">
            <span className="block overflow-hidden pb-1"><span data-hero-line className="block">THE</span></span>
            <span className="block overflow-hidden pb-1"><span data-hero-line className="block">HUMAN</span></span>
            <span className="block overflow-hidden pb-2"><span data-hero-line className="block bg-gradient-to-r from-ink via-science to-cyan bg-clip-text text-transparent">EYE</span></span>
          </h1>
          <p data-hero-fade className="mt-6 max-w-md text-lg leading-relaxed text-mute sm:text-xl">Una ventana biológica hacia el universo visual.</p>
          <p data-hero-fade className="mt-3 max-w-md text-sm leading-relaxed text-mute/80">
            Descubre cómo el mundo se transforma en imágenes dentro de tu cerebro: anatomía, óptica, fotorreceptores y experimentos que puedes hacer ahora mismo.
          </p>
          <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-4">
            <Button variant="primary" onClick={() => scrollToId('anatomia')} className="!min-h-12 !px-7 tracking-[0.08em]">
              EXPLORAR EL OJO
            </Button>
            <Button variant="ghost" onClick={() => scrollToId('experimentos')}>Ir a los experimentos</Button>
          </div>
        </div>

        <div data-hero-eye className="relative order-1 aspect-square w-full max-w-[min(88vw,640px)] justify-self-center lg:order-2 lg:col-span-6 lg:max-w-none">
          <div data-hero-scrub className="absolute inset-0">
            <Eye3D className="absolute inset-0" />
            <HudLabels />
          </div>
        </div>
      </div>

      <div data-hero-fade className="relative mx-auto mt-6 flex w-full max-w-7xl items-end justify-between font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mute">
        <button type="button" onClick={() => scrollToId('anatomia')} className="group flex items-center gap-3 hover:text-ink">
          <span className="relative flex h-9 w-5 justify-center rounded-full border border-mute/40" aria-hidden="true">
            <span className="animate-scroll-cue mt-1.5 block h-1.5 w-1 rounded-full bg-cyan" />
          </span>
          Desliza para explorar <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
        </button>
        <span className="hidden sm:block">Modelo procedural · tiempo real</span>
      </div>
    </section>
  );
}

function HudLabels() {
  const items = [
    { t: 'Ø globo ≈ 24 mm', cls: 'left-[4%] top-[14%]' },
    { t: 'Córnea · 43 D', cls: 'right-[2%] top-[30%]' },
    { t: 'Pupila 2–8 mm', cls: 'left-[2%] bottom-[24%]' },
    { t: '~ 1 M axones', cls: 'right-[6%] bottom-[12%]' },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
      {items.map((i) => (
        <span key={i.t} data-hero-fade className={`absolute ${i.cls} flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-science/80`}>
          <span className="animate-pulse-dot size-1.5 rounded-full bg-cyan" />
          {i.t}
        </span>
      ))}
    </div>
  );
}
