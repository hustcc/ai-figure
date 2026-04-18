import { describe, it, expect } from 'vitest';
import { createFlowChart } from '../src/index';

// ---------------------------------------------------------------------------
// Snapshot tests — each config mirrors a canonical preview diagram.
// Run `npm test -- --update-snapshots` to regenerate after intentional
// rendering changes.
// ---------------------------------------------------------------------------

describe('snapshots', () => {
  it('decision branch — excalidraw theme, TB direction', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'start', label: 'Start', type: 'terminal' },
        { id: 'process', label: 'Process', type: 'process' },
        { id: 'decision', label: 'Is Valid?', type: 'decision' },
        { id: 'success', label: 'Success', type: 'terminal' },
        { id: 'failure', label: 'Failure', type: 'terminal' },
      ],
      edges: [
        { from: 'start', to: 'process' },
        { from: 'process', to: 'decision' },
        { from: 'decision', to: 'success', label: 'Yes' },
        { from: 'decision', to: 'failure', label: 'No' },
      ],
      theme: 'excalidraw',
      direction: 'TB',
    });
    expect(svg).toMatchSnapshot();
  });

  it('validation group — excalidraw theme, TB direction', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'input', label: 'User Input', type: 'io' },
        { id: 'parse', label: 'Parse', type: 'process' },
        { id: 'valid', label: 'Valid?', type: 'decision' },
        { id: 'save', label: 'Save', type: 'terminal' },
        { id: 'error', label: 'Error', type: 'terminal' },
      ],
      edges: [
        { from: 'input', to: 'parse' },
        { from: 'parse', to: 'valid' },
        { from: 'valid', to: 'save', label: 'Yes' },
        { from: 'valid', to: 'error', label: 'No' },
      ],
      groups: [{ id: 'g1', label: 'Validation', nodes: ['parse', 'valid'] }],
      theme: 'excalidraw',
      direction: 'TB',
    });
    expect(svg).toMatchSnapshot();
  });

  it('read-parse-ok pipeline — clean theme, LR direction', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'read', label: 'Read File', type: 'io' },
        { id: 'parse', label: 'Parse', type: 'process' },
        { id: 'ok', label: 'OK?', type: 'decision' },
        { id: 'save', label: 'Save', type: 'process' },
        { id: 'retry', label: 'Retry', type: 'terminal' },
      ],
      edges: [
        { from: 'read', to: 'parse' },
        { from: 'parse', to: 'ok' },
        { from: 'ok', to: 'save', label: 'Yes' },
        { from: 'ok', to: 'retry', label: 'No' },
      ],
      theme: 'clean',
      direction: 'LR',
    });
    expect(svg).toMatchSnapshot();
  });

  it('hermes agent architecture — excalidraw theme, LR direction, 4 groups', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'user_req', label: 'User Request', type: 'terminal' },
        { id: 'ctx_load', label: 'Load Context', type: 'process' },
        { id: 'orchestrator', label: 'Orchestrator', type: 'process' },
        { id: 'planner', label: 'Task Planner', type: 'process' },
        { id: 'dispatch', label: 'Route Task?', type: 'decision' },
        { id: 'tool_select', label: 'Select Tool', type: 'process' },
        { id: 'web_search', label: 'Web Search', type: 'io' },
        { id: 'code_exec', label: 'Code Exec', type: 'io' },
        { id: 'memory_store', label: 'Memory', type: 'io' },
        { id: 'synthesize', label: 'Synthesize', type: 'process' },
        { id: 'final_out', label: 'Response', type: 'terminal' },
      ],
      edges: [
        { from: 'user_req', to: 'ctx_load' },
        { from: 'ctx_load', to: 'orchestrator' },
        { from: 'orchestrator', to: 'planner' },
        { from: 'planner', to: 'dispatch' },
        { from: 'dispatch', to: 'tool_select', label: 'tools' },
        { from: 'dispatch', to: 'synthesize', label: 'direct' },
        { from: 'tool_select', to: 'web_search' },
        { from: 'tool_select', to: 'code_exec' },
        { from: 'tool_select', to: 'memory_store' },
        { from: 'web_search', to: 'synthesize' },
        { from: 'code_exec', to: 'synthesize' },
        { from: 'memory_store', to: 'synthesize' },
        { from: 'synthesize', to: 'final_out' },
      ],
      groups: [
        { id: 'g_input', label: 'Input', nodes: ['user_req', 'ctx_load'] },
        { id: 'g_core', label: 'Hermes Core', nodes: ['orchestrator', 'planner', 'dispatch'] },
        { id: 'g_tools', label: 'Tool Execution', nodes: ['tool_select', 'web_search', 'code_exec', 'memory_store'] },
        { id: 'g_output', label: 'Output', nodes: ['synthesize', 'final_out'] },
      ],
      theme: 'excalidraw',
      direction: 'LR',
    });
    expect(svg).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// Unit tests — verify structural and semantic properties of the output.
// ---------------------------------------------------------------------------

