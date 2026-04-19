import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('nested diagram — trust zones, default palette', () => {
  const svg = fig({
    figure: 'nested',
    title: 'Trust Zones',
    rings: [
      { label: 'Internet',  sublabel: 'untrusted network' },
      { label: 'VPC',       sublabel: 'cloud boundary'    },
      { label: 'Subnet',    sublabel: 'private zone'      },
      { label: 'Service',   sublabel: 'critical path', accent: true },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('nested-trust-zones-default', svg);
});
