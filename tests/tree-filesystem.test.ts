import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('tree diagram — file system tree, colorful theme, LR direction', () => {
  const svg = fig({
    figure: 'tree',
    nodes: [
      { id: 'root',     label: 'src' },
      { id: 'comps',    label: 'components',  parent: 'root' },
      { id: 'pages',    label: 'pages',        parent: 'root' },
      { id: 'utils',    label: 'utils',        parent: 'root' },
      { id: 'button',   label: 'Button.tsx',   parent: 'comps' },
      { id: 'input',    label: 'Input.tsx',    parent: 'comps' },
      { id: 'modal',    label: 'Modal.tsx',    parent: 'comps' },
      { id: 'home',     label: 'Home.tsx',     parent: 'pages' },
      { id: 'settings', label: 'Settings.tsx', parent: 'pages' },
      { id: 'format',   label: 'format.ts',    parent: 'utils' },
      { id: 'http',     label: 'http.ts',      parent: 'utils' },
    ],
    theme: 'colorful',
    direction: 'LR',
  });
  matchSvgSnapshot('tree-filesystem', svg);
});
