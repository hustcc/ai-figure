import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('tree diagram — package dependency tree, clean theme, LR direction', () => {
  const svg = fig({
    figure: 'tree',
    nodes: [
      { id: 'app',       label: 'my-app' },
      { id: 'react',     label: 'react',           parent: 'app' },
      { id: 'router',    label: 'react-router',     parent: 'app' },
      { id: 'query',     label: 'react-query',      parent: 'app' },
      { id: 'scheduler', label: 'scheduler',        parent: 'react' },
      { id: 'jsxrt',     label: 'react-jsx-runtime', parent: 'react' },
      { id: 'history',   label: 'history',          parent: 'router' },
      { id: 'axios',     label: 'axios',            parent: 'query' },
    ],
    theme: 'clean',
    direction: 'LR',
  });
  matchSvgSnapshot('tree-deps', svg);
});
