import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('Venn diagram — market analysis (3-set), antv palette', () => {
  const svg = fig({
    figure: 'venn',
    title: 'Market Analysis',
    subtitle: 'Where technology, regulation and capital align',
    sets: [
      { id: 'tech',  label: 'Technology',  sublabel: 'innovation edge' },
      { id: 'reg',   label: 'Regulation',  sublabel: 'compliance ready' },
      { id: 'cap',   label: 'Capital',     sublabel: 'funded segment' },
    ],
    intersections: [
      { sets: ['tech',  'reg'],        label: 'GovTech'     },
      { sets: ['reg',   'cap'],        label: 'FinReg'      },
      { sets: ['tech',  'cap'],        label: 'VC-Backed'   },
      { sets: ['tech',  'reg', 'cap'], label: 'Sweet Spot', accent: true },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('venn-market-analysis-antv', svg);
});
