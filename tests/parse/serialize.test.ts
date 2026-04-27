/**
 * Tests for figToMarkdown — verifies that:
 *   1. The serialized markdown contains the expected syntax elements.
 *   2. Round-trip: fig(figToMarkdown(opts)) produces a valid SVG with the
 *      same content as fig(opts).
 *
 * Also tests that parseFigmd is exported and can be called directly.
 */
import { describe, it, expect } from 'vitest';
import { fig, figToMarkdown, parseFigmd } from '../../src/index';
import type { FigOptions } from '../../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render the same config via JSON and via markdown and compare key SVG content. */
function roundtrip(opts: FigOptions, contains: string[]): void {
  const md  = figToMarkdown(opts);
  const svg = fig(md);
  expect(svg).toContain('<svg');
  for (const s of contains) {
    expect(svg, `roundtrip SVG should contain "${s}"`).toContain(s);
  }
}

// ---------------------------------------------------------------------------
// figure: flow
// ---------------------------------------------------------------------------

describe('figToMarkdown — flow', () => {
  it('emits figure header', () => {
    const md = figToMarkdown({ figure: 'flow', nodes: [], edges: [] });
    expect(md.startsWith('figure flow')).toBe(true);
  });

  it('emits config lines', () => {
    const md = figToMarkdown({
      figure: 'flow', nodes: [], edges: [],
      title: 'My Flow', subtitle: 'Sub', theme: 'dark', palette: 'antv', direction: 'LR',
    });
    expect(md).toContain('title: My Flow');
    expect(md).toContain('subtitle: Sub');
    expect(md).toContain('theme: dark');
    expect(md).toContain('palette: antv');
    expect(md).toContain('direction: LR');
  });

  it('emits node bracket expressions', () => {
    const md = figToMarkdown({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'Start', type: 'process' },
        { id: 'b', label: 'Check', type: 'decision' },
        { id: 'c', label: 'Done',  type: 'terminal' },
        { id: 'd', label: 'Input', type: 'io' },
      ],
      edges: [],
    });
    expect(md).toContain('a[Start]');
    expect(md).toContain('b{Check}');
    expect(md).toContain('c((Done))');
    expect(md).toContain('d[/Input/]');
  });

  it('emits bare id when id === label for process node', () => {
    const md = figToMarkdown({
      figure: 'flow',
      nodes: [{ id: 'alpha', label: 'alpha', type: 'process' }],
      edges: [],
    });
    // No brackets needed
    expect(md).toContain('alpha');
    expect(md).not.toContain('alpha[');
  });

  it('emits edges with labels', () => {
    const md = figToMarkdown({
      figure: 'flow',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b', label: 'yes' }],
    });
    expect(md).toContain('-->');
    expect(md).toContain('yes');
  });

  it('emits group lines', () => {
    const md = figToMarkdown({
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
      edges: [],
      groups: [{ id: 'g1', label: 'MyGroup', nodes: ['a', 'b'] }],
    });
    expect(md).toContain('group MyGroup: a, b');
  });

  it('round-trip flow diagram', () => {
    roundtrip(
      {
        figure: 'flow',
        title: 'Auth',
        nodes: [
          { id: 's', label: 'Start', type: 'terminal' },
          { id: 'l', label: 'Login', type: 'process' },
          { id: 'd', label: 'Valid?', type: 'decision' },
        ],
        edges: [
          { from: 's', to: 'l' },
          { from: 'l', to: 'd', label: 'submit' },
        ],
      },
      ['Auth', 'Start', 'Login', 'Valid?', 'submit'],
    );
  });

  it('custom hex array palette round-trips', () => {
    const opts: FigOptions = {
      figure: 'flow',
      nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
      edges: [{ from: 'a', to: 'b' }],
      palette: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
    };
    const md = figToMarkdown(opts);
    expect(md).toContain('palette: #ff0000,#00ff00,#0000ff,#ffff00');
    // parseFigmd must reconstruct the array
    const parsed = parseFigmd(md);
    expect(Array.isArray(parsed.palette)).toBe(true);
    expect(parsed.palette).toEqual(['#ff0000', '#00ff00', '#0000ff', '#ffff00']);
  });
});

// ---------------------------------------------------------------------------
// figure: tree
// ---------------------------------------------------------------------------

