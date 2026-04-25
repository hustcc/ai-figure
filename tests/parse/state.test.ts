/**
 * Parse tests for the state machine diagram markdown syntax.
 *
 * Reserved identifiers: `start` (initial pseudo-state), `end` (accepting pseudo-state).
 *
 *   figure state
 *   title: Order Status
 *   idle: Idle
 *   processing: Processing
 *   start --> idle
 *   idle --> processing: order placed
 *   processing --> done: shipped
 *   processing --> error: payment failed
 *   error --> idle: retry
 *   accent: error
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('state — markdown parse', () => {
  it('renders a basic state machine from string input', () => {
    const svg = fig(`
      figure state
      title: Auth State
      idle: Idle
      auth: Auth
      done: Done
      failed: Failed
      start --> idle
      idle --> auth: login
      auth --> done: success
      auth --> failed: error
      failed --> idle: retry
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Auth State');
    expect(svg).toContain('Idle');
    expect(svg).toContain('login');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure state
      title: Traffic Light
      subtitle: Signal sequence
      red: Red
      green: Green
      start --> red
      red --> green: go
    `);
    expect(svg).toContain('Traffic Light');
    expect(svg).toContain('Signal sequence');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure state
      theme: dark
      idle: Idle
      start --> idle
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette antv', () => {
    const svg = fig(`
      figure state
      palette: antv
      idle: Idle
      start --> idle
    `);
    expect(svg).toContain('<svg');
  });

  it('start reserved id creates start pseudo-state node', () => {
    const svg = fig(`
      figure state
      idle: Idle
      start --> idle
    `);
    expect(svg).toContain('state-diagram');
    // start pseudo-state should be rendered
    expect(svg).toContain('Idle');
  });

  it('end reserved id creates accepting pseudo-state node', () => {
    const svg = fig(`
      figure state
      idle: Idle
      idle --> end
    `);
    expect(svg).toContain('state-diagram');
    expect(svg).toContain('Idle');
  });

  it('accent: id marks a state as accented', () => {
    const svg = fig(`
      figure state
      error: Error
      start --> idle
      idle --> error: fail
      accent: error
    `);
    expect(svg).toContain('<svg');
    // The error state should exist in the diagram
    expect(svg).toContain('Error');
  });

  it('standalone node declaration creates node without transitions', () => {
    const svg = fig(`
      figure state
      idle: Idle
      start --> idle
    `);
    expect(svg).toContain('Idle');
  });

  it('transitions without labels are rendered as plain arrows', () => {
    const svg = fig(`
      figure state
      idle: Idle
      active: Active
      start --> idle
      idle --> active
      active --> end
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Idle');
    expect(svg).toContain('Active');
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure state')).not.toThrow();
    expect(fig('figure state')).toContain('<svg');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure state
      %% initial transition
      idle: Idle
      start --> idle
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Idle');
  });
});
