import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('mindmap — knowledge graph, figma palette', () => {
  const svg = fig({
    figure: 'mindmap',
    title: 'Knowledge Map',
    palette: 'figma',
    nodes: [
      { id: 'root', label: 'Knowledge Base' },
      { id: 'docs', label: 'Docs', parent: 'root', side: 'left' },
      { id: 'runbooks', label: 'Runbooks', parent: 'root', side: 'left' },
      { id: 'apis', label: 'API Guides', parent: 'docs' },
      { id: 'playbooks', label: 'Playbooks', parent: 'runbooks' },
      { id: 'tutorials', label: 'Tutorials', parent: 'docs' },
      { id: 'faq', label: 'FAQ', parent: 'runbooks' },
      { id: 'tools', label: 'Internal Tools', parent: 'root', side: 'right' },
      { id: 'ci', label: 'CI/CD', parent: 'tools' },
      { id: 'ops', label: 'Ops', parent: 'tools' },
    ],
  });
  matchSvgSnapshot('mindmap-knowledge-figma', svg);
});