describe('createFlowChart', () => {
  it('returns a valid SVG string', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'start', label: 'Start', type: 'terminal' },
        { id: 'end', label: 'End', type: 'terminal' },
      ],
      edges: [{ from: 'start', to: 'end' }],
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('renders all four node types', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'a', label: 'Process', type: 'process' },
        { id: 'b', label: 'Decision', type: 'decision' },
        { id: 'c', label: 'Terminal', type: 'terminal' },
        { id: 'd', label: 'IO', type: 'io' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c', label: 'Yes' },
        { from: 'b', to: 'd', label: 'No' },
      ],
    });

    expect(svg).toContain('node-process');
    expect(svg).toContain('node-decision');
    expect(svg).toContain('node-terminal');
    expect(svg).toContain('node-io');
    expect(svg).toContain('Yes');
    expect(svg).toContain('No');
  });

  it('renders groups with label', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      groups: [{ id: 'g1', label: 'Validation Group', nodes: ['a', 'b'] }],
    });

    expect(svg).toContain('Validation Group');
    expect(svg).toContain('class="group"');
  });

  it('supports the clean theme', () => {
    const svg = createFlowChart({
      nodes: [{ id: 'x', label: 'Node X', type: 'process' }],
      edges: [],
      theme: 'clean',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('Node X');
  });

  it('supports LR direction', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ],
      direction: 'LR',
    });

    expect(svg).toContain('<svg');
  });

  it('handles empty nodes array gracefully', () => {
    const svg = createFlowChart({ nodes: [], edges: [] });
    expect(svg).toContain('<svg');
  });

  it('renders the full example from the README', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'start', label: 'Start', type: 'terminal' },
        { id: 'process1', label: 'Process Data', type: 'process' },
        { id: 'decision', label: 'Is Valid?', type: 'decision' },
        { id: 'end_yes', label: 'Success', type: 'terminal' },
        { id: 'end_no', label: 'Failure', type: 'terminal' },
      ],
      edges: [
        { from: 'start', to: 'process1' },
        { from: 'process1', to: 'decision' },
        { from: 'decision', to: 'end_yes', label: 'Yes' },
        { from: 'decision', to: 'end_no', label: 'No' },
      ],
      groups: [
        { id: 'g1', label: 'Validation', nodes: ['process1', 'decision'] },
      ],
      theme: 'excalidraw',
      direction: 'TB',
    });

    expect(svg).toContain('Start');
    expect(svg).toContain('Process Data');
    expect(svg).toContain('Is Valid?');
    expect(svg).toContain('Success');
    expect(svg).toContain('Failure');
    expect(svg).toContain('Validation');
  });

  it('escapes special XML characters in labels', () => {
    const svg = createFlowChart({
      nodes: [{ id: 'a', label: 'A & B <test>' }],
      edges: [],
    });

    expect(svg).toContain('&amp;');
    expect(svg).toContain('&lt;');
  });

  it('unknown theme falls back to excalidraw without crashing', () => {
    const svg = createFlowChart({
      nodes: [{ id: 'a', label: 'A', type: 'process' }],
      edges: [],
      theme: 'nonexistent' as any,
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('A');
  });

  it('unknown node type falls back to process dimensions', () => {
    const svg = createFlowChart({
      nodes: [{ id: 'a', label: 'Custom', type: 'custom' as any }],
      edges: [],
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('Custom');
  });

  it('throws for an edge referencing a missing node', () => {
    expect(() =>
      createFlowChart({
        nodes: [{ id: 'a', label: 'A' }],
        edges: [{ from: 'a', to: 'missing' }],
      }),
    ).toThrow(/unknown node/i);
  });

  it('renders multigraph edges (two edges between the same pair of nodes)', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'a', label: 'A', type: 'process' },
        { id: 'b', label: 'B', type: 'process' },
      ],
      edges: [
        { from: 'a', to: 'b', label: 'first' },
        { from: 'a', to: 'b', label: 'second' },
      ],
    });

    expect(svg).toContain('first');
    expect(svg).toContain('second');
  });

  it('includes dashed-stroke flow animation in SVG defs', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
    });

    expect(svg).toContain('stroke-dasharray');
    expect(svg).toContain('ai-fc-flow');
  });

  it('renders edge labels with background rect', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'a', label: 'A', type: 'decision' },
        { id: 'b', label: 'B', type: 'terminal' },
        { id: 'c', label: 'C', type: 'terminal' },
      ],
      edges: [
        { from: 'a', to: 'b', label: 'Yes' },
        { from: 'a', to: 'c', label: 'No' },
      ],
    });

    expect(svg).toContain('Yes');
    expect(svg).toContain('No');
    expect(svg).toContain('<rect');
  });

  it('groups render dashed borders', () => {
    const svg = createFlowChart({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
      groups: [{ id: 'g', label: 'Grp', nodes: ['a', 'b'] }],
    });

    expect(svg).toContain('stroke-dasharray');
    expect(svg).toContain('Grp');
  });
});
