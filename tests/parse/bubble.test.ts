/**
 * Parse tests for the bubble chart markdown syntax.
 *
 *   figure bubble
 *   title: Market Analysis
 *   subtitle: Q1 2025
 *   x-axis Revenue: Low .. High
 *   y-axis Growth: Low .. High
 *   Product A: 0.3, 0.7, 0.8
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('bubble — markdown parse', () => {
  it('renders a basic bubble chart from string input', () => {
    const svg = fig(`
      figure bubble
      title: Market Analysis
      x-axis Revenue: Low .. High
      y-axis Growth: Low .. High
      Product A: 0.3, 0.7, 0.8
      Product B: 0.6, 0.4, 0.5
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Market Analysis');
    expect(svg).toContain('Revenue');
    expect(svg).toContain('Product A');
    expect(svg).toContain('Product B');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure bubble
      title: Bubble Chart
      subtitle: Q1 2025
      x-axis: Low .. High
      y-axis: Low .. High
      A: 0.5, 0.5, 0.5
    `);
    expect(svg).toContain('Bubble Chart');
    expect(svg).toContain('Q1 2025');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure bubble
      theme: dark
      x-axis: Low .. High
      y-axis: Low .. High
      A: 0.5, 0.5, 0.5
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette antv', () => {
    const svg = fig(`
      figure bubble
      palette: antv
      x-axis: Low .. High
      y-axis: Low .. High
      Point X: 0.5, 0.5, 0.5
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Point X');
  });

  it('bubbles include SMIL animate pulse element', () => {
    const svg = fig(`
      figure bubble
      x-axis: Low .. High
      y-axis: Low .. High
      Alpha: 0.3, 0.6, 0.7
    `);
    expect(svg).toContain('<animate');
    expect(svg).toContain('repeatCount="indefinite"');
  });

  it('x-axis without explicit label', () => {
    const svg = fig(`
      figure bubble
      x-axis: Low .. High
      y-axis: Low .. High
      A: 0.5, 0.5, 0.5
    `);
    expect(svg).toContain('Low');
    expect(svg).toContain('High');
  });

  it('out-of-range data points are silently ignored', () => {
    expect(() =>
      fig(`
        figure bubble
        x-axis: Low .. High
        y-axis: Low .. High
        Bad Point: 1.5, 0.5, 0.5
      `),
    ).not.toThrow();
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure bubble')).not.toThrow();
    expect(fig('figure bubble')).toContain('<svg');
  });
});
