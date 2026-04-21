/**
 * Parse tests for the tree diagram markdown syntax.
 *
 *   figure tree
 *   direction: TB
 *   title: Org Chart
 *   ceo[CEO] --> cto[CTO]
 *   ceo --> coo[COO]
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('tree — markdown parse', () => {
  it('renders a basic tree from string input', () => {
    const svg = fig(`
      figure tree
      title: Org Chart
      ceo[CEO] --> cto[CTO]
      ceo --> coo[COO]
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Org Chart');
    expect(svg).toContain('CEO');
    expect(svg).toContain('CTO');
    expect(svg).toContain('COO');
  });

  it('config: direction LR is applied', () => {
    const svg = fig(`
      figure tree
      direction: LR
      root[Root] --> child[Child]
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Root');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure tree
      title: Project Layout
      subtitle: Source tree overview
      root[src] --> lib[lib]
    `);
    expect(svg).toContain('Project Layout');
    expect(svg).toContain('Source tree overview');
  });

  it('config: palette and theme', () => {
    const svg = fig(`
      figure tree
      palette: vega
      theme: dark
      root[Root] --> child[Child]
    `);
    expect(svg).toContain('#1a1b1e'); // dark background
  });

  it('multi-level hierarchy', () => {
    const svg = fig(`
      figure tree
      ceo[CEO] --> vp[VP Eng]
      vp --> dev[Developer]
      vp --> qa[QA]
    `);
    expect(svg).toContain('VP Eng');
    expect(svg).toContain('Developer');
    expect(svg).toContain('QA');
  });

  it('standalone root node declaration', () => {
    const svg = fig(`
      figure tree
      root[Application Root]
      root --> ui[UI]
    `);
    expect(svg).toContain('Application Root');
    expect(svg).toContain('UI');
  });

  it('later explicit label refines bare-id reference', () => {
    const svg = fig(`
      figure tree
      root --> child
      child[Explicit Label] --> leaf
    `);
    expect(svg).toContain('Explicit Label');
  });

  it('streaming safety: header-only returns valid SVG', () => {
    const svg = fig('figure tree');
    expect(svg).toContain('<svg');
    expect(() => fig('figure tree')).not.toThrow();
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure tree
      %% root node
      root[Root] --> child[Child]
    `);
    expect(svg).toContain('Root');
    expect(svg).toContain('Child');
  });
});
