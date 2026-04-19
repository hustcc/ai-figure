import { describe, it, expect } from 'vitest';
import { figmd, parseFigmd } from '../src/index';
import { matchSvgSnapshot } from './helpers';

// ---------------------------------------------------------------------------
// parseFigmd — structural / unit tests
// ---------------------------------------------------------------------------

describe('parseFigmd', () => {
  it('throws on an empty string', () => {
    expect(() => parseFigmd('')).toThrow('figmd: empty diagram definition');
  });

  it('throws on a blank-only string', () => {
    expect(() => parseFigmd('   \n  \n')).toThrow('figmd: empty diagram definition');
  });

  it('throws on an unknown figure type', () => {
    expect(() => parseFigmd('unknown')).toThrow(/unknown figure type/i);
  });

  // ── flow ───────────────────────────────────────────────────────────────────

  it('parses a minimal flow diagram', () => {
    const opts = parseFigmd(`
      flow
      start((Start)) --> end((End))
    `);
    expect(opts.figure).toBe('flow');
    if (opts.figure !== 'flow') return;
    expect(opts.nodes).toHaveLength(2);
    expect(opts.nodes[0]).toMatchObject({ id: 'start', label: 'Start', type: 'terminal' });
    expect(opts.nodes[1]).toMatchObject({ id: 'end', label: 'End', type: 'terminal' });
    expect(opts.edges).toHaveLength(1);
    expect(opts.edges[0]).toEqual({ from: 'start', to: 'end' });
  });

  it('parses flow header options (direction, theme, palette)', () => {
    const opts = parseFigmd(`
      flow LR dark antv
      a[A] --> b[B]
    `);
    if (opts.figure !== 'flow') throw new Error('wrong figure');
    expect(opts.direction).toBe('LR');
    expect(opts.theme).toBe('dark');
    expect(opts.palette).toBe('antv');
  });

  it('parses all four flow node types', () => {
    const opts = parseFigmd(`
      flow
      p[Process]
      d{Decision}
      t((Terminal))
      io[/IO/]
    `);
    if (opts.figure !== 'flow') throw new Error('wrong figure');
    expect(opts.nodes).toHaveLength(4);
    expect(opts.nodes.find((n) => n.id === 'p')?.type).toBe('process');
    expect(opts.nodes.find((n) => n.id === 'd')?.type).toBe('decision');
    expect(opts.nodes.find((n) => n.id === 't')?.type).toBe('terminal');
    expect(opts.nodes.find((n) => n.id === 'io')?.type).toBe('io');
  });

  it('parses labeled flow edges', () => {
    const opts = parseFigmd(`
      flow
      a{Choice} -->|yes| b[Yes]
      a -->|no| c[No]
    `);
    if (opts.figure !== 'flow') throw new Error('wrong figure');
    expect(opts.edges[0]).toEqual({ from: 'a', to: 'b', label: 'yes' });
    expect(opts.edges[1]).toEqual({ from: 'a', to: 'c', label: 'no' });
  });

  it('parses flow groups', () => {
    const opts = parseFigmd(`
      flow
      a[A] --> b[B]
      b --> c[C]
      group Validation: a, b
    `);
    if (opts.figure !== 'flow') throw new Error('wrong figure');
    expect(opts.groups).toHaveLength(1);
    expect(opts.groups?.[0]).toMatchObject({ label: 'Validation', nodes: ['a', 'b'] });
  });

  it('parses flow title and subtitle', () => {
    const opts = parseFigmd(`
      flow
      title: My Flow
      subtitle: A description
      a[A] --> b[B]
    `);
    if (opts.figure !== 'flow') throw new Error('wrong figure');
    expect(opts.title).toBe('My Flow');
    expect(opts.subtitle).toBe('A description');
  });

  it('ignores comment lines (%%)', () => {
    const opts = parseFigmd(`
      flow
      %% this is a comment
      a[A] --> b[B]
    `);
    if (opts.figure !== 'flow') throw new Error('wrong figure');
    expect(opts.nodes).toHaveLength(2);
  });

  it('bare ids in flow default to process type', () => {
    const opts = parseFigmd(`
      flow
      a --> b
    `);
    if (opts.figure !== 'flow') throw new Error('wrong figure');
    expect(opts.nodes[0]).toMatchObject({ id: 'a', label: 'a', type: 'process' });
    expect(opts.nodes[1]).toMatchObject({ id: 'b', label: 'b', type: 'process' });
  });

  // ── tree ───────────────────────────────────────────────────────────────────

  it('parses a minimal tree diagram', () => {
    const opts = parseFigmd(`
      tree
      root[Root]
      root --> child[Child]
    `);
    expect(opts.figure).toBe('tree');
    if (opts.figure !== 'tree') return;
    expect(opts.nodes).toHaveLength(2);
    expect(opts.nodes[0]).toMatchObject({ id: 'root', label: 'Root' });
    expect(opts.nodes[1]).toMatchObject({ id: 'child', label: 'Child', parent: 'root' });
  });

  it('parses tree direction TB from header', () => {
    const opts = parseFigmd(`
      tree TB
      r[Root] --> c[Child]
    `);
    if (opts.figure !== 'tree') throw new Error('wrong figure');
    expect(opts.direction).toBe('TB');
  });

  // ── arch ───────────────────────────────────────────────────────────────────

  it('parses a minimal arch diagram', () => {
    const opts = parseFigmd(`
      arch
      layer fe[Frontend]
      web[Web App]
      layer be[Backend]
      api[API]
    `);
    expect(opts.figure).toBe('arch');
    if (opts.figure !== 'arch') return;
    expect(opts.layers).toHaveLength(2);
    expect(opts.layers[0]).toMatchObject({ id: 'fe', label: 'Frontend' });
    expect(opts.layers[0].nodes).toHaveLength(1);
    expect(opts.layers[0].nodes[0]).toMatchObject({ id: 'web', label: 'Web App' });
    expect(opts.layers[1].nodes[0]).toMatchObject({ id: 'api', label: 'API' });
  });

  it('parses arch layer with bare id', () => {
    const opts = parseFigmd(`
      arch LR
      layer frontend
      node1[App]
    `);
    if (opts.figure !== 'arch') throw new Error('wrong figure');
    expect(opts.layers[0]).toMatchObject({ id: 'frontend', label: 'frontend' });
    expect(opts.direction).toBe('LR');
  });

  // ── sequence ───────────────────────────────────────────────────────────────

  it('parses a minimal sequence diagram', () => {
    const opts = parseFigmd(`
      sequence
      actors: User, API
      User -> API: request
      API --> User: response
    `);
    expect(opts.figure).toBe('sequence');
    if (opts.figure !== 'sequence') return;
    expect(opts.actors).toEqual(['User', 'API']);
    expect(opts.messages).toHaveLength(2);
    expect(opts.messages[0]).toEqual({ from: 'User', to: 'API', label: 'request' });
    expect(opts.messages[1]).toEqual({ from: 'API', to: 'User', label: 'response', style: 'return' });
  });

  it('infers actors from messages when actors line is omitted', () => {
    const opts = parseFigmd(`
      sequence
      A -> B: hello
      B --> A: world
    `);
    if (opts.figure !== 'sequence') throw new Error('wrong figure');
    expect(opts.actors).toEqual(['A', 'B']);
  });

  it('parses sequence messages without labels', () => {
    const opts = parseFigmd(`
      sequence
      A -> B
      B --> A
    `);
    if (opts.figure !== 'sequence') throw new Error('wrong figure');
    expect(opts.messages[0]).toEqual({ from: 'A', to: 'B' });
    expect(opts.messages[1]).toEqual({ from: 'B', to: 'A', style: 'return' });
  });

  it('parses sequence actors with multi-word names', () => {
    const opts = parseFigmd(`
      sequence
      actors: API Gateway, Auth Service
      API Gateway -> Auth Service: validate
    `);
    if (opts.figure !== 'sequence') throw new Error('wrong figure');
    expect(opts.actors).toEqual(['API Gateway', 'Auth Service']);
    expect(opts.messages[0]).toMatchObject({ from: 'API Gateway', to: 'Auth Service' });
  });

  // ── quadrant ───────────────────────────────────────────────────────────────

  it('parses a minimal quadrant chart', () => {
    const opts = parseFigmd(`
      quadrant
      x-axis: Low .. High
      y-axis: Low .. High
      quadrant-1: Q1
      quadrant-2: Q2
      quadrant-3: Q3
      quadrant-4: Q4
      Item A: 0.3, 0.7
      Item B: 0.8, 0.2
    `);
    expect(opts.figure).toBe('quadrant');
    if (opts.figure !== 'quadrant') return;
    expect(opts.xAxis).toEqual({ label: '', min: 'Low', max: 'High' });
    expect(opts.yAxis).toEqual({ label: '', min: 'Low', max: 'High' });
    expect(opts.quadrants).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    expect(opts.points).toHaveLength(2);
    expect(opts.points[0]).toMatchObject({ label: 'Item A', x: 0.3, y: 0.7 });
    expect(opts.points[1]).toMatchObject({ label: 'Item B', x: 0.8, y: 0.2 });
  });

  it('parses quadrant axis with explicit label', () => {
    const opts = parseFigmd(`
      quadrant
      x-axis Effort: Low .. High
      y-axis Value: Low .. High
      quadrant-1: Q1
      quadrant-2: Q2
      quadrant-3: Q3
      quadrant-4: Q4
    `);
    if (opts.figure !== 'quadrant') throw new Error('wrong figure');
    expect(opts.xAxis).toEqual({ label: 'Effort', min: 'Low', max: 'High' });
    expect(opts.yAxis).toEqual({ label: 'Value', min: 'Low', max: 'High' });
  });

  // ── gantt ──────────────────────────────────────────────────────────────────

  it('parses a minimal gantt chart', () => {
    const opts = parseFigmd(`
      gantt
      Task One: t1, 2025-01-01, 2025-01-15
      Task Two: t2, 2025-01-16, 2025-01-31
    `);
    expect(opts.figure).toBe('gantt');
    if (opts.figure !== 'gantt') return;
    expect(opts.tasks).toHaveLength(2);
    expect(opts.tasks[0]).toMatchObject({ id: 't1', label: 'Task One', start: '2025-01-01', end: '2025-01-15' });
    expect(opts.tasks[1]).toMatchObject({ id: 't2', label: 'Task Two', start: '2025-01-16', end: '2025-01-31' });
  });

  it('parses gantt sections and milestones', () => {
    const opts = parseFigmd(`
      gantt
      section Phase 1
      Task One: t1, 2025-01-01, 2025-01-15
      milestone: Launch, 2025-01-15
    `);
    if (opts.figure !== 'gantt') throw new Error('wrong figure');
    expect(opts.tasks[0].groupId).toBe('Phase 1');
    expect(opts.milestones).toHaveLength(1);
    expect(opts.milestones?.[0]).toEqual({ label: 'Launch', date: '2025-01-15' });
  });
});

