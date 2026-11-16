import { describe, expect, it } from 'vitest';
import { accommodationDemandD, blindSpotDistanceCm, coneDensity, pupilDiameterMm, rodDensity, sceneFor, sliderToLuminance } from './physio';
import { QUIZ } from '@/data/quiz';
import { STRUCTURES } from '@/data/structures';
import { LIGHT_STEPS } from '@/data/lightPath';
import { lensShape, corneaXAt, CORNEA_APEX_X, LIMBUS_X, PX_PER_MM } from './geometry';

describe('modelo pupilar (Moon & Spencer)', () => {
  it('se mantiene en el rango fisiológico 2–8 mm', () => {
    expect(pupilDiameterMm(1e-4)).toBeGreaterThan(7.3);
    expect(pupilDiameterMm(1e-4)).toBeLessThan(8);
    expect(pupilDiameterMm(1e5)).toBeGreaterThan(1.9);
    expect(pupilDiameterMm(1e5)).toBeLessThan(2.3);
  });
  it('disminuye de forma monótona al aumentar la luz', () => {
    let prev = Infinity;
    for (let p = 0; p <= 100; p += 5) {
      const d = pupilDiameterMm(sliderToLuminance(p));
      expect(d).toBeLessThan(prev);
      prev = d;
    }
  });
  it('clasifica escenas', () => {
    expect(sceneFor(0.001).label).toMatch(/Noche/);
    expect(sceneFor(50_000).label).toMatch(/sol/i);
  });
});

describe('óptica', () => {
  it('demanda de acomodación = 1/d', () => {
    expect(accommodationDemandD(0.25)).toBe(4);
    expect(accommodationDemandD(Infinity)).toBe(0);
  });
  it('el cristalino se vuelve más grueso al acomodar', () => {
    const far = lensShape(0);
    const near = lensShape(1);
    expect(near.posteriorApex - near.anteriorApex).toBeGreaterThan(far.posteriorApex - far.anteriorApex);
    expect(near.ra).toBeLessThan(far.ra);
  });
  it('dimensiones del esquema coherentes con el ojo adulto', () => {
    const thicknessMm = (lensShape(0).posteriorApex - lensShape(0).anteriorApex) / PX_PER_MM;
    expect(thicknessMm).toBeGreaterThan(3);
    expect(thicknessMm).toBeLessThan(4.5);
    // la córnea sobresale por delante del limbo
    expect(CORNEA_APEX_X).toBeLessThan(LIMBUS_X);
    expect(corneaXAt(0)).toBeCloseTo(CORNEA_APEX_X);
  });
  it('punto ciego a ~15°', () => {
    expect(blindSpotDistanceCm(8)).toBeGreaterThan(25);
    expect(blindSpotDistanceCm(8)).toBeLessThan(35);
  });
});

describe('fotorreceptores', () => {
  it('fóvea: muchos conos, sin bastones', () => {
    expect(coneDensity(0)).toBeGreaterThan(150_000);
    expect(rodDensity(0)).toBe(0);
  });
  it('periferia: dominan los bastones con pico cerca de 20°', () => {
    expect(rodDensity(20)).toBeGreaterThan(coneDensity(20) * 10);
    expect(rodDensity(20)).toBeGreaterThan(rodDensity(5));
    expect(rodDensity(20)).toBeGreaterThan(rodDensity(40));
  });
});

describe('contenido', () => {
  it('10 estructuras requeridas, numeradas sin repetir', () => {
    expect(STRUCTURES).toHaveLength(10);
    expect(new Set(STRUCTURES.map((s) => s.n)).size).toBe(10);
  });
  it('9 pasos del recorrido de la luz', () => {
    expect(LIGHT_STEPS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('10 preguntas válidas con respuestas distribuidas', () => {
    expect(QUIZ).toHaveLength(10);
    for (const q of QUIZ) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.explain.length).toBeGreaterThan(40);
    }
    const positions = new Set(QUIZ.map((q) => q.answer));
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });
});
