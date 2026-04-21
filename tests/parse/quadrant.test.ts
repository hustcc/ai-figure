/**
 * Parse tests for the quadrant chart markdown syntax.
 *
 *   figure quadrant
 *   theme: dark
 *   palette: figma
 *   title: Feature Priority
 *   x-axis Effort: Low .. High
 *   y-axis Value: Low .. High
 *   quadrant-1: Strategic
 *   quadrant-2: Quick Wins
 *   quadrant-3: Long Shots
 *   quadrant-4: Low Priority
 *   Feature A: 0.3, 0.7
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('quadrant — markdown parse', () => {
  it('renders a basic quadrant chart from string input', () => {
    const svg = fig(`
      figure quadrant
      title: Feature Priority
      x-axis Effort: Low .. High
      y-axis Value: Low .. High
      quadrant-1: Strategic
      quadrant-2: Quick Wins
      quadrant-3: Long Shots
      quadrant-4: Low Priority
      Feature A: 0.3, 0.7
      Feature B: 0.8, 0.4
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Feature Priority');
    expect(svg).toContain('Strategic');
    expect(svg).toContain('Feature A');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure quadrant
      title: Tech Radar
      subtitle: Q1 2025
      x-axis Cost: Low .. High
      y-axis Impact: Low .. High
      quadrant-1: Adopt
      quadrant-2: Trial
      quadrant-3: Assess
      quadrant-4: Hold
    `);
    expect(svg).toContain('Tech Radar');
    expect(svg).toContain('Q1 2025');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure quadrant
      theme: dark
      x-axis: Low .. High
      y-axis: Low .. High
      quadrant-1: Q1
      quadrant-2: Q2
      quadrant-3: Q3
      quadrant-4: Q4
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette figma', () => {
    const svg = fig(`
      figure quadrant
      palette: figma
      x-axis: Low .. High
      y-axis: Low .. High
      quadrant-1: A
      quadrant-2: B
      quadrant-3: C
      quadrant-4: D
      Point X: 0.5, 0.5
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Point X');
  });

  it('x-axis without explicit label', () => {
    const svg = fig(`
      figure quadrant
      x-axis: Low .. High
      y-axis: Low .. High
      quadrant-1: Q1
      quadrant-2: Q2
      quadrant-3: Q3
      quadrant-4: Q4
    `);
    expect(svg).toContain('Low');
    expect(svg).toContain('High');
  });

  it('data points at boundary values (0 and 1)', () => {
    const svg = fig(`
      figure quadrant
      x-axis: Low .. High
      y-axis: Low .. High
      quadrant-1: Q1
      quadrant-2: Q2
      quadrant-3: Q3
      quadrant-4: Q4
      Edge TL: 0.0, 1.0
      Edge BR: 1.0, 0.0
    `);
    expect(svg).toContain('Edge TL');
    expect(svg).toContain('Edge BR');
  });

  it('out-of-range data points are silently ignored', () => {
    // x=1.5 is out of range and should not cause errors
    expect(() =>
      fig(`
        figure quadrant
        x-axis: Low .. High
        y-axis: Low .. High
        quadrant-1: Q1
        quadrant-2: Q2
        quadrant-3: Q3
        quadrant-4: Q4
        Bad Point: 1.5, 0.5
      `),
    ).not.toThrow();
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure quadrant')).not.toThrow();
    expect(fig('figure quadrant')).toContain('<svg');
  });
});
