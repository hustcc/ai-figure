import { it } from 'vitest';
import { createArchDiagram } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('arch diagram — tech stack, excalidraw theme, TB direction', () => {
  const svg = createArchDiagram({
    layers: [
      {
        id: 'fe', label: 'Frontend',
        nodes: [
          { id: 'react',   label: 'React' },
          { id: 'vue',     label: 'Vue' },
          { id: 'angular', label: 'Angular' },
        ],
      },
      {
        id: 'be', label: 'Backend',
        nodes: [
          { id: 'node',   label: 'Node.js' },
          { id: 'go',     label: 'Go' },
          { id: 'python', label: 'Python' },
        ],
      },
      {
        id: 'data', label: 'Data',
        nodes: [
          { id: 'mysql', label: 'MySQL' },
          { id: 'redis', label: 'Redis' },
          { id: 's3',    label: 'S3' },
        ],
      },
    ],
    theme: 'excalidraw',
    direction: 'TB',
    width: 800,
  });
  matchSvgSnapshot('arch-stack', svg);
});
