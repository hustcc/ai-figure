import { it } from 'vitest';
import { createTreeDiagram } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('tree diagram — org chart, clean theme, TB direction', () => {
  const svg = createTreeDiagram({
    nodes: [
      { id: 'ceo',     label: 'CEO' },
      { id: 'cto',     label: 'CTO',         parent: 'ceo' },
      { id: 'coo',     label: 'COO',         parent: 'ceo' },
      { id: 'fe_lead', label: 'FE Lead',     parent: 'cto' },
      { id: 'be_lead', label: 'BE Lead',     parent: 'cto' },
      { id: 'ops',     label: 'Operations',  parent: 'coo' },
      { id: 'hr',      label: 'HR',          parent: 'coo' },
    ],
    theme: 'clean',
    direction: 'TB',
  });
  matchSvgSnapshot('tree-org', svg);
});
