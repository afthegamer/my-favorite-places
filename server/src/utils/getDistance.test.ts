import { describe, it, expect } from 'vitest';
import { getDistance } from './getDistance';

describe('getDistance', () => {
  const paris = { lat: 48.8566, lng: 2.3522 };
  const lyon = { lat: 45.764, lng: 4.8357 };
  const marseille = { lat: 43.2965, lng: 5.3698 };

  it('devrait calculer Paris → Lyon ≈ 392 km', () => {
    const d = getDistance(paris, lyon);
    expect(d).toBeGreaterThan(370);
    expect(d).toBeLessThan(410);
  });

  it('devrait calculer Paris → Marseille ≈ 660 km', () => {
    const d = getDistance(paris, marseille);
    expect(d).toBeGreaterThan(640);
    expect(d).toBeLessThan(680);
  });

  it('devrait retourner 0 pour le même point', () => {
    expect(getDistance(paris, paris)).toBe(0);
  });

  it('devrait être symétrique (A→B === B→A)', () => {
    expect(getDistance(paris, lyon)).toBeCloseTo(getDistance(lyon, paris), 10);
  });

  it('devrait gérer les petites distances (Tour Eiffel → Notre-Dame ≈ 4 km)', () => {
    const eiffel = { lat: 48.8584, lng: 2.2945 };
    const notreDame = { lat: 48.853, lng: 2.3499 };
    const d = getDistance(eiffel, notreDame);
    expect(d).toBeGreaterThan(3);
    expect(d).toBeLessThan(6);
  });

  it('devrait gérer les grandes distances (Paris → New York ≈ 5837 km)', () => {
    const newYork = { lat: 40.7128, lng: -74.006 };
    const d = getDistance(paris, newYork);
    expect(d).toBeGreaterThan(5700);
    expect(d).toBeLessThan(5900);
  });

  it('devrait gérer les points sur l\'équateur (1° ≈ 111 km)', () => {
    const a = { lat: 0, lng: 0 };
    const b = { lat: 0, lng: 1 };
    const d = getDistance(a, b);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(120);
  });

  it('devrait gérer les points antipodaux (distance max ≈ 20015 km)', () => {
    const a = { lat: 0, lng: 0 };
    const b = { lat: 0, lng: 180 };
    const d = getDistance(a, b);
    expect(d).toBeGreaterThan(19900);
    expect(d).toBeLessThan(20100);
  });
});
