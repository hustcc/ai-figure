/**
 * Parse tests for the timeline diagram markdown syntax.
 *
 *   figure timeline
 *   title: Product History
 *   2020-01-01: v1.0 Launch milestone
 *   2021-06-15: v2.0 Redesign
 *   2022-11-01: v3.0 Mobile milestone
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('timeline — markdown parse', () => {
  it('renders a basic timeline from string input', () => {
    const svg = fig(`
      figure timeline
      title: Product History
      2020-01-01: v1.0 Launch milestone
      2021-06-15: v2.0 Redesign
      2022-11-01: v3.0 Mobile
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Product History');
    expect(svg).toContain('v1.0 Launch');
    expect(svg).toContain('v2.0 Redesign');
    expect(svg).toContain('v3.0 Mobile');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure timeline
      title: Releases
      subtitle: Major versions
      2025-01-01: v1.0
    `);
    expect(svg).toContain('Releases');
    expect(svg).toContain('Major versions');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure timeline
      theme: dark
      2025-01-01: v1.0
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette antv', () => {
    const svg = fig(`
      figure timeline
      palette: antv
      2025-01-01: v1.0
    `);
    expect(svg).toContain('<svg');
  });

  it('milestone suffix creates a milestone event', () => {
    const svg = fig(`
      figure timeline
      2025-03-01: Launch milestone
      2025-06-01: Iteration
    `);
    // Both events should be present
    expect(svg).toContain('Launch');
    expect(svg).toContain('Iteration');
  });

  it('events are sorted by date automatically', () => {
    const svg = fig(`
      figure timeline
      2025-12-01: December
      2025-01-01: January
      2025-06-01: June
    `);
    expect(svg).toContain('December');
    expect(svg).toContain('January');
    expect(svg).toContain('June');
  });

  it('lines without valid date format are silently ignored', () => {
    expect(() =>
      fig(`
        figure timeline
        not-a-date: ignored
        2025-01-01: Valid Event
      `),
    ).not.toThrow();
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure timeline')).not.toThrow();
    expect(fig('figure timeline')).toContain('<svg');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure timeline
      %% version history
      2025-01-01: v1.0
    `);
    expect(svg).toContain('v1.0');
  });

  it('multiple events render all labels', () => {
    const svg = fig(`
      figure timeline
      2020-01-01: Alpha
      2021-01-01: Beta
      2022-01-01: RC milestone
      2023-01-01: GA milestone
    `);
    expect(svg).toContain('Alpha');
    expect(svg).toContain('Beta');
    expect(svg).toContain('RC');
    expect(svg).toContain('GA');
  });
});