// ---------------------------------------------------------------------------
// figmd — SVG rendering / snapshot tests
// ---------------------------------------------------------------------------

it('figmd flow — CI pipeline, antv palette, LR direction', () => {
  const svg = figmd(`
    flow LR antv
    title: CI Pipeline
    subtitle: Automated build and deploy
    code[Write Code] --> test{Tests Pass?}
    test -->|yes| build[Build Image]
    test -->|no| fix((Fix Issues))
    fix --> code
    build --> deploy[/Deploy/]
    group Pipeline: code, test, build
  `);
  expect(svg).toContain('<svg');
  expect(svg).toContain('CI Pipeline');
  expect(svg).toContain('Write Code');
  matchSvgSnapshot('parse-flow-ci-antv', svg);
});

it('figmd tree — org chart, default palette, TB direction', () => {
  const svg = figmd(`
    tree TB default
    title: Org Chart
    ceo[CEO]
    ceo --> cto[CTO]
    ceo --> coo[COO]
    cto --> dev[Developer]
    coo --> ops[Operations]
  `);
  expect(svg).toContain('<svg');
  expect(svg).toContain('Org Chart');
  matchSvgSnapshot('parse-tree-org-default', svg);
});

it('figmd arch — cloud architecture, drawio palette, TB direction', () => {
  const svg = figmd(`
    arch TB drawio
    title: Cloud Architecture
    layer frontend[Frontend]
    web[Web App]
    mobile[Mobile App]
    layer backend[Backend]
    api[API Server]
    auth[Auth Service]
    layer data[Data]
    db[Database]
    cache[Cache]
  `);
  expect(svg).toContain('<svg');
  expect(svg).toContain('Cloud Architecture');
  matchSvgSnapshot('parse-arch-cloud-drawio', svg);
});

