import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('quadrant chart — content strategy: reach vs conversion rate, colorful theme', () => {
  const svg = fig({
    figure: 'quadrant',
    xAxis: { label: 'Reach',           min: 'Niche',  max: 'Mass' },
    yAxis: { label: 'Conversion Rate', min: 'Low',    max: 'High' },
    quadrants: ['Niche Gold', 'Growth Engine', 'Filler', 'Awareness'],
    points: [
      { id: 'c1', label: 'Case Studies',   x: 0.22, y: 0.88 },
      { id: 'c2', label: 'Webinars',       x: 0.38, y: 0.78 },
      { id: 'c3', label: 'SEO Articles',   x: 0.72, y: 0.65 },
      { id: 'c4', label: 'Social Shorts',  x: 0.85, y: 0.28 },
      { id: 'c5', label: 'Email Drip',     x: 0.30, y: 0.55 },
      { id: 'c6', label: 'Paid Ads',       x: 0.80, y: 0.72 },
      { id: 'c7', label: 'Blog Posts',     x: 0.60, y: 0.38 },
      { id: 'c8', label: 'Infographics',   x: 0.50, y: 0.20 },
    ],
    theme: 'colorful',
  });
  matchSvgSnapshot('quadrant-content', svg);
});
