# HUMAN EYE — Inside the Vision

Laboratorio digital interactivo sobre el ojo humano (anatomía, óptica, retina, experimentos y evaluación). Material educativo para educación media; no es una herramienta diagnóstica.

## Stack
React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · three.js (ojo 3D procedural, carga diferida) · GSAP + ScrollTrigger · lucide-react · Vitest.
Framer Motion y React Three Fiber no se usan: las microinteracciones se resuelven con CSS y la escena 3D es lo bastante simple para three.js directo.

## Comandos
```bash
npm install
npm run dev      # http://localhost:5190
npm run check    # typecheck + tests + build
npm run preview  # sirve dist/ en http://localhost:5191
```

## Estructura
- `src/sections/` — las 10 secciones (Hero, Anatomy, LightPath, Pupil, Accommodation, Retina, Experiments, Quiz, Summary, Final + referencias).
- `src/components/` — `EyeCrossSection` (esquema SVG en corte, reutilizado por anatomía, recorrido de la luz y acomodación), `Eye3D` (WebGL con alternativa 2D), `Nav`, primitivas de UI.
- `src/three/eyeScene.ts` — ojo 3D generado por código (sin modelos ni texturas externas).
- `src/lib/geometry.ts` — geometría del «ojo esquemático» adulto (16 unidades ≈ 1 mm).
- `src/lib/physio.ts` — modelos: diámetro pupilar (Moon & Spencer / Watson & Yellott), demanda de acomodación, densidades de conos y bastones (aprox. Østerberg / Curcio).
- `src/data/` — contenido científico (estructuras, pasos, preguntas, referencias).

## Accesibilidad y rendimiento
Navegación por teclado (estructuras del esquema, pestañas, grupos de opciones), foco visible, `prefers-reduced-motion` (sin movimiento automático, GSAP desactivado), three.js y GSAP en chunks bajo demanda, render 3D pausado fuera de pantalla y con la pestaña oculta, alternativa 2D sin WebGL.
