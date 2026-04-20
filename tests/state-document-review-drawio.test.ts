import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('state machine — document review workflow, drawio palette', () => {
  const svg = fig({
    figure: 'state',
    title: 'Document Review',
    subtitle: 'Approval lifecycle for technical specs',
    nodes: [
      { id: 'start',    label: '',        type: 'start' },
      { id: 'draft',    label: 'Draft',   type: 'state' },
      { id: 'review',   label: 'In Review', type: 'state' },
      { id: 'approved', label: 'Approved',  type: 'state', accent: true },
      { id: 'rejected', label: 'Rejected',  type: 'state' },
      { id: 'done',     label: '',          type: 'end' },
    ],
    transitions: [
      { from: 'start',    to: 'draft' },
      { from: 'draft',    to: 'review',   label: 'submit' },
      { from: 'review',   to: 'approved', label: 'approve' },
      { from: 'review',   to: 'rejected', label: 'reject' },
      { from: 'rejected', to: 'draft',    label: 'revise' },
      { from: 'approved', to: 'done' },
    ],
    palette: 'drawio',
  });
  matchSvgSnapshot('state-document-review-drawio', svg);
});
