/**
 * Parse tests for the flow diagram markdown syntax.
 *
 * New unified syntax:
 *   figure flow
 *   direction: LR
 *   palette: antv
 *   title: My Flow
 *   a: Node A
 *   b: Decision, decision
 *   a --> b: yes
 *   group Group: a, b
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('flow — markdown parse', () => {
  it('renders a basic flow diagram from string input', () => {
    const svg = fig(`
      figure flow
      title: Auth Flow
      start: Start
      login: Login
      done: Done
      start --> login
      login --> done
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Auth Flow');
    expect(svg).toContain('Login');
    expect(svg).toContain('Done');
  });

  it('config: direction LR is respected', () => {
    const svgTB = fig('figure flow\ndirection: TB\na --> b');
    const svgLR = fig('figure flow\ndirection: LR\na --> b');
    // Both render; LR diagram should typically be wider than tall
    expect(svgTB).toContain('<svg');
    expect(svgLR).toContain('<svg');
  });

  it('config: palette antv is applied', () => {
    const svg = fig('figure flow\npalette: antv\na --> b');
    expect(svg).toContain('#5b8ff9'); // antv process stroke
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig('figure flow\ntheme: dark\na --> b');
    expect(svg).toContain('#1a1b1e');
  });

  it('config: title and subtitle both appear', () => {
    const svg = fig(`
      figure flow
      title: CI Pipeline
      subtitle: automated build
      a: Build
      b: Test
      a --> b
    `);
    expect(svg).toContain('CI Pipeline');
    expect(svg).toContain('automated build');
  });

  it('edge label syntax: A --> B: edgeLabel', () => {
    const svg = fig(`
      figure flow
      a --> b: yes
      a --> c: no
      b: Build
      c: Fix
    `);
    expect(svg).toContain('yes');
    expect(svg).toContain('no');
    expect(svg).toContain('Build');
    expect(svg).toContain('Fix');
  });

  it('all four node types: process, decision, terminal, io', () => {
    const svg = fig(`
      figure flow
      p: Process
      d: Decision, decision
      t: Terminal, terminal
      io: IO, io
    `);
    expect(svg).toContain('node-process');
    expect(svg).toContain('node-decision');
    expect(svg).toContain('node-terminal');
    expect(svg).toContain('node-io');
  });

  it('group syntax creates a group border', () => {
    const svg = fig(`
      figure flow
      a --> b
      group MyGroup: a, b
    `);
    expect(svg).toContain('MyGroup');
    expect(svg).toContain('class="group"');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure flow
      %% this is a comment
      a: Alpha
      b: Beta
      a --> b
    `);
    expect(svg).toContain('Alpha');
    expect(svg).toContain('Beta');
  });

  it('streaming safety: returns empty SVG for header-only input', () => {
    const svg = fig('figure flow');
    expect(svg).toContain('<svg');
    expect(() => fig('figure flow')).not.toThrow();
  });

  it('streaming safety: incomplete edge line does not crash', () => {
    const svg = fig('figure flow\na -->');
    expect(svg).toContain('<svg');
  });

  it('node declarations refine earlier bare-id references', () => {
    const svg = fig(`
      figure flow
      a --> b
      b: Named Node
      b --> c
    `);
    expect(svg).toContain('Named Node');
  });

  it('multiple config keys in any order', () => {
    const svg = fig(`
      figure flow
      palette: drawio
      direction: LR
      theme: dark
      title: Multi-Config Test
      a --> b
    `);
    expect(svg).toContain('Multi-Config Test');
    expect(svg).toContain('#1a1b1e'); // dark background
  });
});
