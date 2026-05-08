import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('timeline diagram — javascript evolution, dense labels', () => {
  const svg = fig({
    figure: 'timeline',
    title: 'JavaScript Evolution',
    events: [
      { id: 'js10', label: 'JavaScript 1.0', date: '1995-12-04', milestone: true },
      { id: 'es5', label: 'ES5 Modern Baseline', date: '2009-12-03', milestone: true },
      { id: 'es6', label: 'ES6 Arrow Fns & Classes', date: '2015-06-17', milestone: true },
      { id: 'es2017', label: 'ES2017 async/await', date: '2017-06-28' },
      { id: 'es2019', label: 'ES2019 Optional Chaining', date: '2019-06-04' },
      { id: 'es2020', label: 'ES2020 Nullish Coalescing', date: '2020-06-16', milestone: true },
      { id: 'es2022', label: 'ES2022 Top-level await', date: '2022-06-22', milestone: true },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('timeline-javascript-evolution-default', svg);
});
