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

  it('supports the minimal palette', () => {
    const svg = fig({
      figure: 'flow',
      nodes: [{ id: 'x', label: 'Node X', type: 'process' }],
      edges: [],
      palette: 'minimal',
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
      palette: 'colorful',
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

  it('unknown palette falls back to colorful without crashing', () => {
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
});
