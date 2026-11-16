import type { KeyboardEvent, ReactNode } from 'react';
import {
  C,
  FOVEA,
  OPTIC_DISC,
  ORA_DEG,
  R_CHOROID,
  R_RETINA,
  R_SCLERA,
  R_VITREOUS,
  LIMBUS_DEG,
  aqueousPath,
  arc,
  ciliaryPath,
  ciliaryTip,
  corneaPath,
  irisPath,
  lensPath,
  lensShape,
  opticNervePath,
} from '@/lib/geometry';
import { STRUCTURE_BY_ID, type StructureId } from '@/data/structures';

export type ViewMode = 'anatomic' | 'simple';

interface Props {
  mode?: ViewMode;
  selected?: StructureId | null;
  hovered?: StructureId | null;
  /** Estructuras resaltadas además de la seleccionada (p. ej. paso del recorrido de la luz). */
  emphasis?: StructureId[];
  dimOthers?: boolean;
  onSelect?: (id: StructureId) => void;
  onHover?: (id: StructureId | null) => void;
  pupilR?: number;
  accommodation?: number;
  /** 0–1: contracción del músculo ciliar (para la sección de acomodación). */
  ciliaryContraction?: number;
  idPrefix?: string;
  children?: ReactNode;
}

const PALETTE = {
  sclera: '#e2e8f0',
  choroid: '#9f3a4b',
  retina: '#fb7185',
  cornea: '#7dd3fc',
  aqueous: '#22d3ee',
  vitreous: '#38bdf8',
  lens: '#c7d2fe',
  iris: '#818cf8',
  nerve: '#fbbf24',
  ciliary: '#a78bfa',
};

