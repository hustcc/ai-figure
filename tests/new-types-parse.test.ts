import { it, expect } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('state — parseFigmd markdown round-trip', () => {
  const svg = fig(`
    state
    title: Auth State
    idle[Idle]
    auth[Authenticating]
    done((Done))
    failed[Failed] accent
    [*] --> idle
    idle --> auth: login
    auth --> done: success
    auth --> failed: error
    failed --> idle: retry
  `);
  expect(svg).toContain('state-diagram');
  expect(svg).toContain('Auth State');
  matchSvgSnapshot('state-parse-figmd', svg);
});

it('er — parseFigmd markdown round-trip', () => {
  const svg = fig(`
    er
    title: Mini Schema
    entity User[User]
      id pk: uuid
      email: text
    entity Post[Post]
      id pk: uuid
      user_id fk: uuid
    User --> Post: writes
  `);
  expect(svg).toContain('er-diagram');
  expect(svg).toContain('Mini Schema');
  matchSvgSnapshot('er-parse-figmd', svg);
});

it('timeline — parseFigmd markdown round-trip', () => {
  const svg = fig(`
    timeline
    title: Releases
    2022-01-15: v1.0 milestone
    2022-09-01: v1.2
    2023-03-10: v2.0 milestone
  `);
  expect(svg).toContain('timeline-diagram');
  expect(svg).toContain('Releases');
  matchSvgSnapshot('timeline-parse-figmd', svg);
});

it('swimlane — parseFigmd markdown round-trip', () => {
  const svg = fig(`
    swimlane
    title: Order Flow
    lanes: Customer, Ops
    Customer: order[Place Order]
    Ops: process[Process Order]
    order --> process
  `);
  expect(svg).toContain('swimlane-diagram');
  expect(svg).toContain('Order Flow');
  matchSvgSnapshot('swimlane-parse-figmd', svg);
});

it('pyramid — parseFigmd markdown round-trip', () => {
  const svg = fig(`
    pyramid
    title: Hierarchy
    Level 1 accent
    Level 2
    Level 3
  `);
  expect(svg).toContain('pyramid-diagram');
  expect(svg).toContain('Hierarchy');
  matchSvgSnapshot('pyramid-parse-figmd', svg);
});

it('pyramid funnel — parseFigmd markdown round-trip', () => {
  const svg = fig(`
    pyramid funnel
    title: Funnel
    Visitors: 100%
    Trials: 30%
    Paying: 8% accent
  `);
  expect(svg).toContain('pyramid-diagram');
  matchSvgSnapshot('pyramid-funnel-parse-figmd', svg);
});
