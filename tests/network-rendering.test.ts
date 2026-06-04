import { describe, expect, it } from 'vitest';
import { fig } from '../src/index';

describe('network — rendering details', () => {
  it('maps min/max node weight to min/max radius', () => {
    const svg = fig({
      figure: 'network',
      nodes: [
        { id: 'a', label: 'A', weight: 1 },
        { id: 'b', label: 'B', weight: 2 },
        { id: 'c', label: 'C', weight: 4 },
      ],
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }],
    });
    const radii = [...svg.matchAll(/<circle[^>]* r="([^"]+)"/g)].map((m) => Number(m[1]));
    expect(Math.min(...radii)).toBe(16);
    expect(Math.max(...radii)).toBe(56);
  });

  it('starts edge lines from the source node boundary', () => {
    const svg = fig({
      figure: 'network',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
    });
    const circle = svg.match(/<circle[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"[^>]*r="([^"]+)"/);
    const line = svg.match(/<line[^>]*x1="([^"]+)"[^>]*y1="([^"]+)"/);
    expect(circle).toBeTruthy();
    expect(line).toBeTruthy();
    expect(line![1] !== circle![1] || line![2] !== circle![2]).toBe(true);
  });

  it('assigns ungrouped nodes to the first palette node type', () => {
    const svg = fig({
      figure: 'network',
      nodes: [
        { id: 'a', label: 'A', group: 'g1' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      palette: 'default',
    });
    const circleStrokes = [...svg.matchAll(/<circle[^>]*stroke="([^"]+)"/g)].map((m) => m[1]);
    expect(circleStrokes[1]).toBe('#339af0');
  });

  it('uses default radius 36 when node weight/value is not specified', () => {
    const svg = fig({
      figure: 'network',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
    });
    const radii = [...svg.matchAll(/<circle[^>]* r="([^"]+)"/g)].map((m) => Number(m[1]));
    expect(radii).toEqual([36, 36]);
  });

  it('keeps labels inside for default sizing', () => {
    const svg = fig({
      figure: 'network',
      nodes: [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Bravo', weight: 1 },
      ],
      edges: [{ from: 'a', to: 'b' }],
    });
    expect(svg).toContain('>Alpha</text>');
    expect(svg).not.toMatch(/text-anchor="(start|end)"[^>]*>Alpha<\/text>/);
  });
});
