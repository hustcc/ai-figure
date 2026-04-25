/**
 * Parse tests for the swimlane diagram markdown syntax.
 *
 * Lanes are declared with `section LaneName`.  Node lines that follow belong
 * to the current lane.  Edge lines (`A --> B`) can appear anywhere.
 *
 *   figure swimlane
 *   title: Order Flow
 *   section Customer
 *     order: Place Order
 *     pay: Confirm Payment
 *   section Warehouse
 *     receive: Receive Order
 *   order --> pay
 *   pay --> receive
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('swimlane — markdown parse', () => {
  it('renders a basic swimlane diagram from string input', () => {
    const svg = fig(`
      figure swimlane
      title: Order Flow
      section Customer
        order: Place Order
        pay: Confirm Payment
      section Warehouse
        receive: Receive Order
      order --> pay
      pay --> receive
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Order Flow');
    expect(svg).toContain('Customer');
    expect(svg).toContain('Warehouse');
    expect(svg).toContain('Place Order');
    expect(svg).toContain('Receive Order');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure swimlane
      title: Hiring Process
      subtitle: Recruitment pipeline
      section HR
        screen: Screen
      section Engineering
        interview: Interview
      screen --> interview
    `);
    expect(svg).toContain('Hiring Process');
    expect(svg).toContain('Recruitment pipeline');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure swimlane
      theme: dark
      section Lane A
        n: Node
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette antv', () => {
    const svg = fig(`
      figure swimlane
      palette: antv
      section Lane
        n: Node
    `);
    expect(svg).toContain('<svg');
  });

  it('edge with label', () => {
    const svg = fig(`
      figure swimlane
      section A
        n1: Node 1
      section B
        n2: Node 2
      n1 --> n2: approved
    `);
    expect(svg).toContain('approved');
  });

  it('cross-lane edges work correctly', () => {
    const svg = fig(`
      figure swimlane
      section Sales
        lead: Lead
        deal: Deal
      section Ops
        fulfill: Fulfill
      lead --> deal
      deal --> fulfill
    `);
    expect(svg).toContain('Lead');
    expect(svg).toContain('Deal');
    expect(svg).toContain('Fulfill');
  });

  it('node shapes: process, decision, terminal', () => {
    const svg = fig(`
      figure swimlane
      section Lane
        p: Process
        d: Decision, decision
        t: Terminal, terminal
    `);
    expect(svg).toContain('Process');
    expect(svg).toContain('Decision');
    expect(svg).toContain('Terminal');
  });

  it('duplicate node ids are ignored (only first occurrence kept)', () => {
    const svg = fig(`
      figure swimlane
      section A
        n: First
      section B
        n: Second
    `);
    // Should not crash; first occurrence wins
    expect(svg).toContain('<svg');
    expect(svg).toContain('First');
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure swimlane')).not.toThrow();
    expect(fig('figure swimlane')).toContain('<svg');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure swimlane
      %% process flow
      section HR
        start: Start
    `);
    expect(svg).toContain('Start');
  });

  it('multiple lanes, multiple nodes, multiple edges', () => {
    const svg = fig(`
      figure swimlane
      section Customer
        order: Place Order
        pay: Pay
      section Finance
        invoice: Issue Invoice
        receipt: Send Receipt
      section Fulfillment
        ship: Ship
      order --> pay
      pay --> invoice
      invoice --> receipt
      pay --> ship
    `);
    expect(svg).toContain('Customer');
    expect(svg).toContain('Finance');
    expect(svg).toContain('Fulfillment');
    expect(svg).toContain('Issue Invoice');
    expect(svg).toContain('Ship');
  });
});
