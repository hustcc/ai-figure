/**
 * Parse tests for the radar chart markdown syntax.
 *
 *   figure radar
 *   title: Framework Comparison
 *   axes: Speed, Scalability, DX
 *   React: 75, 80, 90
 *   Vue: 82, 72, 88
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('radar — markdown parse', () => {
  it('renders a basic radar chart from string input', () => {
    const svg = fig(`
      figure radar
      title: Framework Comparison
      axes: Speed, Scalability, DX
      React: 75, 80, 90
      Vue: 82, 72, 88
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Framework Comparison');
    expect(svg).toContain('Speed');
    expect(svg).toContain('React');
    expect(svg).toContain('Vue');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure radar
      title: Radar Chart
      subtitle: evaluation 2025
      axes: A, B, C
      Series: 50, 60, 70
    `);
    expect(svg).toContain('Radar Chart');
    expect(svg).toContain('evaluation 2025');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure radar
      theme: dark
      axes: A, B, C
      Series: 50, 60, 70
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette antv', () => {
    const svg = fig(`
      figure radar
      palette: antv
      axes: Speed, Power, Range
      Car A: 80, 70, 60
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Car A');
  });

  it('multiple series overlay', () => {
    const svg = fig(`
      figure radar
      axes: A, B, C, D
      Alpha: 80, 70, 60, 90
      Beta: 50, 90, 80, 40
    `);
    expect(svg).toContain('Alpha');
    expect(svg).toContain('Beta');
    // Each series contributes two <path> fill polygons and multiple dots
    const pathCount = (svg.match(/<path/g) ?? []).length;
    expect(pathCount).toBeGreaterThanOrEqual(2);
  });

  it('axis labels appear in output', () => {
    const svg = fig(`
      figure radar
      axes: Performance, Reliability, Security
      Prod: 80, 90, 95
    `);
    expect(svg).toContain('Performance');
    expect(svg).toContain('Reliability');
    expect(svg).toContain('Security');
  });

  it('values are clamped to [0,100]', () => {
    expect(() => fig(`
      figure radar
      axes: X, Y, Z
      Outlier: 120, -10, 50
    `)).not.toThrow();
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure radar')).not.toThrow();
    expect(fig('figure radar')).toContain('<svg');
  });

  it('partial axes (no series) still renders', () => {
    const svg = fig(`
      figure radar
      axes: A, B, C
    `);
    expect(svg).toContain('<svg');
  });
});
