import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('mindmap — markdown parse', () => {
  it('renders a basic mindmap from string input', () => {
    const svg = fig(`
      figure mindmap
      title: Product Strategy
      root[Product Strategy]
      root --> market[Market]
      root --> tech[Technology]
      market --> smb[SMB]
      tech --> ai[AI Features]
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Product Strategy');
    expect(svg).toContain('Market');
    expect(svg).toContain('Technology');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure mindmap
      title: Mindmap Title
      subtitle: subtitle text
      root[Root] --> child[Child]
    `);
    expect(svg).toContain('Mindmap Title');
    expect(svg).toContain('subtitle text');
  });

  it('config: palette and dark theme', () => {
    const svg = fig(`
      figure mindmap
      theme: dark
      palette: antv
      root[Root] --> child[Child]
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('standalone root node declaration is supported', () => {
    const svg = fig(`
      figure mindmap
      root[Application]
      root --> api[API]
      root --> web[Web]
    `);
    expect(svg).toContain('Application');
    expect(svg).toContain('API');
    expect(svg).toContain('Web');
  });

  it('later explicit label refines bare-id reference', () => {
    const svg = fig(`
      figure mindmap
      root --> child
      child[Explicit Label] --> leaf
    `);
    expect(svg).toContain('Explicit Label');
  });

  it('multi-level branches render', () => {
    const svg = fig(`
      figure mindmap
      root[Root]
      root --> a[A]
      root --> b[B]
      a --> a1[A1]
      a1 --> a2[A2]
      b --> b1[B1]
    `);
    expect(svg).toContain('A2');
    expect(svg).toContain('B1');
  });

  it('throws on cyclic input from options', () => {
    expect(() => fig({
      figure: 'mindmap',
      nodes: [
        { id: 'a', label: 'A', parent: 'b' },
        { id: 'b', label: 'B', parent: 'a' },
      ],
    })).toThrow(/Mindmap cycle detected/);
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure mindmap')).not.toThrow();
    expect(fig('figure mindmap')).toContain('<svg');
  });

  it('comment lines are ignored', () => {
    const svg = fig(`
      figure mindmap
      %% comment
      root[Root] --> child[Child]
    `);
    expect(svg).toContain('Root');
    expect(svg).toContain('Child');
  });
});
