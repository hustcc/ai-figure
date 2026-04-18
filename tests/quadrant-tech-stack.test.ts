import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('quadrant chart — tech stack adoption: effort vs value, minimal theme', () => {
  const svg = fig({
    figure: 'quadrant',
    xAxis: { label: 'Adoption Effort', min: 'Low', max: 'High' },
    yAxis: { label: 'Team Value',      min: 'Low', max: 'High' },
    quadrants: ['Quick Win', 'Strategic', 'Low Priority', 'Avoid'],
    points: [
      { id: 'ts',     label: 'TypeScript',  x: 0.25, y: 0.92 },
      { id: 'vitest', label: 'Vitest',      x: 0.18, y: 0.80 },
      { id: 'gql',    label: 'GraphQL',     x: 0.60, y: 0.75 },
      { id: 'k8s',    label: 'Kubernetes',  x: 0.88, y: 0.85 },
      { id: 'remix',  label: 'Remix',       x: 0.72, y: 0.58 },
      { id: 'rust',   label: 'Rust',        x: 0.92, y: 0.30 },
      { id: 'jquery', label: 'jQuery',      x: 0.12, y: 0.22 },
      { id: 'svelte', label: 'Svelte',      x: 0.45, y: 0.65 },
    ],
    palette: 'minimal',
  });
  matchSvgSnapshot('quadrant-tech-stack', svg);
});