it('figmd sequence — login flow, default palette', () => {
  const svg = figmd(`
    sequence default
    title: Login Flow
    actors: Browser, API, Auth, DB
    Browser -> API: POST /login
    API -> Auth: validateCredentials
    Auth -> DB: SELECT user
    DB --> Auth: user row
    Auth --> API: JWT token
    API --> Browser: 200 OK
  `);
  expect(svg).toContain('<svg');
  expect(svg).toContain('Login Flow');
  expect(svg).toContain('POST /login');
  matchSvgSnapshot('parse-sequence-login-default', svg);
});

it('figmd quadrant — feature priority, figma palette', () => {
  const svg = figmd(`
    quadrant dark figma
    title: Feature Priority
    x-axis Effort: Low .. High
    y-axis Value: Low .. High
    quadrant-1: Strategic
    quadrant-2: Quick Wins
    quadrant-3: Long Shots
    quadrant-4: Low Priority
    Auth Revamp: 0.25, 0.85
    Dark Mode: 0.15, 0.35
    Recommendations: 0.70, 0.80
    Offline Mode: 0.80, 0.20
    Analytics: 0.50, 0.60
  `);
  expect(svg).toContain('<svg');
  expect(svg).toContain('Feature Priority');
  matchSvgSnapshot('parse-quadrant-priority-figma', svg);
});

it('figmd gantt — project plan, antv palette', () => {
  const svg = figmd(`
    gantt light antv
    title: Q1 Project Plan
    subtitle: Engineering Roadmap
    section Design
    Wireframes: t1, 2025-01-06, 2025-01-17
    Mockups: t2, 2025-01-20, 2025-01-31
    section Development
    Frontend: t3, 2025-02-03, 2025-02-28
    Backend: t4, 2025-01-27, 2025-03-07
    section QA
    Testing: t5, 2025-02-24, 2025-03-14
    milestone: Launch, 2025-03-21
  `);
  expect(svg).toContain('<svg');
  expect(svg).toContain('Q1 Project Plan');
  matchSvgSnapshot('parse-gantt-project-antv', svg);
});
