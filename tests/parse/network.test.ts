import { describe, expect, it } from 'vitest';
import { fig } from '../../src/index';

describe('network — markdown parse', () => {
  it('refines auto-created nodes without duplicates', () => {
    const svg = fig(`
      figure network
      a --> b
      a[Alpha]
      b[Beta]
    `);
    expect(svg).toContain('Alpha');
    expect(svg).toContain('Beta');
    expect(svg).not.toContain('>a</text>');
    expect(svg).not.toContain('>b</text>');
  });

  it('keeps ungrouped nodes on the first node type', () => {
    const svg = fig(`
      figure network
      a[A]
      section Team
      b[B]
      a --> b
    `);
    const circleStrokes = [...svg.matchAll(/<circle[^>]*stroke="([^"]+)"/g)].map((m) => m[1]);
    expect(circleStrokes[0]).toBe('#339af0');
  });

  it('applies edge weight to stroke width', () => {
    const svg = fig(`
      figure network
      a[A]
      b[B]
      c[C]
      a --> b: 1
      b --> c: 5
    `);
    const widths = [...svg.matchAll(/<line[^>]*stroke-width="([^"]+)"/g)].map((m) => Number(m[1]));
    expect(widths.length).toBe(2);
    expect(widths[1]).toBeGreaterThan(widths[0]);
  });
});
