import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

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
  matchSvgSnapshot('clean-lr', svg);
});
