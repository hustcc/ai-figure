import { it } from 'vitest';
import { createTreeDiagram } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('tree diagram — knowledge domain taxonomy, excalidraw theme, TB direction', () => {
  const svg = createTreeDiagram({
    nodes: [
      { id: 'ai',      label: 'AI' },
      { id: 'ml',      label: 'Machine Learning',   parent: 'ai' },
      { id: 'nlp',     label: 'NLP',                parent: 'ai' },
      { id: 'cv',      label: 'Computer Vision',    parent: 'ai' },
      { id: 'sup',     label: 'Supervised',         parent: 'ml' },
      { id: 'unsup',   label: 'Unsupervised',       parent: 'ml' },
      { id: 'rl',      label: 'Reinforcement',      parent: 'ml' },
      { id: 'llm',     label: 'LLM',                parent: 'nlp' },
      { id: 'detect',  label: 'Detection',          parent: 'cv' },
      { id: 'segment', label: 'Segmentation',       parent: 'cv' },
    ],
    theme: 'excalidraw',
    direction: 'TB',
  });
  matchSvgSnapshot('tree-knowledge', svg);
});
