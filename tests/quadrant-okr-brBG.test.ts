import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('quadrant chart — OKR initiatives: strategic value vs effort, brBG palette', () => {
  const svg = fig({
    figure: 'quadrant',
    xAxis: { label: '投入成本', min: '低', max: '高' },
    yAxis: { label: '战略价值', min: '低', max: '高' },
    quadrants: ['优先投入', '战略规划', '酌情考虑', '暂缓执行'],
    points: [
      { id: 'o1', label: '品牌升级',     x: 0.55, y: 0.90 },
      { id: 'o2', label: '用户增长',     x: 0.40, y: 0.85 },
      { id: 'o3', label: '国际化',       x: 0.78, y: 0.80 },
      { id: 'o4', label: '数据中台',     x: 0.82, y: 0.65 },
      { id: 'o5', label: '社区运营',     x: 0.22, y: 0.70 },
      { id: 'o6', label: '活动运营',     x: 0.35, y: 0.42 },
      { id: 'o7', label: '内容生产',     x: 0.18, y: 0.28 },
      { id: 'o8', label: '广告投放',     x: 0.65, y: 0.30 },
    ],
    palette: 'brBG',
  });
  matchSvgSnapshot('quadrant-okr-brBG', svg);
});
