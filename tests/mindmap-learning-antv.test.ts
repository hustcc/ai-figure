import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('mindmap — learning roadmap, antv palette', () => {
  const svg = fig({
    figure: 'mindmap',
    title: 'Learning Roadmap',
    palette: 'antv',
    nodes: [
      { id: 'root', label: 'Learning Plan' },
      { id: 'frontend', label: 'Frontend', parent: 'root' },
      { id: 'backend', label: 'Backend', parent: 'root' },
      { id: 'architecture', label: 'Architecture', parent: 'root' },
      { id: 'react', label: 'React', parent: 'frontend' },
      { id: 'ts', label: 'TypeScript', parent: 'frontend' },
      { id: 'testing', label: 'Testing', parent: 'frontend' },
      { id: 'rtl', label: 'RTL', parent: 'testing' },
      { id: 'node', label: 'Node.js', parent: 'backend' },
      { id: 'db', label: 'Databases', parent: 'backend' },
      { id: 'queues', label: 'Queues', parent: 'backend' },
      { id: 'ddd', label: 'DDD', parent: 'architecture' },
      { id: 'eventing', label: 'Eventing', parent: 'architecture' },
    ],
  });
  matchSvgSnapshot('mindmap-learning-antv', svg);
});
