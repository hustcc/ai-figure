import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('sequence diagram — password reset flow, colorful theme', () => {
  const svg = fig({
    figure: 'sequence',
    actors: ['User', 'Frontend', 'Auth API', 'Email Service', 'Redis'],
    messages: [
      { from: 'User',          to: 'Frontend',      label: 'click Forgot Password' },
      { from: 'Frontend',      to: 'Auth API',       label: 'POST /forgot { email }' },
      { from: 'Auth API',      to: 'Redis',          label: 'SET reset_token TTL=15m' },
      { from: 'Auth API',      to: 'Email Service',  label: 'sendResetEmail(token)' },
      { from: 'Email Service', to: 'User',           label: 'reset link email' },
      { from: 'User',          to: 'Frontend',       label: 'click reset link' },
      { from: 'Frontend',      to: 'Auth API',       label: 'POST /reset { token, newPwd }' },
      { from: 'Auth API',      to: 'Redis',          label: 'GET + DEL reset_token' },
      { from: 'Redis',         to: 'Auth API',       label: 'token valid',     style: 'return' },
      { from: 'Auth API',      to: 'Frontend',       label: '200 password updated', style: 'return' },
    ],
    palette: 'colorful',
  });
  matchSvgSnapshot('sequence-password-reset', svg);
});
