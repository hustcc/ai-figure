import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('timeline diagram — web technology evolution, drawio palette', () => {
  const svg = fig({
    figure: 'timeline',
    title: 'Web Tech Evolution',
    subtitle: 'From static HTML to modern AI-driven apps',
    events: [
      { id: 'html',  label: 'HTML / HTTP',     date: '1991-08-06', milestone: true },
      { id: 'css',   label: 'CSS Stylesheets', date: '1996-12-17' },
      { id: 'ajax',  label: 'AJAX Era',        date: '2005-02-18', milestone: true },
      { id: 'node',  label: 'Node.js',         date: '2009-05-27' },
      { id: 'react', label: 'React Released',  date: '2013-05-29', milestone: true },
      { id: 'llm',   label: 'LLM Boom',        date: '2022-11-30', milestone: true },
    ],
    palette: 'drawio',
  });
  matchSvgSnapshot('timeline-web-tech-evolution-drawio', svg);
});
