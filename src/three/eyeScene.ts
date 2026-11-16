import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Ojo 3D procedural: esclerótica con vasos, iris con fibras radiales,
 * pupila de tamaño variable y córnea transparente que refracta (transmission).
 * Todo se genera por código: no hay modelos ni texturas externas que descargar.
 * Proporciones basadas en el ojo adulto (radio del globo ≈ 12 mm → 1 unidad).
 */

export interface EyeSceneOptions {
  reducedMotion: boolean;
  /** Diámetro pupilar inicial en mm. */
  pupilMm?: number;
  particles?: boolean;
}

export interface EyeSceneHandle {
  setPupilMm: (mm: number) => void;
  setReducedMotion: (on: boolean) => void;
  setActive: (on: boolean) => void;
  dispose: () => void;
}

const IRIS_R = 0.52; // ≈ 6 mm de radio (diámetro corneal visible ≈ 11,5 mm)
const MM = 1 / 12; // 1 mm en unidades de escena

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function scleraTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  // fila superior = limbo; fila inferior = polo posterior
  const base = g.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, '#c9ced6');
  base.addColorStop(0.05, '#e9edf2');
  base.addColorStop(0.5, '#f1f3f6');
  base.addColorStop(1, '#e6e1dc');
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const r = rand(7);
  // vasos conjuntivales: nacen lejos del limbo y se adelgazan hacia él
  for (let i = 0; i < 46; i++) {
    let x = r() * w;
    let y = h * (0.32 + r() * 0.35);
    let width = 1.2 + r() * 2.2;
    g.strokeStyle = `rgba(${170 + r() * 40},${50 + r() * 30},${60 + r() * 25},${0.28 + r() * 0.3})`;
    g.lineCap = 'round';
    const target = h * (0.03 + r() * 0.08);
    while (y > target && width > 0.25) {
      const nx = x + (r() - 0.5) * 14;
      const ny = y - (6 + r() * 9);
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(nx, ny);
      g.stroke();
      if (r() < 0.06) {
        // ramificación corta
        g.lineWidth = width * 0.6;
        g.beginPath();
        g.moveTo(nx, ny);
        g.lineTo(nx + (r() - 0.5) * 40, ny - 10 - r() * 20);
        g.stroke();
      }
      x = nx;
      y = ny;
      width *= 0.965;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function irisTexture(): THREE.CanvasTexture {
  const s = 1024;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const g = c.getContext('2d')!;
  const cx = s / 2;
  const R = s / 2;
  const r = rand(42);
  const bg = g.createRadialGradient(cx, cx, R * 0.1, cx, cx, R);
  bg.addColorStop(0, '#3b2a1c');
  bg.addColorStop(0.24, '#6b5a3a');
  bg.addColorStop(0.36, '#5f7f8a');
  bg.addColorStop(0.7, '#3d6f87');
  bg.addColorStop(0.9, '#25465b');
  bg.addColorStop(1, '#0d1824');
  g.fillStyle = bg;
  g.beginPath();
  g.arc(cx, cx, R, 0, Math.PI * 2);
  g.fill();

  // fibras radiales (estroma)
  for (let i = 0; i < 1400; i++) {
    const a = r() * Math.PI * 2;
    const r0 = R * (0.16 + r() * 0.08);
    const r1 = R * (0.55 + r() * 0.42);
    const wob = (r() - 0.5) * 0.06;
    const light = r() < 0.55;
    g.strokeStyle = light ? `rgba(${150 + r() * 80},${190 + r() * 50},${205 + r() * 40},${0.08 + r() * 0.22})` : `rgba(8,20,30,${0.1 + r() * 0.25})`;
    g.lineWidth = 0.6 + r() * 1.8;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0, cx + Math.sin(a) * r0);
    g.quadraticCurveTo(cx + Math.cos(a + wob) * (r0 + r1) * 0.5, cx + Math.sin(a + wob) * (r0 + r1) * 0.5, cx + Math.cos(a + wob * 2) * r1, cx + Math.sin(a + wob * 2) * r1);
    g.stroke();
  }
  // collarete (anillo ondulado que separa zona pupilar y ciliar)
  g.strokeStyle = 'rgba(214,180,120,0.45)';
  g.lineWidth = 5;
  g.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const rr = R * (0.36 + Math.sin(a * 11) * 0.012 + Math.sin(a * 5) * 0.01);
    const x = cx + Math.cos(a) * rr;
    const y = cx + Math.sin(a) * rr;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  // criptas
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2;
    const rr = R * (0.4 + r() * 0.3);
    g.fillStyle = `rgba(5,14,22,${0.25 + r() * 0.3})`;
    g.save();
    g.translate(cx + Math.cos(a) * rr, cx + Math.sin(a) * rr);
    g.rotate(a);
    g.beginPath();
    g.ellipse(0, 0, 6 + r() * 16, 2 + r() * 4, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  // anillo limbar oscuro
  const lim = g.createRadialGradient(cx, cx, R * 0.82, cx, cx, R);
  lim.addColorStop(0, 'rgba(5,10,18,0)');
  lim.addColorStop(1, 'rgba(5,10,18,0.92)');
  g.fillStyle = lim;
  g.beginPath();
  g.arc(cx, cx, R, 0, Math.PI * 2);
  g.fill();
  // ruff pupilar (borde pigmentado)
  g.strokeStyle = 'rgba(40,25,15,0.9)';
  g.lineWidth = 10;
  g.beginPath();
  g.arc(cx, cx, R * 0.165, 0, Math.PI * 2);
  g.stroke();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function createEyeScene(canvas: HTMLCanvasElement, options: EyeSceneOptions): EyeSceneHandle {
  const opts = { ...options };
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 5.6);

  const disposables: { dispose: () => void }[] = [envTex, pmrem];
  const track = <T extends { dispose: () => void }>(o: T) => {
    disposables.push(o);
    return o;
  };

  const eye = new THREE.Group();
  scene.add(eye);

  // Esclerótica: esfera con una abertura frontal (limbo)
  const limbusTheta = Math.asin(IRIS_R);
  const scleraGeo = track(new THREE.SphereGeometry(1, 128, 96, 0, Math.PI * 2, limbusTheta, Math.PI - limbusTheta));
  scleraGeo.rotateX(Math.PI / 2);
  const scleraTex = track(scleraTexture());
  const sclera = new THREE.Mesh(
    scleraGeo,
    track(new THREE.MeshPhysicalMaterial({ map: scleraTex, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.15, sheen: 0.3, sheenColor: new THREE.Color('#ffd9d9') })),
  );
  eye.add(sclera);

  // Interior oscuro (coroides/retina vista a través de la abertura)
  const inner = new THREE.Mesh(track(new THREE.SphereGeometry(0.985, 48, 32)), track(new THREE.MeshBasicMaterial({ color: '#120506', side: THREE.BackSide })));
  eye.add(inner);

  // Iris
  const irisZ = Math.sqrt(1 - IRIS_R ** 2) - 0.03;
  const irisTex = track(irisTexture());
  const iris = new THREE.Mesh(track(new THREE.CircleGeometry(IRIS_R + 0.02, 128)), track(new THREE.MeshStandardMaterial({ map: irisTex, roughness: 0.75, metalness: 0 })));
  iris.position.z = irisZ;
  eye.add(iris);

  // Pupila
  const pupil = new THREE.Mesh(track(new THREE.CircleGeometry(1, 96)), track(new THREE.MeshBasicMaterial({ color: '#020203' })));
  pupil.position.z = irisZ + 0.002;
  eye.add(pupil);
  let pupilTarget = (opts.pupilMm ?? 4) / 2;
  let pupilCurrent = pupilTarget;
  const applyPupil = (radiusMm: number) => pupil.scale.setScalar(radiusMm * MM);
  applyPupil(pupilCurrent);

  // Córnea: casquete esférico de radio 7,8 mm con transmisión (refracta el iris)
  const corneaR = 7.8 * MM;
  const capTheta = Math.asin(IRIS_R / corneaR);
  const corneaGeo = track(new THREE.SphereGeometry(corneaR, 96, 48, 0, Math.PI * 2, 0, capTheta));
  corneaGeo.rotateX(Math.PI / 2);
  const cornea = new THREE.Mesh(
    corneaGeo,
    track(new THREE.MeshPhysicalMaterial({ transmission: 1, thickness: 0.08, ior: 1.376, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0, specularIntensity: 1, envMapIntensity: 1.4, transparent: true })),
  );
  cornea.position.z = Math.sqrt(1 - IRIS_R ** 2) - corneaR * Math.cos(capTheta);
  eye.add(cornea);

  // Anillos técnicos (HUD) alrededor del globo
  const hud = new THREE.Group();
  const ringMat = track(new THREE.LineDashedMaterial({ color: '#38bdf8', dashSize: 0.04, gapSize: 0.05, transparent: true, opacity: 0.45 }));
  const ringMat2 = track(new THREE.LineBasicMaterial({ color: '#22d3ee', transparent: true, opacity: 0.18 }));
  const circle = (r: number, seg = 180) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    return track(new THREE.BufferGeometry().setFromPoints(pts));
  };
  const r1 = new THREE.Line(circle(1.16), ringMat);
  r1.computeLineDistances();
  const r2 = new THREE.Line(circle(1.24), ringMat2);
  const ticksGeo = track(new THREE.BufferGeometry());
  const tickPts: number[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const len = i % 6 === 0 ? 0.08 : 0.035;
    tickPts.push(Math.cos(a) * 1.24, Math.sin(a) * 1.24, 0, Math.cos(a) * (1.24 + len), Math.sin(a) * (1.24 + len), 0);
  }
  ticksGeo.setAttribute('position', new THREE.Float32BufferAttribute(tickPts, 3));
  const ticks = new THREE.LineSegments(ticksGeo, ringMat2);
  hud.add(r1, r2, ticks);
  hud.rotation.x = 0.08;
  scene.add(hud);

  // Partículas ambientales discretas
  let points: THREE.Points | null = null;
  if (opts.particles !== false) {
    const n = 420;
    const pos = new Float32Array(n * 3);
    const rr = rand(3);
    for (let i = 0; i < n; i++) {
      const rad = 1.9 + rr() * 3.2;
      const th = rr() * Math.PI * 2;
      const ph = Math.acos(2 * rr() - 1);
      pos[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = rad * Math.cos(ph) - 1.5;
    }
    const pg = track(new THREE.BufferGeometry());
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    points = new THREE.Points(pg, track(new THREE.PointsMaterial({ color: '#7dd3fc', size: 0.018, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })));
    scene.add(points);
  }

  // Iluminación «científica»: luz principal fría, contraluz cian y relleno violeta
  const key = new THREE.DirectionalLight('#f1f5ff', 2.2);
  key.position.set(-2.5, 2.2, 4);
  const rim = new THREE.DirectionalLight('#22d3ee', 2.4);
  rim.position.set(3, 0.5, -2.5);
  const fill = new THREE.DirectionalLight('#818cf8', 0.7);
  fill.position.set(-3, -2, 1);
  scene.add(key, rim, fill, new THREE.AmbientLight('#94a3b8', 0.25));

  // Interacción: mirada que sigue al cursor
  const target = new THREE.Vector2(0, 0);
  const look = new THREE.Vector2(0, 0);
  let lastPointer = 0;
  const onPointer = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    target.set(THREE.MathUtils.clamp(nx, -1, 1), THREE.MathUtils.clamp(ny, -1, 1));
    lastPointer = performance.now();
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // en pantallas estrechas alejar la cámara para que el globo y los anillos entren
    camera.position.z = 5.6 / Math.min(1, w / h);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let active = true;
  let raf = 0;
  let lastT = performance.now();
  let elapsed = 0;
  let nextSaccade = 0;
  const idle = new THREE.Vector2();

  const frame = () => {
    raf = 0;
    if (!active) return;
    const now = performance.now();
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    elapsed += dt;
    const t = elapsed;
    // sin cursor reciente: pequeños movimientos sacádicos espontáneos
    if (!opts.reducedMotion && now - lastPointer > 2500 && t > nextSaccade) {
      idle.set((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.45);
      nextSaccade = t + 1.4 + Math.random() * 2.2;
      target.copy(idle);
    }
    const k = 1 - Math.exp(-dt * (opts.reducedMotion ? 4 : 7));
    look.lerp(target, k);
    eye.rotation.y = look.x * 0.45;
    eye.rotation.x = look.y * 0.32;
    hud.rotation.y = look.x * 0.12;
    if (!opts.reducedMotion) {
      r1.rotation.z = t * 0.05;
      eye.position.y = Math.sin(t * 0.8) * 0.02;
      if (points) points.rotation.y = t * 0.015;
      // hippus: oscilación fisiológica leve del tamaño pupilar
      pupilCurrent += (pupilTarget + Math.sin(t * 1.3) * 0.04 - pupilCurrent) * (1 - Math.exp(-dt * 3));
    } else {
      pupilCurrent += (pupilTarget - pupilCurrent) * (1 - Math.exp(-dt * 6));
    }
    applyPupil(pupilCurrent);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (!raf && active) {
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  start();

  const onVis = () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else start();
  };
  document.addEventListener('visibilitychange', onVis);

  return {
    setPupilMm(mm) {
      pupilTarget = THREE.MathUtils.clamp(mm, 1.5, 8.5) / 2;
    },
    setReducedMotion(on) {
      opts.reducedMotion = on;
    },
    setActive(on) {
      active = on;
      if (on) start();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    dispose() {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
