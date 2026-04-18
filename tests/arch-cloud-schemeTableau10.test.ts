import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('arch diagram — cloud architecture, schemeTableau10 palette, LR direction', () => {
  const svg = fig({
    figure: 'arch',
    layers: [
      {
        id: 'client', label: 'Client',
        nodes: [
          { id: 'web',     label: 'Web App' },
          { id: 'mobile',  label: 'Mobile App' },
        ],
      },
      {
        id: 'edge', label: 'Edge',
        nodes: [
          { id: 'cdn',     label: 'CDN' },
          { id: 'gateway', label: 'API Gateway' },
          { id: 'waf',     label: 'WAF' },
        ],
      },
      {
        id: 'service', label: 'Services',
        nodes: [
          { id: 'auth',    label: 'Auth' },
          { id: 'order',   label: 'Order' },
          { id: 'notify',  label: 'Notify' },
        ],
      },
      {
        id: 'data', label: 'Data',
        nodes: [
          { id: 'pg',      label: 'PostgreSQL' },
          { id: 'redis',   label: 'Redis' },
          { id: 's3',      label: 'S3' },
        ],
      },
    ],
    palette: 'schemeTableau10',
    direction: 'LR',
    width: 600,
  });
  matchSvgSnapshot('arch-cloud-schemeTableau10', svg);
});
