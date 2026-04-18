/**
 * Tests for the optional `title` and `subtitle` fields added to all diagram types.
 *
 * Each test verifies:
 *  1. The title/subtitle text appears in the SVG output.
 *  2. The correct font-weight and font-size attributes are applied.
 *  3. The SVG dimensions grow to accommodate the title block.
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

// ---------------------------------------------------------------------------
// Flow chart — title + subtitle
// ---------------------------------------------------------------------------

describe('flow chart title / subtitle', () => {
  it('renders title and subtitle in the SVG', () => {
    const svg = fig({
      figure: 'flow',
      title: 'Authentication Flow',
      subtitle: 'User login with MFA support',
      nodes: [
        { id: 'start', label: 'Start', type: 'terminal' },
        { id: 'auth',  label: 'Authenticate', type: 'process' },
        { id: 'end',   label: 'End', type: 'terminal' },
      ],
      edges: [
        { from: 'start', to: 'auth' },
        { from: 'auth',  to: 'end' },
      ],
    });

    expect(svg).toContain('Authentication Flow');
    expect(svg).toContain('User login with MFA support');
    // Title uses bold weight; subtitle uses default weight
    expect(svg).toContain('font-weight="700"');
  });

  it('renders title only (no subtitle)', () => {
    const svg = fig({
      figure: 'flow',
      title: 'CI/CD Pipeline',
      nodes: [
        { id: 'a', label: 'Build', type: 'process' },
        { id: 'b', label: 'Test',  type: 'process' },
      ],
      edges: [{ from: 'a', to: 'b' }],
    });

    expect(svg).toContain('CI/CD Pipeline');
    expect(svg).toContain('font-weight="700"');
    // When there is no subtitle, subtitle font-size (18-1=13) must not appear
    // as a title-block element (title font-size is 18)
    expect(svg).toContain('font-size="18"');
    expect(svg).not.toContain('font-size="13"');
  });

  it('expands SVG height when a title is provided', () => {
    const base = fig({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'Node', type: 'process' }],
      edges: [],
    });
    const titled = fig({
      figure: 'flow',
      title: 'My Flow',
      nodes: [{ id: 'a', label: 'Node', type: 'process' }],
      edges: [],
    });

    // Extract the height="..." value from each SVG
    const baseH  = Number(base.match(/height="(\d+)"/)?.[1] ?? 0);
    const titledH = Number(titled.match(/height="(\d+)"/)?.[1] ?? 0);

    expect(titledH).toBeGreaterThan(baseH);
  });

  it('snapshot — flow with title + subtitle, default palette', () => {
    const svg = fig({
      figure: 'flow',
      title: 'Order Processing',
      subtitle: 'E-commerce checkout pipeline',
      nodes: [
        { id: 'cart',    label: 'Cart',    type: 'terminal' },
        { id: 'payment', label: 'Payment', type: 'process'  },
        { id: 'confirm', label: 'Confirm', type: 'terminal' },
      ],
      edges: [
        { from: 'cart',    to: 'payment' },
        { from: 'payment', to: 'confirm' },
      ],
      palette: 'default',
    });
    matchSvgSnapshot('flow-titled-default', svg);
  });
});

// ---------------------------------------------------------------------------
// Tree diagram — title + subtitle
// ---------------------------------------------------------------------------

describe('tree diagram title / subtitle', () => {
  it('renders title and subtitle in the SVG', () => {
    const svg = fig({
      figure: 'tree',
      title: 'Project Structure',
      subtitle: 'Source code layout',
      nodes: [
        { id: 'root', label: 'src' },
        { id: 'a',    label: 'components', parent: 'root' },
        { id: 'b',    label: 'utils',      parent: 'root' },
      ],
    });

    expect(svg).toContain('Project Structure');
    expect(svg).toContain('Source code layout');
    expect(svg).toContain('font-weight="700"');
  });

  it('snapshot — tree with title + subtitle, default palette', () => {
    const svg = fig({
      figure: 'tree',
      title: 'Software Architecture',
      subtitle: 'Layered module hierarchy',
      nodes: [
        { id: 'app',      label: 'Application' },
        { id: 'ui',       label: 'UI',      parent: 'app' },
        { id: 'service',  label: 'Service', parent: 'app' },
        { id: 'data',     label: 'Data',    parent: 'app' },
      ],
      palette: 'default',
    });
    matchSvgSnapshot('tree-titled-default', svg);
  });
});

// ---------------------------------------------------------------------------
// Architecture diagram — title + subtitle
// ---------------------------------------------------------------------------

describe('arch diagram title / subtitle', () => {
  it('renders title and subtitle in the SVG', () => {
    const svg = fig({
      figure: 'arch',
      title: 'Cloud Infrastructure',
      subtitle: 'Production environment overview',
      layers: [
        { id: 'fe', label: 'Frontend', nodes: [{ id: 'web', label: 'Web App' }] },
        { id: 'be', label: 'Backend',  nodes: [{ id: 'api', label: 'API' }]     },
      ],
    });

    expect(svg).toContain('Cloud Infrastructure');
    expect(svg).toContain('Production environment overview');
    expect(svg).toContain('font-weight="700"');
  });

  it('expands SVG height when a title is provided (TB direction)', () => {
    const base = fig({
      figure: 'arch',
      layers: [{ id: 'l1', label: 'Layer', nodes: [{ id: 'n', label: 'Node' }] }],
    });
    const titled = fig({
      figure: 'arch',
      title: 'System Overview',
      layers: [{ id: 'l1', label: 'Layer', nodes: [{ id: 'n', label: 'Node' }] }],
    });

    const baseH  = Number(base.match(/height="(\d+)"/)?.[1] ?? 0);
    const titledH = Number(titled.match(/height="(\d+)"/)?.[1] ?? 0);
    expect(titledH).toBeGreaterThan(baseH);
  });

  it('expands SVG height when a title is provided (LR direction)', () => {
    const base = fig({
      figure: 'arch',
      direction: 'LR',
      layers: [{ id: 'l1', label: 'Layer', nodes: [{ id: 'n', label: 'Node' }] }],
    });
    const titled = fig({
      figure: 'arch',
      title: 'System Overview',
      direction: 'LR',
      layers: [{ id: 'l1', label: 'Layer', nodes: [{ id: 'n', label: 'Node' }] }],
    });

    const baseH  = Number(base.match(/height="(\d+)"/)?.[1] ?? 0);
    const titledH = Number(titled.match(/height="(\d+)"/)?.[1] ?? 0);
    expect(titledH).toBeGreaterThan(baseH);
  });

  it('snapshot — arch with title + subtitle, default palette', () => {
    const svg = fig({
      figure: 'arch',
      title: 'Microservices Architecture',
      subtitle: 'Backend service topology',
      layers: [
        { id: 'gw', label: 'Gateway',  nodes: [{ id: 'nginx', label: 'Nginx' }]               },
        { id: 'svc', label: 'Services', nodes: [{ id: 'auth', label: 'Auth' }, { id: 'orders', label: 'Orders' }] },
        { id: 'db',  label: 'Database', nodes: [{ id: 'pg', label: 'Postgres' }]               },
      ],
      palette: 'default',
    });
    matchSvgSnapshot('arch-titled-default', svg);
  });
});

// ---------------------------------------------------------------------------
// Sequence diagram — title + subtitle
// ---------------------------------------------------------------------------

describe('sequence diagram title / subtitle', () => {
  it('renders title and subtitle in the SVG', () => {
    const svg = fig({
      figure: 'sequence',
      title: 'Login Sequence',
      subtitle: 'Client–server authentication handshake',
      actors: ['Client', 'Server'],
      messages: [
        { from: 'Client', to: 'Server', label: 'POST /login' },
        { from: 'Server', to: 'Client', label: '200 OK', style: 'return' },
      ],
    });

    expect(svg).toContain('Login Sequence');
    expect(svg).toContain('Client');
    expect(svg).toContain('font-weight="700"');
  });

  it('expands SVG height when a title is provided', () => {
    const base = fig({
      figure: 'sequence',
      actors: ['A', 'B'],
      messages: [{ from: 'A', to: 'B' }],
    });
    const titled = fig({
      figure: 'sequence',
      title: 'My Sequence',
      actors: ['A', 'B'],
      messages: [{ from: 'A', to: 'B' }],
    });

    const baseH  = Number(base.match(/height="(\d+)"/)?.[1] ?? 0);
    const titledH = Number(titled.match(/height="(\d+)"/)?.[1] ?? 0);
    expect(titledH).toBeGreaterThan(baseH);
  });

  it('snapshot — sequence with title + subtitle, default palette', () => {
    const svg = fig({
      figure: 'sequence',
      title: 'API Request Flow',
      subtitle: 'REST call from browser to backend',
      actors: ['Browser', 'API', 'Database'],
      messages: [
        { from: 'Browser',  to: 'API',      label: 'GET /data' },
        { from: 'API',      to: 'Database', label: 'SELECT' },
        { from: 'Database', to: 'API',      label: 'rows',   style: 'return' },
        { from: 'API',      to: 'Browser',  label: '200 JSON', style: 'return' },
      ],
      palette: 'default',
    });
    matchSvgSnapshot('sequence-titled-default', svg);
  });
});

// ---------------------------------------------------------------------------
// Quadrant chart — title + subtitle
// ---------------------------------------------------------------------------

describe('quadrant chart title / subtitle', () => {
  it('renders title and subtitle in the SVG', () => {
    const svg = fig({
      figure: 'quadrant',
      title: 'Feature Priority Matrix',
      subtitle: 'Value vs. effort analysis',
      xAxis: { label: 'Effort', min: 'Low', max: 'High' },
      yAxis: { label: 'Value',  min: 'Low', max: 'High' },
      quadrants: ['Quick Wins', 'Strategic', 'Fill-ins', 'Avoid'],
      points: [
        { id: 'a', label: 'Dark mode',   x: 0.2, y: 0.8 },
        { id: 'b', label: 'Perf tuning', x: 0.7, y: 0.9 },
      ],
    });

    expect(svg).toContain('Feature Priority Matrix');
    expect(svg).toContain('Value vs. effort analysis');
    expect(svg).toContain('font-weight="700"');
  });

  it('expands SVG height when a title is provided', () => {
    const base = fig({
      figure: 'quadrant',
      xAxis: { label: 'X', min: '0', max: '1' },
      yAxis: { label: 'Y', min: '0', max: '1' },
      quadrants: ['TL', 'TR', 'BL', 'BR'],
      points: [{ id: 'p', label: 'P', x: 0.5, y: 0.5 }],
    });
    const titled = fig({
      figure: 'quadrant',
      title: 'My Chart',
      xAxis: { label: 'X', min: '0', max: '1' },
      yAxis: { label: 'Y', min: '0', max: '1' },
      quadrants: ['TL', 'TR', 'BL', 'BR'],
      points: [{ id: 'p', label: 'P', x: 0.5, y: 0.5 }],
    });

    const baseH  = Number(base.match(/height="(\d+)"/)?.[1] ?? 0);
    const titledH = Number(titled.match(/height="(\d+)"/)?.[1] ?? 0);
    expect(titledH).toBeGreaterThan(baseH);
  });

  it('snapshot — quadrant with title + subtitle, default palette', () => {
    const svg = fig({
      figure: 'quadrant',
      title: 'Product Roadmap Priority',
      subtitle: 'Q1 initiative assessment',
      xAxis: { label: 'Implementation Cost', min: 'Low', max: 'High' },
      yAxis: { label: 'Business Value',       min: 'Low', max: 'High' },
      quadrants: ['Do Now', 'Plan', 'Deprioritise', 'Outsource'],
      points: [
        { id: 'a', label: 'Login UX',    x: 0.15, y: 0.85 },
        { id: 'b', label: 'Recommender', x: 0.75, y: 0.80 },
        { id: 'c', label: 'Dark Mode',   x: 0.30, y: 0.25 },
        { id: 'd', label: 'A/B Testing', x: 0.60, y: 0.55 },
      ],
      palette: 'default',
    });
    matchSvgSnapshot('quadrant-titled-default', svg);
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting: escaping, dark theme, subtitle-only
// ---------------------------------------------------------------------------

describe('title / subtitle edge cases', () => {
  it('escapes special XML characters in title and subtitle', () => {
    const svg = fig({
      figure: 'flow',
      title: 'A & B <test>',
      subtitle: '"Quoted" & \'apostrophe\'',
      nodes: [{ id: 'a', label: 'Node' }],
      edges: [],
    });

    expect(svg).toContain('A &amp; B &lt;test&gt;');
    expect(svg).toContain('&quot;Quoted&quot; &amp; &apos;apostrophe&apos;');
  });

  it('renders subtitle only (no title)', () => {
    const svg = fig({
      figure: 'arch',
      subtitle: 'Infrastructure overview',
      layers: [{ id: 'l', label: 'Layer', nodes: [{ id: 'n', label: 'Node' }] }],
    });

    expect(svg).toContain('Infrastructure overview');
    // Title font-size is fontSize+4 = 18; subtitle font-size is fontSize-1 = 13.
    // When subtitle-only, the rendered text should use font-size="13" (not 18).
    expect(svg).toContain('font-size="13"');
    expect(svg).not.toContain('font-size="18"');
  });

  it('dark theme: title uses edgeColor (#adb5bd) and subtitle uses groupColor (#5c6370)', () => {
    const svg = fig({
      figure: 'flow',
      title: 'Dark Flow',
      subtitle: 'Night mode diagram',
      theme: 'dark',
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
    });

    expect(svg).toContain('#1a1b1e');           // dark background
    expect(svg).toContain('Dark Flow');
    expect(svg).toContain('Night mode diagram');
    // Dark edgeColor used for title
    expect(svg).toContain('#adb5bd');
    // Dark groupColor used for subtitle
    expect(svg).toContain('#5c6370');
  });
});
