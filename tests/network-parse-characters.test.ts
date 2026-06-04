import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('network diagram — markdown parse, characters', () => {
  const svg = fig(`
figure network
title: 三国人物关系
section 魏
曹操[曹操]: 3
曹丕[曹丕]
section 蜀
刘备[刘备]: 3
诸葛亮[诸葛亮]: 2
关羽[关羽]
section 吴
孙权[孙权]: 2
曹操 --> 曹丕: 父子
刘备 --> 诸葛亮: 君臣
刘备 --> 关羽: 义兄弟
曹操 --> 刘备: 敌对
刘备 --> 孙权: 盟友
`);
  matchSvgSnapshot('network-parse-characters', svg);
});
