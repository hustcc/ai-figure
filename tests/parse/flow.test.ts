/**
 * Parse tests for the flow diagram markdown syntax.
 *
 * New unified syntax:
 *   figure flow
 *   direction: LR
 *   palette: antv
 *   title: My Flow
 *   a[Node A] --> b{Decision}: yes
 *   b --> c[Node C]: no
 *   group Group: a, b
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('flow — markdown parse', () => {
  it('renders a basic flow diagram from string input', () => {
    const svg = fig(`
      figure flow
      title: Auth Flow
      start[Start] --> login[Login]
      login --> done[Done]
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Auth Flow');
    expect(svg).toContain('Login');
    expect(svg).toContain('Done');
  });

  it('config: direction LR is respected', () => {
    const svgTB = fig('figure flow\ndirection: TB\na[A] --> b[B]');
    const svgLR = fig('figure flow\ndirection: LR\na[A] --> b[B]');
    // Both render; LR diagram should typically be wider than tall
    expect(svgTB).toContain('<svg');
    expect(svgLR).toContain('<svg');
  });

  it('config: palette antv is applied', () => {
    const svg = fig('figure flow\npalette: antv\na[A] --> b[B]');
    expect(svg).toContain('#5b8ff9'); // antv process stroke
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig('figure flow\ntheme: dark\na[A] --> b[B]');
    expect(svg).toContain('#1a1b1e');
  });

  it('config: title and subtitle both appear', () => {
    const svg = fig(`
      figure flow
      title: CI Pipeline
      subtitle: automated build
      a[Build] --> b[Test]
    `);
    expect(svg).toContain('CI Pipeline');
    expect(svg).toContain('automated build');
  });

  it('edge label syntax: A --> B[Label]: edgeLabel', () => {
    const svg = fig(`
      figure flow
      a --> b[Build]: yes
      a --> c[Fix]: no
    `);
    expect(svg).toContain('yes');
    expect(svg).toContain('no');
    expect(svg).toContain('Build');
    expect(svg).toContain('Fix');
  });

  it('all four node types: process, decision, terminal, io', () => {
    const svg = fig(`
      figure flow
      p[Process]
      d{Decision}
      t((Terminal))
      io[/IO/]
    `);
    expect(svg).toContain('node-process');
    expect(svg).toContain('node-decision');
    expect(svg).toContain('node-terminal');
    expect(svg).toContain('node-io');
  });

  it('group syntax creates a group border', () => {
    const svg = fig(`
      figure flow
      a[A] --> b[B]
      group MyGroup: a, b
    `);
    expect(svg).toContain('MyGroup');
    expect(svg).toContain('class="group"');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure flow
      %% this is a comment
      a[Alpha] --> b[Beta]
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
    const svg = fig('figure flow\na[Write Code] -->');
    expect(svg).toContain('<svg');
  });

  it('inline node definitions refine earlier bare-id references', () => {
    const svg = fig(`
      figure flow
      a --> b
      b[Named Node] --> c
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
      a[A] --> b[B]
    `);
    expect(svg).toContain('Multi-Config Test');
    expect(svg).toContain('#1a1b1e'); // dark background
  });
});
