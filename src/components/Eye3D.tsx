import { useEffect, useRef, useState } from 'react';
import { hasWebGL, useReducedMotion } from '@/lib/hooks';
import type { EyeSceneHandle } from '@/three/eyeScene';
import { cx } from './ui';

interface Props {
  className?: string;
  pupilMm?: number;
  label?: string;
}

/**
 * Ojo 3D en tiempo real (three.js, carga diferida). Si WebGL no está disponible
 * o falla, muestra un esquema 2D claramente identificado como tal.
 */
export function Eye3D({ className, pupilMm = 4, label = 'Modelo 3D procedural de un ojo humano que sigue el movimiento del cursor' }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<EyeSceneHandle | null>(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  const pupilRef = useRef(pupilMm);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>(() => (typeof document !== 'undefined' && hasWebGL() ? 'loading' : 'fallback'));
  const fallback = status === 'fallback';

  useEffect(() => {
    if (fallback) return;
    const host = hostRef.current;
    const wrap = wrapRef.current;
    if (!host || !wrap) return;
    // un canvas nuevo por escena: evita heredar estado de un contexto WebGL anterior
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', label);
    canvas.className = 'block size-full';
    host.appendChild(canvas);
    let disposed = false;
    let io: IntersectionObserver | undefined;
    import('@/three/eyeScene')
      .then(({ createEyeScene }) => {
        if (disposed) return;
        try {
          const h = createEyeScene(canvas, { reducedMotion: reducedRef.current, pupilMm: pupilRef.current });
          handleRef.current = h;
          setStatus('ready');
          io = new IntersectionObserver(([e]) => h.setActive(!!e?.isIntersecting), { rootMargin: '100px' });
          io.observe(wrap);
        } catch {
          setStatus('fallback');
        }
      })
      .catch(() => setStatus('fallback'));
    return () => {
      disposed = true;
      io?.disconnect();
      handleRef.current?.dispose();
      handleRef.current = null;
      canvas.remove();
    };
  }, [fallback, label]);

  useEffect(() => {
    reducedRef.current = reduced;
    handleRef.current?.setReducedMotion(reduced);
  }, [reduced]);

  useEffect(() => {
    pupilRef.current = pupilMm;
    handleRef.current?.setPupilMm(pupilMm);
  }, [pupilMm]);

  return (
    <div ref={wrapRef} className={className ?? 'relative'}>
      {status !== 'fallback' ? (
        <div ref={hostRef} className={cx('size-full transition-opacity duration-1000', status === 'ready' ? 'opacity-100' : 'opacity-0')} />
      ) : (
        <EyeFallback2D />
      )}
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <div className="size-24 rounded-full border border-science/30 border-t-cyan animate-spin" />
        </div>
      )}
    </div>
  );
}

/** Vista frontal esquemática (sin WebGL). */
export function EyeFallback2D() {
  const fibers = Array.from({ length: 64 }, (_, i) => (i / 64) * Math.PI * 2);
  return (
    <figure className="relative grid size-full place-items-center">
      <svg viewBox="-200 -200 400 400" className="size-full max-h-full" role="img" aria-label="Esquema 2D frontal del ojo: esclerótica, iris y pupila">
        <defs>
          <radialGradient id="fb-sclera" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#f8fafc" />
            <stop offset="1" stopColor="#94a3b8" />
          </radialGradient>
          <radialGradient id="fb-iris">
            <stop offset="0.2" stopColor="#6b5a3a" />
            <stop offset="0.45" stopColor="#3d6f87" />
            <stop offset="1" stopColor="#0d1824" />
          </radialGradient>
        </defs>
        <circle r="150" fill="url(#fb-sclera)" />
        <circle r="78" fill="url(#fb-iris)" />
        {fibers.map((a) => (
          <line key={a} x1={Math.cos(a) * 18} y1={Math.sin(a) * 18} x2={Math.cos(a) * 74} y2={Math.sin(a) * 74} stroke="#9fd3e6" strokeOpacity="0.25" />
        ))}
        <circle r="26" fill="#020203" />
        <ellipse cx="-30" cy="-34" rx="16" ry="10" fill="#fff" fillOpacity="0.7" />
        <circle r="175" fill="none" stroke="#38bdf8" strokeOpacity="0.4" strokeDasharray="4 6" />
      </svg>
      <figcaption className="absolute bottom-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute">Esquema 2D · WebGL no disponible</figcaption>
    </figure>
  );
}
