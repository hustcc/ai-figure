import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('network diagram — three kingdoms characters, default palette', () => {
  const svg = fig({
    figure: 'network',
    title: '三国人物关系',
    subtitle: '魏蜀吴主要人物',
    nodes: [
      { id: 'caocao',    label: '曹操',   group: '魏', weight: 3 },
      { id: 'caopi',     label: '曹丕',   group: '魏' },
      { id: 'liubei',    label: '刘备',   group: '蜀', weight: 3 },
      { id: 'zhuge',     label: '诸葛亮', group: '蜀', weight: 2 },
      { id: 'guanyu',    label: '关羽',   group: '蜀' },
      { id: 'sunquan',   label: '孙权',   group: '吴', weight: 2 },
      { id: 'zhouyu',    label: '周瑜',   group: '吴' },
    ],
    edges: [
      { from: 'caocao',  to: 'caopi',   label: '父子' },
      { from: 'liubei',  to: 'zhuge',   label: '君臣' },
      { from: 'liubei',  to: 'guanyu',  label: '义兄弟' },
      { from: 'caocao',  to: 'liubei',  label: '敌对' },
      { from: 'liubei',  to: 'sunquan', label: '盟友' },
      { from: 'sunquan', to: 'zhouyu',  label: '君臣' },
      { from: 'caocao',  to: 'sunquan', label: '敌对' },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('network-characters-default', svg);
});
