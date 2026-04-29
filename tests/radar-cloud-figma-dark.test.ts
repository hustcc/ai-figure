import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('radar chart — product evaluation, figma palette dark', () => {
  const svg = fig({
    figure: 'radar',
    title: 'Cloud Provider Comparison',
    subtitle: 'AWS vs Azure vs GCP',
    axes: ['Compute', 'Storage', 'Networking', 'ML/AI', 'Pricing', 'Support'],
    series: [
      { label: 'AWS',   values: [95, 90, 88, 85, 65, 80] },
      { label: 'Azure', values: [85, 85, 80, 88, 70, 85] },
      { label: 'GCP',   values: [80, 82, 78, 95, 72, 75] },
    ],
    palette: 'figma',
    theme: 'dark',
  });
  matchSvgSnapshot('radar-cloud-figma-dark', svg);
});