describe('figToMarkdown — tree', () => {
  it('emits parent --> child edges', () => {
    const md = figToMarkdown({
      figure: 'tree',
      nodes: [
        { id: 'root', label: 'Root' },
        { id: 'c1', label: 'Child 1', parent: 'root' },
        { id: 'c2', label: 'Child 2', parent: 'root' },
      ],
    });
    expect(md).toContain('-->');
    expect(md).toContain('Root');
    expect(md).toContain('Child 1');
    expect(md).toContain('Child 2');
  });

  it('emits standalone for isolated root (no children)', () => {
    const md = figToMarkdown({
      figure: 'tree',
      nodes: [{ id: 'solo', label: 'Alone' }],
    });
    expect(md).toContain('solo[Alone]');
    expect(md).not.toContain('-->');
  });

  it('round-trip tree diagram', () => {
    roundtrip(
      {
        figure: 'tree',
        title: 'Org Chart',
        nodes: [
          { id: 'ceo', label: 'CEO' },
          { id: 'vp',  label: 'VP', parent: 'ceo' },
          { id: 'eng', label: 'Engineering', parent: 'vp' },
        ],
      },
      ['Org Chart', 'CEO', 'VP', 'Engineering'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: arch
// ---------------------------------------------------------------------------

describe('figToMarkdown — arch', () => {
  it('emits layer keyword', () => {
    const md = figToMarkdown({
      figure: 'arch',
      layers: [
        { id: 'frontend', label: 'Frontend', nodes: [{ id: 'ui', label: 'UI' }] },
        { id: 'backend',  label: 'Backend',  nodes: [{ id: 'api', label: 'API' }] },
      ],
    });
    expect(md).toContain('layer Frontend');
    expect(md).toContain('layer Backend');
    expect(md).toContain('UI');
    expect(md).toContain('API');
  });

  it('round-trip arch diagram', () => {
    roundtrip(
      {
        figure: 'arch',
        title: 'System Layers',
        layers: [
          { id: 'web', label: 'Web', nodes: [{ id: 'nginx', label: 'Nginx' }] },
          { id: 'app', label: 'App', nodes: [{ id: 'svc', label: 'Service' }] },
          { id: 'db',  label: 'DB',  nodes: [{ id: 'pg', label: 'Postgres' }] },
        ],
      },
      ['System Layers', 'Web', 'App', 'DB', 'Nginx', 'Service', 'Postgres'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: sequence
// ---------------------------------------------------------------------------

describe('figToMarkdown — sequence', () => {
  it('emits actors line and arrows', () => {
    const md = figToMarkdown({
      figure: 'sequence',
      actors: ['User', 'Server', 'DB'],
      messages: [
        { from: 'User', to: 'Server', label: 'request' },
        { from: 'Server', to: 'DB', label: 'query' },
        { from: 'DB', to: 'Server', label: 'result', style: 'return' },
      ],
    });
    expect(md).toContain('actors: User, Server, DB');
    expect(md).toContain('User -> Server: request');
    expect(md).toContain('Server -> DB: query');
    expect(md).toContain('DB --> Server: result');
  });

  it('round-trip sequence diagram', () => {
    roundtrip(
      {
        figure: 'sequence',
        actors: ['Client', 'API'],
        messages: [
          { from: 'Client', to: 'API', label: 'GET /data' },
          { from: 'API', to: 'Client', label: '200 OK', style: 'return' },
        ],
      },
      ['Client', 'API', 'GET /data', '200 OK'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: quadrant
// ---------------------------------------------------------------------------

describe('figToMarkdown — quadrant', () => {
  it('emits axis and quadrant lines', () => {
    const md = figToMarkdown({
      figure: 'quadrant',
      xAxis:     { label: 'Effort', min: 'Low', max: 'High' },
      yAxis:     { label: 'Impact', min: 'Low', max: 'High' },
      quadrants: ['Quick Win', 'Strategic', 'Fill-In', 'Avoid'],
      points:    [{ id: 'p0', label: 'Feature A', x: 0.3, y: 0.8 }],
    });
    expect(md).toContain('x-axis Effort: Low..High');
    expect(md).toContain('y-axis Impact: Low..High');
    expect(md).toContain('quadrant-1: Quick Win');
    expect(md).toContain('quadrant-2: Strategic');
    expect(md).toContain('Feature A: 0.3, 0.8');
  });

  it('round-trip quadrant diagram', () => {
    roundtrip(
      {
        figure: 'quadrant',
        title: 'Priority Matrix',
        xAxis:     { label: 'Complexity', min: 'Simple', max: 'Complex' },
        yAxis:     { label: 'Value', min: 'Low', max: 'High' },
        quadrants: ['Easy Win', 'Big Bet', 'Do Later', 'Skip'],
        points:    [
          { id: 'p0', label: 'Task A', x: 0.2, y: 0.9 },
          { id: 'p1', label: 'Task B', x: 0.7, y: 0.4 },
        ],
      },
      ['Priority Matrix', 'Task A', 'Task B'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: gantt
// ---------------------------------------------------------------------------

describe('figToMarkdown — gantt', () => {
  it('emits task lines in label: id, start, end format', () => {
    const md = figToMarkdown({
      figure: 'gantt',
      tasks: [
        { id: 't1', label: 'Design', start: '2025-01-01', end: '2025-01-15' },
      ],
    });
    expect(md).toContain('Design: t1, 2025-01-01, 2025-01-15');
  });

  it('emits section headers', () => {
    const md = figToMarkdown({
      figure: 'gantt',
      tasks: [
        { id: 't1', label: 'Design', start: '2025-01-01', end: '2025-01-15', groupId: 'Phase 1' },
        { id: 't2', label: 'Build',  start: '2025-01-16', end: '2025-02-15', groupId: 'Phase 2' },
      ],
    });
    expect(md).toContain('section Phase 1');
    expect(md).toContain('section Phase 2');
  });

  it('emits milestone lines', () => {
    const md = figToMarkdown({
      figure: 'gantt',
      tasks: [{ id: 't1', label: 'Task', start: '2025-01-01', end: '2025-01-15' }],
      milestones: [{ date: '2025-01-20', label: 'Launch' }],
    });
    expect(md).toContain('milestone: Launch, 2025-01-20');
  });

  it('round-trip gantt diagram', () => {
    roundtrip(
      {
        figure: 'gantt',
        title: 'Q1 Roadmap',
        tasks: [
          { id: 'd1', label: 'Wireframes', start: '2025-01-06', end: '2025-01-24', groupId: 'Design' },
          { id: 'e1', label: 'Frontend',   start: '2025-01-20', end: '2025-02-28', groupId: 'Dev' },
        ],
        milestones: [{ date: '2025-03-01', label: 'Release' }],
      },
      ['Q1 Roadmap', 'Wireframes', 'Frontend', 'Release'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: state
// ---------------------------------------------------------------------------

describe('figToMarkdown — state', () => {
  it('emits start/end reserved ids', () => {
    const md = figToMarkdown({
      figure: 'state',
      nodes: [
        { id: 'start', label: '',    type: 'start' },
        { id: 'idle',  label: 'Idle' },
        { id: 'end',   label: '',    type: 'end' },
      ],
      transitions: [
        { from: 'start', to: 'idle' },
        { from: 'idle',  to: 'end' },
      ],
    });
    expect(md).toContain('start');
    expect(md).toContain('end');
    expect(md).toContain('idle[Idle]');
    expect(md).toContain('start --> idle');
  });

  it('emits accent line', () => {
    const md = figToMarkdown({
      figure: 'state',
      nodes: [
        { id: 'start', label: '', type: 'start' },
        { id: 'error', label: 'Error', accent: true },
      ],
      transitions: [{ from: 'start', to: 'error' }],
    });
    expect(md).toContain('accent: error');
  });

  it('round-trip state diagram', () => {
    roundtrip(
      {
        figure: 'state',
        title: 'Traffic Light',
        nodes: [
          { id: 'start', label: '', type: 'start' },
          { id: 'red',   label: 'Red' },
          { id: 'green', label: 'Green' },
          { id: 'end',   label: '', type: 'end' },
        ],
        transitions: [
          { from: 'start', to: 'red' },
          { from: 'red',   to: 'green', label: 'go' },
          { from: 'green', to: 'end' },
        ],
      },
      ['Traffic Light', 'Red', 'Green'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: er
// ---------------------------------------------------------------------------

describe('figToMarkdown — er', () => {
  it('emits entity blocks with fields', () => {
    const md = figToMarkdown({
      figure: 'er',
      entities: [
        {
          id: 'User', label: 'User',
          fields: [
            { name: 'id',    key: 'pk', type: 'uuid' },
            { name: 'email', type: 'text' },
          ],
        },
      ],
      relations: [],
    });
    expect(md).toContain('entity User');
    expect(md).toContain('id pk: uuid');
    expect(md).toContain('email: text');
  });

  it('emits relation lines', () => {
    const md = figToMarkdown({
      figure: 'er',
      entities: [
        { id: 'User', label: 'User', fields: [] },
        { id: 'Post', label: 'Post', fields: [] },
      ],
      relations: [{ from: 'User', to: 'Post', label: 'writes' }],
    });
    expect(md).toContain('User --> Post: writes');
  });

  it('emits accent line after entities', () => {
    const md = figToMarkdown({
      figure: 'er',
      entities: [{ id: 'Order', label: 'Order', fields: [], accent: true }],
      relations: [],
    });
    expect(md).toContain('accent: Order');
    // accent must come after the entity declaration
    expect(md.indexOf('entity Order')).toBeLessThan(md.indexOf('accent: Order'));
  });

  it('round-trip er diagram', () => {
    roundtrip(
      {
        figure: 'er',
        title: 'Blog Schema',
        entities: [
          {
            id: 'User', label: 'User',
            fields: [{ name: 'id', key: 'pk', type: 'uuid' }, { name: 'email', type: 'text' }],
          },
          {
            id: 'Post', label: 'Post',
            fields: [{ name: 'id', key: 'pk', type: 'uuid' }, { name: 'author_id', key: 'fk', type: 'uuid' }],
          },
        ],
        relations: [{ from: 'User', to: 'Post', label: 'writes' }],
      },
      ['Blog Schema', 'User', 'Post', 'email', 'writes'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: timeline
// ---------------------------------------------------------------------------

describe('figToMarkdown — timeline', () => {
  it('emits date: label lines', () => {
    const md = figToMarkdown({
      figure: 'timeline',
      events: [
        { id: 'e0', label: 'Launch',  date: '2025-01-15' },
        { id: 'e1', label: 'Release', date: '2025-03-01', milestone: true },
      ],
    });
    expect(md).toContain('2025-01-15: Launch');
    expect(md).toContain('2025-03-01: Release milestone');
  });

  it('round-trip timeline diagram', () => {
    roundtrip(
      {
        figure: 'timeline',
        title: 'Product History',
        events: [
          { id: 'e0', label: 'Founded',   date: '2020-01-01' },
          { id: 'e1', label: 'Series A',  date: '2021-06-15', milestone: true },
          { id: 'e2', label: 'Launch v1', date: '2022-03-01' },
        ],
      },
      ['Product History', 'Founded', 'Series A', 'Launch v1'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: swimlane
// ---------------------------------------------------------------------------

describe('figToMarkdown — swimlane', () => {
  it('emits section headers and node lines', () => {
    const md = figToMarkdown({
      figure: 'swimlane',
      lanes: ['Customer', 'Support'],
      nodes: [
        { id: 'req',  label: 'Request', lane: 'Customer', type: 'process' },
        { id: 'ack',  label: 'Ack',     lane: 'Support',  type: 'process' },
      ],
      edges: [{ from: 'req', to: 'ack', label: 'sends' }],
    });
    expect(md).toContain('section Customer');
    expect(md).toContain('section Support');
    expect(md).toContain('req[Request]');
    expect(md).toContain('req --> ack: sends');
  });

  it('round-trip swimlane diagram', () => {
    roundtrip(
      {
        figure: 'swimlane',
        title: 'Order Flow',
        lanes: ['Customer', 'Warehouse'],
        nodes: [
          { id: 'order',   label: 'Place Order',    lane: 'Customer',  type: 'process' },
          { id: 'receive', label: 'Receive Order',  lane: 'Warehouse', type: 'process' },
        ],
        edges: [{ from: 'order', to: 'receive', label: 'dispatch' }],
      },
      ['Order Flow', 'Customer', 'Warehouse', 'Place Order', 'Receive Order', 'dispatch'],
    );
  });
});

// ---------------------------------------------------------------------------
// figure: bubble
// ---------------------------------------------------------------------------

describe('figToMarkdown — bubble', () => {
  it('emits Label: value lines', () => {
    const md = figToMarkdown({
      figure: 'bubble',
      items: [
        { label: 'React',   value: 80 },
        { label: 'Vue',     value: 50 },
        { label: 'Angular', value: 40 },
      ],
    });
    expect(md).toContain('React: 80');
    expect(md).toContain('Vue: 50');
    expect(md).toContain('Angular: 40');
  });

  it('round-trip bubble chart', () => {
    roundtrip(
      {
        figure: 'bubble',
        title: 'Market Share',
        items: [
          { label: 'Alpha', value: 70 },
          { label: 'Beta',  value: 30 },
        ],
      },
      ['Market Share', 'Alpha', 'Beta'],
    );
  });
});

// ---------------------------------------------------------------------------
// parseFigmd export
// ---------------------------------------------------------------------------

describe('parseFigmd — exported correctly', () => {
  it('is callable and returns FigOptions', () => {
    const opts = parseFigmd('figure bubble\nAlpha: 50\nBeta: 30');
    expect(opts.figure).toBe('bubble');
  });

  it('throws on unknown figure type', () => {
    expect(() => parseFigmd('figure unknown')).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => parseFigmd('')).toThrow();
  });
});
