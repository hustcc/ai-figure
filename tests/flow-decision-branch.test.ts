import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

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
  matchSvgSnapshot('flow-decision-branch', svg);
});
