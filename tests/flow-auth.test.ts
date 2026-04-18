import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('user authentication flow — excalidraw theme, TB direction', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'start', label: 'User Login', type: 'terminal' },
      { id: 'input', label: 'Enter Credentials', type: 'io' },
      { id: 'check_user', label: 'User Exists?', type: 'decision' },
      { id: 'verify_pwd', label: 'Verify Password', type: 'process' },
      { id: 'pwd_ok', label: 'Password OK?', type: 'decision' },
      { id: 'mfa_enabled', label: 'MFA Enabled?', type: 'decision' },
      { id: 'mfa', label: 'MFA Challenge', type: 'io' },
      { id: 'mfa_ok', label: 'MFA Valid?', type: 'decision' },
      { id: 'session', label: 'Create Session', type: 'process' },
      { id: 'deny', label: 'Access Denied', type: 'terminal' },
      { id: 'dashboard', label: 'Dashboard', type: 'terminal' },
    ],
    edges: [
      { from: 'start', to: 'input' },
      { from: 'input', to: 'check_user' },
      { from: 'check_user', to: 'verify_pwd', label: 'Yes' },
      { from: 'check_user', to: 'deny', label: 'No' },
      { from: 'verify_pwd', to: 'pwd_ok' },
      { from: 'pwd_ok', to: 'mfa_enabled', label: 'OK' },
      { from: 'pwd_ok', to: 'deny', label: 'Fail' },
      { from: 'mfa_enabled', to: 'mfa', label: 'Yes' },
      { from: 'mfa_enabled', to: 'session', label: 'No' },
      { from: 'mfa', to: 'mfa_ok' },
      { from: 'mfa_ok', to: 'session', label: 'Pass' },
      { from: 'mfa_ok', to: 'deny', label: 'Fail' },
      { from: 'session', to: 'dashboard' },
    ],
    theme: 'excalidraw',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-auth', svg);
});
