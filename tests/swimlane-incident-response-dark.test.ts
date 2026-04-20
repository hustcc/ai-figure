import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('swimlane diagram — incident response, dark theme', () => {
  const svg = fig({
    figure: 'swimlane',
    title: 'Incident Response',
    subtitle: 'Alert triage to resolution and postmortem',
    theme: 'dark',
    lanes: ['Monitor', 'On-Call', 'Engineering'],
    nodes: [
      { id: 'alert',    label: 'Alert Fired',      lane: 'Monitor'     },
      { id: 'page',     label: 'Page On-Call',      lane: 'Monitor'     },
      { id: 'ack',      label: 'Acknowledge',       lane: 'On-Call'     },
      { id: 'triage',   label: 'Triage Severity',   lane: 'On-Call'     },
      { id: 'fix',      label: 'Apply Fix',         lane: 'Engineering' },
      { id: 'resolve',  label: 'Mark Resolved',     lane: 'Engineering' },
    ],
    edges: [
      { from: 'alert',   to: 'page' },
      { from: 'page',    to: 'ack' },
      { from: 'ack',     to: 'triage' },
      { from: 'triage',  to: 'fix' },
      { from: 'fix',     to: 'resolve' },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('swimlane-incident-response-dark', svg);
});
