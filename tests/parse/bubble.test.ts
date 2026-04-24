/**
 * Parse tests for the bubble chart markdown syntax.
 *
 *   figure bubble
 *   title: Market Analysis
 *   subtitle: Q1 2025
 *   Product A: 75
 *   Product B: 50
 *   Product C: 30
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('bubble — markdown parse', () => {
  it('renders a basic bubble chart from string input', () => {
    const svg = fig(`
      figure bubble
      title: Market Analysis
      Product A: 75
      Product B: 50
      Product C: 30
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Market Analysis');
    expect(svg).toContain('Product A');
    expect(svg).toContain('Product B');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure bubble
      title: Bubble Chart
      subtitle: Q1 2025
      Alpha: 80
      Beta: 40
    `);
    expect(svg).toContain('Bubble Chart');
    expect(svg).toContain('Q1 2025');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure bubble
      theme: dark
      Category A: 60
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette antv', () => {
    const svg = fig(`
      figure bubble
      palette: antv
      Point X: 50
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Point X');
  });

  it('bubbles include SMIL animate pulse element', () => {
    const svg = fig(`
      figure bubble
      Alpha: 70
    `);
    expect(svg).toContain('<animate');
    expect(svg).toContain('repeatCount="indefinite"');
  });

  it('items with zero or negative values are ignored', () => {
    expect(() =>
      fig(`
        figure bubble
        Valid: 50
        Zero: 0
        Negative: -10
      `),
    ).not.toThrow();
    const svg = fig(`
      figure bubble
      Valid: 50
      Zero: 0
      Negative: -10
    `);
    expect(svg).toContain('Valid');
    expect(svg).not.toContain('>Zero<');
    expect(svg).not.toContain('>Negative<');
  });

  it('items with non-numeric values are ignored', () => {
    expect(() =>
      fig(`
        figure bubble
        Good: 40
        Bad: abc
      `),
    ).not.toThrow();
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure bubble')).not.toThrow();
    expect(fig('figure bubble')).toContain('<svg');
  });
});
