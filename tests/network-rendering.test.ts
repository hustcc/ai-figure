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
    expect(Math.min(...radii)).toBe(6);
    expect(Math.max(...radii)).toBe(32);
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
});
