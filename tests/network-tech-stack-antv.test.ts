import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('network diagram — tech stack dependencies, antv palette', () => {
  const svg = fig({
    figure: 'network',
    title: 'Frontend Tech Stack',
    nodes: [
      { id: 'react',      label: 'React',      group: 'UI',      weight: 4 },
      { id: 'nextjs',     label: 'Next.js',    group: 'UI',      weight: 3 },
      { id: 'typescript', label: 'TypeScript', group: 'Core',    weight: 3 },
      { id: 'vite',       label: 'Vite',       group: 'Tooling', weight: 2 },
      { id: 'tailwind',   label: 'Tailwind',   group: 'UI' },
      { id: 'zustand',    label: 'Zustand',    group: 'State' },
      { id: 'vitest',     label: 'Vitest',     group: 'Tooling' },
    ],
    edges: [
      { from: 'nextjs',     to: 'react' },
      { from: 'react',      to: 'typescript' },
      { from: 'nextjs',     to: 'typescript' },
      { from: 'vite',       to: 'typescript' },
      { from: 'zustand',    to: 'react' },
      { from: 'tailwind',   to: 'react' },
      { from: 'vitest',     to: 'vite' },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('network-tech-stack-antv', svg);
});
