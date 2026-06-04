import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('network diagram — knowledge graph, mono-purple palette', () => {
  const svg = fig({
    figure: 'network',
    title: 'Machine Learning Concepts',
    subtitle: 'Key relationships',
    nodes: [
      { id: 'ml',       label: 'Machine Learning', group: 'Core',        weight: 4 },
      { id: 'dl',       label: 'Deep Learning',    group: 'Core',        weight: 3 },
      { id: 'nn',       label: 'Neural Net',        group: 'Model',       weight: 2 },
      { id: 'cnn',      label: 'CNN',               group: 'Model' },
      { id: 'rnn',      label: 'RNN',               group: 'Model' },
      { id: 'nlp',      label: 'NLP',               group: 'Application', weight: 2 },
      { id: 'cv',       label: 'Computer Vision',  group: 'Application', weight: 2 },
      { id: 'data',     label: 'Data',              group: 'Core',        weight: 3 },
    ],
    edges: [
      { from: 'ml',   to: 'dl',   label: 'subset' },
      { from: 'dl',   to: 'nn',   label: 'uses' },
      { from: 'nn',   to: 'cnn' },
      { from: 'nn',   to: 'rnn' },
      { from: 'cnn',  to: 'cv',  label: 'powers' },
      { from: 'rnn',  to: 'nlp', label: 'powers' },
      { from: 'data', to: 'ml',  label: 'feeds' },
    ],
    palette: 'mono-purple',
  });
  matchSvgSnapshot('network-knowledge-mono-purple', svg);
});
