/**
 * Parse tests for the architecture diagram markdown syntax.
 *
 *   figure arch
 *   direction: TB
 *   title: Cloud Architecture
 *   section Frontend
 *     web[Web App]
 *     mobile[Mobile]
 *   section Backend
 *     api[API Server]
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('arch — markdown parse', () => {
  it('renders a basic arch diagram from string input', () => {
    const svg = fig(`
      figure arch
      title: Cloud Architecture
      section Frontend
        web[Web App]
        mobile[Mobile]
      section Backend
        api[API Server]
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Cloud Architecture');
    expect(svg).toContain('Frontend');
    expect(svg).toContain('Web App');
    expect(svg).toContain('Backend');
    expect(svg).toContain('API Server');
  });

  it('config: direction LR is applied', () => {
    const svg = fig(`
      figure arch
      direction: LR
      section Layer A
        n1[Node 1]
      section Layer B
        n2[Node 2]
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Layer A');
    expect(svg).toContain('Layer B');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure arch
      title: Microservices
      subtitle: Production topology
      section Services
        svc[Service]
    `);
    expect(svg).toContain('Microservices');
    expect(svg).toContain('Production topology');
  });

  it('config: palette antv', () => {
    const svg = fig(`
      figure arch
      palette: antv
      section Frontend
        web[Web]
    `);
    expect(svg).toContain('<svg');
  });

  it('config: dark theme', () => {
    const svg = fig(`
      figure arch
      theme: dark
      section Layer
        node[Node]
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('multiple sections with multiple nodes each', () => {
    const svg = fig(`
      figure arch
      section UI
        react[React]
        vue[Vue]
      section API
        rest[REST]
        graphql[GraphQL]
      section DB
        postgres[Postgres]
    `);
    expect(svg).toContain('React');
    expect(svg).toContain('GraphQL');
    expect(svg).toContain('Postgres');
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure arch')).not.toThrow();
    expect(fig('figure arch')).toContain('<svg');
  });

  it('streaming safety: section without nodes does not crash', () => {
    const svg = fig('figure arch\nsection Frontend');
    expect(svg).toContain('<svg');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure arch
      %% This is a comment
      section Layer
        node[Node]
    `);
    expect(svg).toContain('Node');
  });
});
