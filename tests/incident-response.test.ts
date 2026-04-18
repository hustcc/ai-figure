import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('incident response runbook — clean theme, TB direction', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'alert', label: 'Alert Triggered', type: 'terminal' },
      { id: 'triage', label: 'Triage Severity', type: 'process' },
      { id: 'sev', label: 'Severity?', type: 'decision' },
      { id: 'page', label: 'Page On-call', type: 'io' },
      { id: 'slack', label: 'Post to #incidents', type: 'io' },
      { id: 'investigate', label: 'Investigate', type: 'process' },
      { id: 'root_cause', label: 'Root Cause Found?', type: 'decision' },
      { id: 'escalate', label: 'Escalate', type: 'process' },
      { id: 'fix', label: 'Apply Fix', type: 'process' },
      { id: 'verify', label: 'Verify Resolution', type: 'process' },
      { id: 'resolved', label: 'Incident Resolved', type: 'terminal' },
      { id: 'postmortem', label: 'Write Post-mortem', type: 'process' },
    ],
    edges: [
      { from: 'alert', to: 'triage' },
      { from: 'triage', to: 'sev' },
      { from: 'sev', to: 'page', label: 'P1/P2' },
      { from: 'sev', to: 'slack', label: 'P3' },
      { from: 'page', to: 'investigate' },
      { from: 'slack', to: 'investigate' },
      { from: 'investigate', to: 'root_cause' },
      { from: 'root_cause', to: 'fix', label: 'Yes' },
      { from: 'root_cause', to: 'escalate', label: 'No' },
      { from: 'escalate', to: 'investigate' },
      { from: 'fix', to: 'verify' },
      { from: 'verify', to: 'resolved' },
      { from: 'resolved', to: 'postmortem' },
    ],
    theme: 'clean',
    direction: 'TB',
  });
  matchSvgSnapshot('incident-response', svg);
});
