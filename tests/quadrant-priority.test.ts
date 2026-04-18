import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('quadrant chart — product feature priority, excalidraw theme', () => {
  const svg = fig({
    figure: 'quadrant',
    xAxis: { label: '实现难度', min: '低', max: '高' },
    yAxis: { label: '业务价值', min: '低', max: '高' },
    quadrants: ['立即做', '计划做', '搁置', '外包'],
    points: [
      { id: 'a', label: '登录优化',   x: 0.15, y: 0.90 },
      { id: 'b', label: '推荐系统',   x: 0.78, y: 0.82 },
      { id: 'c', label: '暗黑模式',   x: 0.30, y: 0.20 },
      { id: 'd', label: 'A/B 测试',   x: 0.65, y: 0.55 },
      { id: 'e', label: '性能优化',   x: 0.50, y: 0.75 },
      { id: 'f', label: '多语言支持', x: 0.70, y: 0.35 },
      { id: 'g', label: '埋点系统',   x: 0.40, y: 0.60 },
      { id: 'h', label: '离线模式',   x: 0.85, y: 0.18 },
    ],
    theme: 'excalidraw',
    width: 600,
    height: 600,
  });
  matchSvgSnapshot('quadrant-priority', svg);
});
