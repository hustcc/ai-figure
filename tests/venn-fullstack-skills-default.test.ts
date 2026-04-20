import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('Venn diagram — frontend vs backend skills, default palette', () => {
  const svg = fig({
    figure: 'venn',
    title: 'Full-Stack Skills',
    subtitle: '2-set overlap of frontend and backend competencies',
    sets: [
      { id: 'frontend', label: 'Frontend', sublabel: 'UI & UX' },
      { id: 'backend',  label: 'Backend',  sublabel: 'APIs & DBs' },
    ],
    intersections: [
      { sets: ['frontend', 'backend'], label: 'Full-Stack', accent: true },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('venn-fullstack-skills-default', svg);
});
