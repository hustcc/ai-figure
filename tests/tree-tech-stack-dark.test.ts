import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('tree diagram — tech stack taxonomy, default palette, dark theme, LR direction', () => {
  const svg = fig({
    figure: 'tree',
    title: 'Frontend Tech Stack',
    nodes: [
      { id: 'root',      label: 'Frontend' },
      { id: 'lang',      label: 'Languages',   parent: 'root' },
      { id: 'ts',        label: 'TypeScript',  parent: 'lang' },
      { id: 'js',        label: 'JavaScript',  parent: 'lang' },
      { id: 'css',       label: 'CSS / SCSS',  parent: 'lang' },
      { id: 'fw',        label: 'Frameworks',  parent: 'root' },
      { id: 'react',     label: 'React',       parent: 'fw' },
      { id: 'vue',       label: 'Vue',         parent: 'fw' },
      { id: 'svelte',    label: 'Svelte',      parent: 'fw' },
      { id: 'tools',     label: 'Tooling',     parent: 'root' },
      { id: 'vite',      label: 'Vite',        parent: 'tools' },
      { id: 'vitest',    label: 'Vitest',      parent: 'tools' },
      { id: 'eslint',    label: 'ESLint',      parent: 'tools' },
    ],
    theme: 'dark',
    palette: 'default',
    direction: 'LR',
  });
  matchSvgSnapshot('tree-tech-stack-dark', svg);
});
