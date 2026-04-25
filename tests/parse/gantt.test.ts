/**
 * Parse tests for the Gantt chart markdown syntax.
 *
 *   figure gantt
 *   title: Q1 Roadmap
 *   section Design
 *     t1: Wireframes, 2025-01-06, 2025-01-24
 *   section Dev
 *     t2: Frontend, 2025-01-20, 2025-02-28
 *   milestone: Launch, 2025-03-01
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('gantt — markdown parse', () => {
  it('renders a basic Gantt chart from string input', () => {
    const svg = fig(`
      figure gantt
      title: Q1 Roadmap
      section Design
        t1: Wireframes, 2025-01-06, 2025-01-24
      section Dev
        t2: Frontend, 2025-01-20, 2025-02-28
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Q1 Roadmap');
    expect(svg).toContain('Wireframes');
    expect(svg).toContain('Frontend');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure gantt
      title: Project Timeline
      subtitle: Jan–Mar 2025
      a1: Task A, 2025-01-01, 2025-01-15
    `);
    expect(svg).toContain('Project Timeline');
    expect(svg).toContain('Jan–Mar 2025');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure gantt
      theme: dark
      t1: Task, 2025-01-01, 2025-01-15
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette drawio', () => {
    const svg = fig(`
      figure gantt
      palette: drawio
      t1: Task, 2025-01-01, 2025-01-15
    `);
    expect(svg).toContain('<svg');
  });

  it('milestone: lines create milestone markers', () => {
    const svg = fig(`
      figure gantt
      a1: Task A, 2025-01-01, 2025-01-15
      milestone: Release v1, 2025-01-20
    `);
    expect(svg).toContain('Release v1');
  });

  it('section grouping assigns groupId to tasks', () => {
    const svg = fig(`
      figure gantt
      section Phase 1
        d1: Design, 2025-01-01, 2025-01-15
      section Phase 2
        d2: Dev, 2025-01-16, 2025-02-15
    `);
    expect(svg).toContain('Phase 1');
    expect(svg).toContain('Phase 2');
    expect(svg).toContain('Design');
    expect(svg).toContain('Dev');
  });

  it('tasks without a section are also rendered', () => {
    const svg = fig(`
      figure gantt
      u1: Ungrouped, 2025-01-01, 2025-01-31
    `);
    expect(svg).toContain('Ungrouped');
  });

  it('malformed task lines are silently skipped', () => {
    expect(() =>
      fig(`
        figure gantt
        Bad line without dates
        g1: Good Task, 2025-01-01, 2025-01-15
      `),
    ).not.toThrow();
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure gantt')).not.toThrow();
    expect(fig('figure gantt')).toContain('<svg');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure gantt
      %% project tasks
      s1: Sprint 1, 2025-01-06, 2025-01-17
    `);
    expect(svg).toContain('Sprint 1');
  });
});
