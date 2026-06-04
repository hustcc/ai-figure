import { describe, expect, it } from 'vitest';
import { fig } from '../src/index';
import { estimateTextWidth } from '../src/utils';

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

  it('places labels outside when node diameter is below 18', () => {
    const svg = fig({
      figure: 'network',
      nodes: [
        { id: 'tiny', label: 'Tiny', weight: 1 },
        { id: 'big', label: 'Big', weight: 5 },
      ],
      edges: [{ from: 'tiny', to: 'big' }],
    });
    const tinyCircle = svg.match(/<circle[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"[^>]*r="6"/);
    const tinyText = svg.match(/<text[^>]*text-anchor="(start|end)"[^>]*>Tiny<\/text>/);
    expect(tinyCircle).toBeTruthy();
    expect(tinyText).toBeTruthy();
  });

  it('applies simple collision avoidance for outside labels', () => {
    const svg = fig({
      figure: 'network',
      nodes: [
        { id: 'n1', label: 'Alpha', weight: 1 },
        { id: 'n2', label: 'Bravo', weight: 1 },
        { id: 'n3', label: 'Charlie', weight: 1 },
        { id: 'n4', label: 'Delta', weight: 1 },
        { id: 'n5', label: 'Echo', weight: 1 },
        { id: 'n6', label: 'Foxtrot', weight: 1 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5' },
        { from: 'n5', to: 'n6' },
      ],
    });
    const labels = [...svg.matchAll(/<text x="([^"]+)" y="([^"]+)" text-anchor="(start|end)"[^>]*>([^<]+)<\/text>/g)]
      .map((m) => ({
        x: Number(m[1]),
        y: Number(m[2]),
        anchor: m[3] as 'start' | 'end',
        text: m[4],
      }));
    expect(labels.length).toBeGreaterThan(1);
    const h = 14;
    const boxes = labels.map(({ x, y, anchor, text }) => {
      const w = estimateTextWidth(text, 10);
      const left = anchor === 'start' ? x : x - w;
      const right = anchor === 'start' ? x + w : x;
      return { left, right, top: y - h / 2, bottom: y + h / 2 };
    });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const overlap = boxes[i].left < boxes[j].right &&
          boxes[i].right > boxes[j].left &&
          boxes[i].top < boxes[j].bottom &&
          boxes[i].bottom > boxes[j].top;
        expect(overlap).toBe(false);
      }
    }
  });
});
