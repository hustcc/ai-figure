/**
 * SKILL.md accuracy test
 *
 * Verifies that the 11 canonical diagram examples documented in SKILL.md
 * are correctly parsed by parseFigmd() and rendered by fig().
 * This measures the "documentation correctness" rate — i.e., whether an AI
 * that follows the SKILL.md examples would produce valid diagrams.
 */
import { describe, it, expect } from 'vitest';
import { fig, parseFigmd } from '../../src/index';

describe('SKILL.md example accuracy', () => {
  it('flow: parses nodes, edges, group, direction, palette, title', () => {
    const md = `figure flow
direction: LR
palette: antv
title: My Flow
A[Source] --> B[Target]
A --> B[Target]: label
group Name: A, B`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('flow');
    expect(o.direction).toBe('LR');
    expect(o.palette).toBe('antv');
    expect(o.title).toBe('My Flow');
    expect(o.nodes.length).toBeGreaterThanOrEqual(2);
    expect(o.edges.length).toBeGreaterThanOrEqual(1);
    expect(o.groups?.length).toBeGreaterThanOrEqual(1);
    expect(fig(md)).toContain('<svg');
  });

  it('tree: parses nodes, direction, title', () => {
    const md = `figure tree
direction: LR
title: Org Chart
root[Root]
root --> child[Child]
child --> leaf[Leaf]`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('tree');
    expect(o.direction).toBe('LR');
    expect(o.title).toBe('Org Chart');
    expect(o.nodes.length).toBeGreaterThanOrEqual(3);
    expect(fig(md)).toContain('<svg');
  });

  it('arch: parses 3 layers, palette, title', () => {
    const md = `figure arch
direction: TB
palette: antv
title: Web Stack
layer Frontend
  ui[React App]
  assets[Static Assets]
layer Backend
  api[REST API]
  auth[Auth Service]
layer Data
  db[PostgreSQL]`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('arch');
    expect(o.layers.length).toBe(3);
    expect(o.palette).toBe('antv');
    expect(o.title).toBe('Web Stack');
    expect(fig(md)).toContain('<svg');
  });

  it('sequence: parses 3 actors, 2 messages, title', () => {
    const md = `figure sequence
title: Login
actors: Browser, API, DB
Browser -> API: POST /login
API --> Browser: 200 OK`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('sequence');
    expect(o.title).toBe('Login');
    expect(o.actors.length).toBe(3);
    expect(o.messages.length).toBe(2);
    expect(fig(md)).toContain('<svg');
  });

  it('quadrant: parses axes, 4 quadrant labels, 1 point, title', () => {
    const md = `figure quadrant
title: Priority
x-axis Effort: Low .. High
y-axis Value: Low .. High
quadrant-1: Quick Wins
quadrant-2: Strategic
quadrant-3: Low Prio
quadrant-4: Long Shots
Feature A: 0.2, 0.9`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('quadrant');
    expect(o.title).toBe('Priority');
    expect(o.xAxis.label).toBe('Effort');
    expect(o.yAxis.label).toBe('Value');
    expect(o.quadrants.length).toBe(4);
    expect(o.points.length).toBe(1);
    expect(o.points[0].x).toBe(0.2);
    expect(o.points[0].y).toBe(0.9);
    expect(fig(md)).toContain('<svg');
  });

  it('gantt: parses 3 tasks, 1 milestone, title', () => {
    const md = `figure gantt
title: Q1 Roadmap
section Design
  Wireframes: t1, 2025-01-06, 2025-01-24
  Mockups: t2, 2025-01-25, 2025-02-07
section Dev
  Frontend: t3, 2025-02-03, 2025-02-28
milestone: Launch, 2025-03-01`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('gantt');
    expect(o.title).toBe('Q1 Roadmap');
    expect(o.tasks.length).toBe(3);
    expect(o.milestones.length).toBe(1);
    expect(o.milestones[0].label).toBe('Launch');
    expect(fig(md)).toContain('<svg');
  });

  it('state: parses nodes, transitions, accent, title', () => {
    const md = `figure state
title: Order Status
idle[Idle]
processing[Processing]
accent: failed
start --> idle
idle --> processing: order placed
processing --> end: shipped
processing --> failed: error
failed --> idle: retry`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('state');
    expect(o.title).toBe('Order Status');
    expect(o.nodes.length).toBeGreaterThanOrEqual(4);
    expect(o.transitions.length).toBeGreaterThanOrEqual(4);
    const accentNode = o.nodes.find((n: any) => n.accent === true);
    expect(accentNode).toBeTruthy();
    expect(accentNode.id).toBe('failed');
    expect(fig(md)).toContain('<svg');
  });

  it('er: parses 2 entities with fields, 1 relation, title', () => {
    const md = `figure er
title: Blog Schema
entity User
  id pk: uuid
  email: text
entity Post
  id pk: uuid
  author_id fk: uuid
  title: text
User --> Post: writes`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('er');
    expect(o.title).toBe('Blog Schema');
    expect(o.entities.length).toBe(2);
    expect(o.relations.length).toBe(1);
    const user = o.entities.find((e: any) => e.label === 'User' || e.id === 'User');
    expect(user).toBeTruthy();
    expect(user.fields.length).toBe(2);
    const pkField = user.fields.find((f: any) => f.key === 'pk');
    expect(pkField).toBeTruthy();
    expect(fig(md)).toContain('<svg');
  });

  it('timeline: parses 4 events (2 milestones), title', () => {
    const md = `figure timeline
title: Product History
2020-01-15: v1.0 Launch milestone
2021-06-01: v1.5 Improvements
2022-03-10: v2.0 Redesign milestone
2023-11-01: v3.0 AI Features`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('timeline');
    expect(o.title).toBe('Product History');
    expect(o.events.length).toBe(4);
    const milestones = o.events.filter((e: any) => e.milestone);
    expect(milestones.length).toBe(2);
    expect(fig(md)).toContain('<svg');
  });

  it('swimlane: parses 3 lanes, 5 nodes, 4 edges, title', () => {
    const md = `figure swimlane
title: Order Flow
section Customer
  order[Place Order]
  pay[Confirm Payment]
section Warehouse
  receive[Receive Order]
  pack[Pack Items]
section Shipping
  ship[Ship Package]
order --> pay
pay --> receive
receive --> pack
pack --> ship`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('swimlane');
    expect(o.title).toBe('Order Flow');
    expect(o.lanes.length).toBe(3);
    expect(o.nodes.length).toBe(5);
    expect(o.edges.length).toBe(4);
    expect(fig(md)).toContain('<svg');
  });

  it('bubble: parses 3 items, title', () => {
    const md = `figure bubble
title: Market Analysis
Product A: 75
Product B: 50
Product C: 85`;
    const o = parseFigmd(md) as any;
    expect(o.figure).toBe('bubble');
    expect(o.title).toBe('Market Analysis');
    expect(o.items.length).toBe(3);
    expect(o.items[0].label).toBe('Product A');
    expect(o.items[0].value).toBe(75);
    expect(fig(md)).toContain('<svg');
  });
});
