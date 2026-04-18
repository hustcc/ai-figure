import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('hermes agent architecture — excalidraw theme, TB direction, 4 groups', () => {
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
    direction: 'TB',
  });
  matchSvgSnapshot('hermes-agent', svg);
});
