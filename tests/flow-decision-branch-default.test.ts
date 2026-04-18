import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('decision branch — default palette, TB direction', () => {
  const svg = fig({
    figure: 'flow',
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
    palette: 'default',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-decision-branch-default', svg);
});
