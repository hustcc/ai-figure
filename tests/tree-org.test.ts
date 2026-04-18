import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('tree diagram — org chart, minimal theme, TB direction', () => {
  const svg = fig({
    figure: 'tree',
    nodes: [
      { id: 'ceo',     label: 'CEO' },
      { id: 'cto',     label: 'CTO',         parent: 'ceo' },
      { id: 'coo',     label: 'COO',         parent: 'ceo' },
      { id: 'fe_lead', label: 'FE Lead',     parent: 'cto' },
      { id: 'be_lead', label: 'BE Lead',     parent: 'cto' },
      { id: 'ops',     label: 'Operations',  parent: 'coo' },
      { id: 'hr',      label: 'HR',          parent: 'coo' },
    ],
    palette: 'minimal',
    direction: 'TB',
  });
  matchSvgSnapshot('tree-org', svg);
});