export function EyeCrossSection({
  mode = 'anatomic',
  selected = null,
  hovered = null,
  emphasis = [],
  dimOthers = true,
  onSelect,
  onHover,
  pupilR = 30,
  accommodation = 0,
  ciliaryContraction,
  idPrefix = 'ecs',
  children,
}: Props) {
  const interactive = !!onSelect;
  const anat = mode === 'anatomic';
  const focusSet = new Set<StructureId>([...(selected ? [selected] : []), ...emphasis]);
  const anyFocus = focusSet.size > 0;
  const cc = ciliaryContraction ?? accommodation;
  const lens = lensShape(accommodation);

  const state = (id: StructureId) => {
    const on = focusSet.has(id);
    const hov = hovered === id;
    return { on, hov, opacity: anyFocus && dimOthers && !on && !hov ? 0.28 : 1 };
  };

  const g = (id: StructureId, content: ReactNode) => {
    const s = state(id);
    const info = STRUCTURE_BY_ID[id];
    const handlers = interactive
      ? {
          role: 'button',
          tabIndex: 0,
          'aria-label': `${info.n}. ${info.name}`,
          'aria-pressed': selected === id,
          onClick: () => onSelect?.(id),
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect?.(id);
            }
          },
          onPointerEnter: () => onHover?.(id),
          onPointerLeave: () => onHover?.(null),
          onFocus: () => onHover?.(id),
          onBlur: () => onHover?.(null),
          style: { cursor: 'pointer', outline: 'none' },
        }
      : { 'aria-hidden': true };
    return (
      <g
        key={id}
        data-structure={id}
        className="transition-opacity duration-500"
        opacity={s.opacity}
        filter={s.on ? `url(#${idPrefix}-glow)` : undefined}
        {...handlers}
      >
        {content}
      </g>
    );
  };

  const stroke = (id: StructureId, base: string) => (state(id).on || state(id).hov ? '#f8fafc' : base);

  const zonules = (side: -1 | 1) => {
    const tip = ciliaryTip(side, cc);
    const eq = { x: lens.equatorX, y: C.y + side * lens.half };
    const slack = cc * 7; // fibras flojas cuando el músculo ciliar se contrae
    return [-5, 0, 5].map((dx) => {
      const x1 = eq.x + dx * 0.8;
      const y1 = eq.y + side * 1;
      const x2 = tip.x + dx;
      const y2 = tip.y - side * 2;
      const mx = (x1 + x2) / 2 + slack;
      const my = (y1 + y2) / 2;
      return <path key={`${side}${dx}`} d={`M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} stroke="#cbd5e1" strokeOpacity={0.55} strokeWidth={0.9} fill="none" />;
    });
  };

  return (
    <g>
      <defs>
        <radialGradient id={`${idPrefix}-vit`} cx="0.45" cy="0.5" r="0.6">
          <stop offset="0" stopColor={PALETTE.vitreous} stopOpacity={anat ? 0.1 : 0.06} />
          <stop offset="1" stopColor={PALETTE.vitreous} stopOpacity={anat ? 0.02 : 0.06} />
        </radialGradient>
        <linearGradient id={`${idPrefix}-lens`} x1="0" x2="1">
          <stop offset="0" stopColor={PALETTE.lens} stopOpacity={0.75} />
          <stop offset="0.6" stopColor={PALETTE.lens} stopOpacity={0.45} />
          <stop offset="1" stopColor={PALETTE.lens} stopOpacity={0.6} />
        </linearGradient>
        <filter id={`${idPrefix}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 6 · Humor vítreo (cavidad posterior) */}
      {g(
        'vitreo',
        <>
          <circle cx={C.x} cy={C.y} r={R_VITREOUS} fill={`url(#${idPrefix}-vit)`} stroke={state('vitreo').on ? PALETTE.vitreous : 'none'} strokeDasharray="3 5" />
          {anat && (
            <g stroke={PALETTE.vitreous} strokeOpacity={0.08} fill="none">
              <path d={`M${lens.posteriorApex + 20} ${C.y - 90} Q ${C.x + 40} ${C.y - 60} ${C.x + 130} ${C.y - 70}`} />
              <path d={`M${lens.posteriorApex + 20} ${C.y + 80} Q ${C.x + 40} ${C.y + 60} ${C.x + 130} ${C.y + 75}`} />
            </g>
          )}
        </>,
      )}

      {/* 10 · Nervio óptico */}
      {g(
        'nervio',
        <>
          <path d={opticNervePath()} fill={PALETTE.nerve} fillOpacity={anat ? 0.22 : 0.3} stroke={stroke('nervio', PALETTE.nerve)} strokeWidth={1.5} />
          {anat && (
            <g stroke={PALETTE.nerve} strokeOpacity={0.45} strokeWidth={0.8}>
              {[-14, -7, 0, 7, 14].map((o) => {
                const a = (15 * Math.PI) / 180;
                const px = -Math.sin(a) * o;
                const py = Math.cos(a) * o;
                return (
                  <line
                    key={o}
                    x1={OPTIC_DISC.x + px + Math.cos(a) * 14}
                    y1={OPTIC_DISC.y + py + Math.sin(a) * 14}
                    x2={OPTIC_DISC.x + px + Math.cos(a) * 185}
                    y2={OPTIC_DISC.y + py + Math.sin(a) * 185}
                  />
                );
              })}
            </g>
          )}
        </>,
      )}

      {/* 9 · Esclerótica */}
      {g(
        'esclerotica',
        <>
          <path d={arc(-LIMBUS_DEG, LIMBUS_DEG, R_SCLERA)} fill="none" stroke={stroke('esclerotica', PALETTE.sclera)} strokeWidth={10} strokeOpacity={0.9} />
          <path d={arc(-LIMBUS_DEG, LIMBUS_DEG, R_SCLERA)} fill="none" stroke="transparent" strokeWidth={18} />
        </>,
      )}

      {/* 8 · Coroides */}
      {g(
        'coroides',
        <>
          <path d={arc(-ORA_DEG, ORA_DEG, R_CHOROID)} fill="none" stroke={stroke('coroides', PALETTE.choroid)} strokeWidth={6} />
          <path d={arc(-ORA_DEG, ORA_DEG, R_CHOROID)} fill="none" stroke="transparent" strokeWidth={9} />
        </>,
      )}

      {/* 7 · Retina */}
      {g(
        'retina',
        <>
          <path d={arc(-ORA_DEG, 11, R_RETINA)} fill="none" stroke={stroke('retina', PALETTE.retina)} strokeWidth={7} strokeLinecap="round" />
          <path d={arc(19, ORA_DEG, R_RETINA)} fill="none" stroke={stroke('retina', PALETTE.retina)} strokeWidth={7} strokeLinecap="round" />
          <path d={arc(-ORA_DEG, ORA_DEG, R_RETINA - 1)} fill="none" stroke="transparent" strokeWidth={12} />
          {anat && (
            <>
              {/* depresión foveal y mácula */}
              <path d={arc(-6, 6, R_RETINA - 4)} fill="none" stroke="#fde68a" strokeWidth={3} strokeOpacity={0.9} />
              <circle cx={FOVEA.x} cy={FOVEA.y} r={3} fill="#fde68a" />
              {/* disco óptico */}
              <circle cx={OPTIC_DISC.x} cy={OPTIC_DISC.y} r={5} fill="#0b1220" stroke={PALETTE.nerve} strokeWidth={1.5} />
            </>
          )}
        </>,
      )}

      {/* Cuerpo ciliar y zónulas (parte de la úvea; no seleccionables, apoyan al cristalino) */}
      {anat || ciliaryContraction !== undefined ? (
        <g aria-hidden="true" opacity={anyFocus && dimOthers && !focusSet.has('cristalino') ? 0.35 : 1} className="transition-opacity duration-500">
          {([-1, 1] as const).map((side) => (
            <g key={side}>
              <path d={ciliaryPath(side, cc)} fill={PALETTE.ciliary} fillOpacity={0.35 + 0.3 * cc} stroke={PALETTE.ciliary} strokeOpacity={0.8} strokeWidth={1} />
              {zonules(side)}
            </g>
          ))}
        </g>
      ) : null}

      {/* 2 · Humor acuoso */}
      {g(
        'acuoso',
        <path d={aqueousPath(pupilR, accommodation)} fill={PALETTE.aqueous} fillOpacity={state('acuoso').on ? 0.32 : anat ? 0.1 : 0.14} stroke={state('acuoso').on ? PALETTE.aqueous : 'none'} strokeWidth={1} />,
      )}

      {/* 5 · Cristalino */}
      {g(
        'cristalino',
        <>
          <path
            d={lensPath(accommodation)}
            fill={anat ? `url(#${idPrefix}-lens)` : PALETTE.lens}
            fillOpacity={anat ? 1 : 0.5}
            stroke={stroke('cristalino', '#a5b4fc')}
            strokeWidth={1.6}
            style={{ transition: 'd 0.9s cubic-bezier(0.16,1,0.3,1)' }}
          />
          {anat && (
            <ellipse
              cx={(lens.anteriorApex + lens.posteriorApex) / 2 + 3}
              cy={C.y}
              rx={(lens.posteriorApex - lens.anteriorApex) * 0.28}
              ry={lens.half * 0.55}
              fill="#e0e7ff"
              fillOpacity={0.25}
              style={{ transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}
            />
          )}
        </>,
      )}

      {/* 3 · Iris */}
      {g(
        'iris',
        <>
          {([-1, 1] as const).map((side) => (
            <path
              key={side}
              d={irisPath(side, pupilR)}
              fill={PALETTE.iris}
              fillOpacity={anat ? 0.75 : 0.85}
              stroke={stroke('iris', '#a5b4fc')}
              strokeWidth={1}
              style={{ transition: 'd 0.6s cubic-bezier(0.16,1,0.3,1)' }}
            />
          ))}
        </>,
      )}

      {/* 4 · Pupila (abertura: zona de paso entre los bordes del iris) */}
      {g(
        'pupila',
        <>
          <rect
            x={318}
            y={C.y - pupilR}
            width={14}
            height={pupilR * 2}
            fill={state('pupila').on ? '#22d3ee' : '#020617'}
            fillOpacity={state('pupila').on ? 0.25 : 0.001}
            stroke={state('pupila').on ? '#22d3ee' : 'none'}
            strokeDasharray="2 3"
            style={{ transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </>,
      )}

      {/* 1 · Córnea */}
      {g(
        'cornea',
        <>
          <path d={corneaPath()} fill="none" stroke={stroke('cornea', PALETTE.cornea)} strokeWidth={8} strokeOpacity={0.85} strokeLinecap="round" />
          <path d={corneaPath()} fill="none" stroke="transparent" strokeWidth={16} />
        </>,
      )}

      {children}
    </g>
  );
}
