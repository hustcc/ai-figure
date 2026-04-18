import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('RAG (retrieval-augmented generation) pipeline — schemePastel1 palette, TB direction, 3 groups', () => {
  const svg = fig({
    figure: 'flow',
    nodes: [
      { id: 'query', label: 'User Query', type: 'io' },
      { id: 'embed_q', label: 'Embed Query', type: 'process' },
      { id: 'vector_search', label: 'Vector Search', type: 'process' },
      { id: 'top_k', label: 'Top-K Chunks', type: 'process' },
      { id: 'rerank', label: 'Rerank', type: 'process' },
      { id: 'context', label: 'Build Context', type: 'process' },
      { id: 'prompt', label: 'Compose Prompt', type: 'process' },
      { id: 'llm', label: 'LLM Inference', type: 'process' },
      { id: 'answer', label: 'Answer', type: 'io' },
    ],
    edges: [
      { from: 'query', to: 'embed_q' },
      { from: 'embed_q', to: 'vector_search' },
      { from: 'vector_search', to: 'top_k' },
      { from: 'top_k', to: 'rerank' },
      { from: 'rerank', to: 'context' },
      { from: 'context', to: 'prompt' },
      { from: 'prompt', to: 'llm' },
      { from: 'llm', to: 'answer' },
    ],
    groups: [
      { id: 'retrieval', label: 'Retrieval', nodes: ['embed_q', 'vector_search', 'top_k', 'rerank'] },
      { id: 'generation', label: 'Generation', nodes: ['context', 'prompt', 'llm'] },
    ],
    palette: 'schemePastel1',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-rag-pipeline-schemePastel1', svg);
});
