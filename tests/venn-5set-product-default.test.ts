import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('Venn diagram — 5-set product dimensions, default palette', () => {
  const svg = fig({
    figure: 'venn',
    title: 'Product Design Dimensions',
    subtitle: 'Five pillars of great product experience',
    sets: [
      { id: 'use',   label: 'Usability'    },
      { id: 'perf',  label: 'Performance'  },
      { id: 'sec',   label: 'Security'     },
      { id: 'acc',   label: 'Accessibility' },
      { id: 'maint', label: 'Maintainability' },
    ],
    intersections: [
      { sets: ['use',  'perf'],        label: 'Fast UX'       },
      { sets: ['perf', 'sec'],         label: 'Secure Speed'  },
      { sets: ['sec',  'acc'],         label: 'Safe Access'   },
      { sets: ['use',  'acc'],         label: 'Inclusive UX'  },
      { sets: ['use',  'perf', 'sec', 'acc', 'maint'], label: 'Excellence', accent: true },
    ],
  });
  matchSvgSnapshot('venn-5set-product-default', svg);
});
