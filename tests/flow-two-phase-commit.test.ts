import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('two-phase commit (2PC) protocol — excalidraw theme, TB direction, 2 groups', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'coord', label: 'Coordinator', type: 'terminal' },
      { id: 'prepare', label: 'Send Prepare', type: 'process' },
      { id: 'p1', label: 'Participant 1', type: 'process' },
      { id: 'p2', label: 'Participant 2', type: 'process' },
      { id: 'vote1', label: 'Vote 1?', type: 'decision' },
      { id: 'vote2', label: 'Vote 2?', type: 'decision' },
      { id: 'all_ok', label: 'All Voted Yes?', type: 'decision' },
      { id: 'commit', label: 'Send Commit', type: 'process' },
      { id: 'rollback', label: 'Send Rollback', type: 'process' },
      { id: 'done', label: 'Transaction Done', type: 'terminal' },
    ],
    edges: [
      { from: 'coord', to: 'prepare' },
      { from: 'prepare', to: 'p1' },
      { from: 'prepare', to: 'p2' },
      { from: 'p1', to: 'vote1' },
      { from: 'p2', to: 'vote2' },
      { from: 'vote1', to: 'all_ok', label: 'Yes' },
      { from: 'vote2', to: 'all_ok', label: 'Yes' },
      { from: 'vote1', to: 'rollback', label: 'No' },
      { from: 'vote2', to: 'rollback', label: 'No' },
      { from: 'all_ok', to: 'commit', label: 'Yes' },
      { from: 'all_ok', to: 'rollback', label: 'No' },
      { from: 'commit', to: 'done' },
      { from: 'rollback', to: 'done' },
    ],
    groups: [
      { id: 'phase1', label: 'Phase 1 — Prepare', nodes: ['prepare', 'p1', 'p2', 'vote1', 'vote2'] },
      { id: 'phase2', label: 'Phase 2 — Commit', nodes: ['all_ok', 'commit', 'rollback'] },
    ],
    theme: 'excalidraw',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-two-phase-commit', svg);
});
