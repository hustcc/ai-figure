import { describe, it, expect } from 'vitest';
import { fig } from '../src/index';

// ---------------------------------------------------------------------------
// Unit tests — verify structural and semantic properties of the output.
// ---------------------------------------------------------------------------

describe('fig', () => {
  it('returns a valid SVG string', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'start', label: 'Start', type: 'terminal' },
        { id: 'end', label: 'End', type: 'terminal' },
      ],
      edges: [{ from: 'start', to: 'end' }],
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('renders all four node types', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'Process', type: 'process' },
        { id: 'b', label: 'Decision', type: 'decision' },
        { id: 'c', label: 'Terminal', type: 'terminal' },
        { id: 'd', label: 'IO', type: 'io' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c', label: 'Yes' },
        { from: 'b', to: 'd', label: 'No' },
      ],
    });

    expect(svg).toContain('node-process');
    expect(svg).toContain('node-decision');
    expect(svg).toContain('node-terminal');
    expect(svg).toContain('node-io');
    expect(svg).toContain('Yes');
    expect(svg).toContain('No');
  });

  it('renders groups with label', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      groups: [{ id: 'g1', label: 'Validation Group', nodes: ['a', 'b'] }],
    });

    expect(svg).toContain('Validation Group');
    expect(svg).toContain('class="group"');
  });

  it('supports the default palette', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'x', label: 'Node X', type: 'process' }],
      edges: [],
      palette: 'default',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('Node X');
  });

  it('supports LR direction', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ],
      direction: 'LR',
    });

    expect(svg).toContain('<svg');
  });

  it('handles empty nodes array gracefully', () => {
    const svg = fig({ figure: 'flow', nodes: [], edges: [] });
    expect(svg).toContain('<svg');
  });

  it('renders the full example from the README', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'start', label: 'Start', type: 'terminal' },
        { id: 'process1', label: 'Process Data', type: 'process' },
        { id: 'decision', label: 'Is Valid?', type: 'decision' },
        { id: 'end_yes', label: 'Success', type: 'terminal' },
        { id: 'end_no', label: 'Failure', type: 'terminal' },
      ],
      edges: [
        { from: 'start', to: 'process1' },
        { from: 'process1', to: 'decision' },
        { from: 'decision', to: 'end_yes', label: 'Yes' },
        { from: 'decision', to: 'end_no', label: 'No' },
      ],
      groups: [
        { id: 'g1', label: 'Validation', nodes: ['process1', 'decision'] },
      ],
      theme: 'light',
      palette: 'default',
      direction: 'TB',
    });

    expect(svg).toContain('Start');
    expect(svg).toContain('Process Data');
    expect(svg).toContain('Is Valid?');
    expect(svg).toContain('Success');
    expect(svg).toContain('Failure');
    expect(svg).toContain('Validation');
  });

  it('escapes special XML characters in labels', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A & B <test>' }],
      edges: [],
    });

    expect(svg).toContain('&amp;');
    expect(svg).toContain('&lt;');
  });

  it('unknown palette falls back to default without crashing', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
      palette: 'nonexistent',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('A');
  });

  it('unknown node type falls back to process dimensions', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'Custom', type: 'custom' as any }],
      edges: [],
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('Custom');
  });

  it('supports dark theme with background rect', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
      theme: 'dark',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('#1a1b1e');
  });

  it('supports custom palette array', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A', type: 'process' },
        { id: 'b', label: 'B', type: 'decision' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      palette: ['#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8'],
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('#ff6b6b');
  });

  it("palette='default' (built-in) renders without crashing", () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
      palette: 'default',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('#339af0'); // default process stroke
  });

  it("palette='default' + theme='dark' renders dark background", () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
      theme: 'dark',
      palette: 'default',
    });

    expect(svg).toContain('#1a1b1e');
    expect(svg).toContain('#74c0fc'); // dark process text color
  });

  it("unknown palette name falls back to default dark theme", () => {
    // 'minimal' is not a built-in palette; falls back to 'default' dark
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
      theme: 'dark',
      palette: 'minimal',
    });

    // Falls back to default dark (minimal is no longer a named palette)
    expect(svg).toContain('#1a1b1e');
  });

  it("palette='antv' uses antv process stroke color", () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
      palette: 'antv',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('#5b8ff9'); // antv process stroke
  });

  it("palette='antv' light mode renders all node types", () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A', type: 'process' },
        { id: 'b', label: 'B', type: 'decision' },
        { id: 'c', label: 'C', type: 'terminal' },
        { id: 'd', label: 'D', type: 'io' },
      ],
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'd' }],
      palette: 'antv',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('#5b8ff9'); // antv process stroke
    expect(svg).toContain('#e8684a'); // antv decision stroke
  });

  it("palette='drawio' + theme='dark' uses dark background", () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
      theme: 'dark',
      palette: 'drawio',
    });

    expect(svg).toContain('#1a1b1e');
    expect(svg).toContain('#6c8ebf'); // drawio process stroke
  });

  it("palette='notion' renders flow diagram with notion colors", () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A', type: 'process' },
        { id: 'b', label: 'B', type: 'decision' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      palette: 'notion',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('#d9730d'); // notion process stroke (orange)
    expect(svg).toContain('#337ea9'); // notion decision stroke (teal-blue)
  });

  it("palette='figma' renders flow diagram with figma colors", () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A', type: 'process' },
        { id: 'b', label: 'B', type: 'decision' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      palette: 'figma',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('#6366f1'); // figma process stroke (indigo)
    expect(svg).toContain('#06b6d4'); // figma decision stroke (cyan)
  });

  it("palette='vega' renders arch diagram with vega colors", () => {
    const svg = fig({
      figure: 'arch',
      layers: [
        { id: 'l1', label: 'Frontend', nodes: [{ id: 'n1', label: 'React' }, { id: 'n2', label: 'Vue' }] },
        { id: 'l2', label: 'Backend', nodes: [{ id: 'n3', label: 'Node.js' }] },
      ],
      palette: 'vega',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('Frontend');
    expect(svg).toContain('#4c78a8'); // vega process stroke (steel-blue)
  });

  it("palette='vega' renders sequence diagram with vega colors", () => {
    const svg = fig({
      figure: 'sequence',
      actors: ['Client', 'Server'],
      messages: [{ from: 'Client', to: 'Server', label: 'request' }],
      palette: 'vega',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('#72b7b2'); // vega terminal stroke (actor[0] → terminal type → teal)
  });

  it('throws for an edge referencing a missing node', () => {
    expect(() =>
      fig({
        figure: 'flow',
        nodes: [{ id: 'a', label: 'A' }],
        edges: [{ from: 'a', to: 'missing' }],
      }),
    ).toThrow(/unknown node/i);
  });

  it('renders multigraph edges (two edges between the same pair of nodes)', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A', type: 'process' },
        { id: 'b', label: 'B', type: 'process' },
      ],
      edges: [
        { from: 'a', to: 'b', label: 'first' },
        { from: 'a', to: 'b', label: 'second' },
      ],
    });

    expect(svg).toContain('first');
    expect(svg).toContain('second');
  });

  it('includes dashed-stroke flow animation in SVG defs', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
    });

    expect(svg).toContain('stroke-dasharray');
    expect(svg).toContain('ai-fc-flow');
  });

  it('renders edge labels with background rect', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A', type: 'decision' },
        { id: 'b', label: 'B', type: 'terminal' },
        { id: 'c', label: 'C', type: 'terminal' },
      ],
      edges: [
        { from: 'a', to: 'b', label: 'Yes' },
        { from: 'a', to: 'c', label: 'No' },
      ],
    });

    expect(svg).toContain('Yes');
    expect(svg).toContain('No');
    expect(svg).toContain('<rect');
  });

  it('groups render dashed borders', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      groups: [{ id: 'g', label: 'Grp', nodes: ['a', 'b'] }],
    });

    expect(svg).toContain('stroke-dasharray');
    expect(svg).toContain('Grp');
  });

  it('arch diagram auto-sizes width (TB): single node uses minimum width', () => {
    const svg = fig({
      figure: 'arch',
      layers: [{ id: 'l1', label: 'Only', nodes: [{ id: 'n1', label: 'Solo' }] }],
    });
    // With 1 node: autoW = 48 + 28 + 140 = 216, clamped to MIN_ARCH_W=480
    const widthMatch = svg.match(/^<svg[^>]*\swidth="(\d+)"/m);
    const svgWidth = widthMatch ? parseInt(widthMatch[1], 10) : NaN;
    expect(svgWidth).toBe(480);
  });

  it('arch diagram auto-sizes width (TB): many nodes stay within MAX_ARCH_W=1600', () => {
    const nodes = Array.from({ length: 20 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }));
    const svg = fig({
      figure: 'arch',
      layers: [{ id: 'l1', label: 'Many', nodes }],
    });
    // With 20 nodes: autoW > 1600 → clamped; extract actual width and verify ≤ MAX_ARCH_W
    const widthMatch = svg.match(/^<svg[^>]*\swidth="(\d+)"/m);
    const svgWidth = widthMatch ? parseInt(widthMatch[1], 10) : Infinity;
    expect(svgWidth).toBeLessThanOrEqual(1600);
    expect(svgWidth).toBeGreaterThan(1000); // sanity check
  });

  it('arch diagram auto-sizes width (LR): few layers uses minimum width', () => {
    const svg = fig({
      figure: 'arch',
      layers: [
        { id: 'l1', label: 'A', nodes: [{ id: 'n1', label: 'One' }] },
      ],
      direction: 'LR',
    });
    // With 1 layer: autoW = 48 + 168 = 216, clamped to MIN_ARCH_W=480
    const widthMatch = svg.match(/^<svg[^>]*\swidth="(\d+)"/m);
    const svgWidth = widthMatch ? parseInt(widthMatch[1], 10) : NaN;
    expect(svgWidth).toBe(480);
  });

  it('arch diagram auto-sizes width (LR): many layers stay within MAX_ARCH_W=1600', () => {
    const layers = Array.from({ length: 12 }, (_, i) => ({
      id: `l${i}`,
      label: `Layer ${i}`,
      nodes: [{ id: `n${i}`, label: `Node ${i}` }],
    }));
    const svg = fig({ figure: 'arch', layers, direction: 'LR' });
    // With 12 layers: autoW >> 1600 → clamped; extract actual width and verify ≤ MAX_ARCH_W
    const widthMatch = svg.match(/^<svg[^>]*\swidth="(\d+)"/m);
    const svgWidth = widthMatch ? parseInt(widthMatch[1], 10) : Infinity;
    expect(svgWidth).toBeLessThanOrEqual(1600);
    expect(svgWidth).toBeGreaterThan(800); // sanity check: many layers → wide diagram
  });
});
