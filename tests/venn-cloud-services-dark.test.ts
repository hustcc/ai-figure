import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('Venn diagram — cloud provider services (2-set), dark theme', () => {
  const svg = fig({
    figure: 'venn',
    title: 'Cloud Services',
    subtitle: 'AWS vs GCP common capabilities',
    theme: 'dark',
    sets: [
      { id: 'aws',  label: 'AWS',  sublabel: 'Amazon Web Services' },
      { id: 'gcp',  label: 'GCP',  sublabel: 'Google Cloud' },
    ],
    intersections: [
      { sets: ['aws', 'gcp'], label: 'Multi-Cloud', accent: true },
    ],
    palette: 'mono-purple',
  });
  matchSvgSnapshot('venn-cloud-services-dark', svg);
});
