import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('read-parse-ok pipeline — minimal theme, LR direction', () => {
  const svg = fig({
    figure: 'flow',
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
    palette: 'minimal',
    direction: 'LR',
  });
  matchSvgSnapshot('flow-clean-lr', svg);
});
