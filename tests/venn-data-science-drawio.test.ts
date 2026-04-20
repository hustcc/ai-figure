import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('Venn diagram — data science skills (3-set), drawio palette', () => {
  const svg = fig({
    figure: 'venn',
    title: 'Data Science Skills',
    subtitle: 'Intersection of math, domain knowledge and coding',
    sets: [
      { id: 'math',   label: 'Math',   sublabel: 'statistics & ML' },
      { id: 'domain', label: 'Domain', sublabel: 'industry expertise' },
      { id: 'code',   label: 'Coding', sublabel: 'software engineering' },
    ],
    intersections: [
      { sets: ['math',   'code'],          label: 'ML Eng'        },
      { sets: ['math',   'domain'],        label: 'Analyst'       },
      { sets: ['domain', 'code'],          label: 'DA'            },
      { sets: ['math',   'domain', 'code'], label: 'Data Scientist', accent: true },
    ],
    palette: 'drawio',
  });
  matchSvgSnapshot('venn-data-science-drawio', svg);
});
