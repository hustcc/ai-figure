import { it } from 'vitest';
import { createTreeDiagram } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('tree diagram — category taxonomy, excalidraw theme, TB direction', () => {
  const svg = createTreeDiagram({
    nodes: [
      { id: 'root',      label: 'Electronics' },
      { id: 'mobile',    label: 'Mobile',       parent: 'root' },
      { id: 'computer',  label: 'Computer',     parent: 'root' },
      { id: 'audio',     label: 'Audio',        parent: 'root' },
      { id: 'phone',     label: 'Phone',        parent: 'mobile' },
      { id: 'tablet',    label: 'Tablet',       parent: 'mobile' },
      { id: 'laptop',    label: 'Laptop',       parent: 'computer' },
      { id: 'desktop',   label: 'Desktop',      parent: 'computer' },
      { id: 'headphone', label: 'Headphone',    parent: 'audio' },
      { id: 'speaker',   label: 'Speaker',      parent: 'audio' },
    ],
    theme: 'excalidraw',
    direction: 'TB',
  });
  matchSvgSnapshot('tree-category', svg);
});
