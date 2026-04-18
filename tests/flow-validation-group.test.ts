import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

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
  matchSvgSnapshot('flow-validation-group', svg);
});
