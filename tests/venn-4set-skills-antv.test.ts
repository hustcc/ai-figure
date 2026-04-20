import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('Venn diagram — 4-set developer skills quadrant, antv palette', () => {
  const svg = fig({
    figure: 'venn',
    title: 'Developer Skill Map',
    subtitle: 'Cross-discipline competency overlap',
    sets: [
      { id: 'fe',   label: 'Frontend',  sublabel: 'UI / UX' },
      { id: 'be',   label: 'Backend',   sublabel: 'APIs / DBs' },
      { id: 'data', label: 'Data',      sublabel: 'ML / Analytics' },
      { id: 'ops',  label: 'DevOps',    sublabel: 'Infra / CI' },
    ],
    intersections: [
      { sets: ['fe',   'be'],   label: 'Fullstack'  },
      { sets: ['be',   'data'], label: 'Data Eng'   },
      { sets: ['data', 'ops'],  label: 'MLOps'      },
      { sets: ['fe',   'ops'],  label: 'FE Ops'     },
      { sets: ['fe',   'be',  'data', 'ops'], label: '10x Dev', accent: true },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('venn-4set-skills-antv', svg);
});
