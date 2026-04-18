import { it } from 'vitest';
import { createArchDiagram } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('arch diagram — microservices platform, excalidraw theme, TB direction', () => {
  const svg = createArchDiagram({
    layers: [
      {
        id: 'gateway', label: 'API Gateway',
        nodes: [
          { id: 'gw',  label: 'Gateway' },
          { id: 'lb',  label: 'Load Balancer' },
          { id: 'auth', label: 'Auth Middleware' },
        ],
      },
      {
        id: 'services', label: 'Microservices',
        nodes: [
          { id: 'user',    label: 'User Service' },
          { id: 'order',   label: 'Order Service' },
          { id: 'product', label: 'Product Service' },
          { id: 'payment', label: 'Payment Service' },
        ],
      },
      {
        id: 'messaging', label: 'Messaging',
        nodes: [
          { id: 'kafka', label: 'Kafka' },
          { id: 'redis', label: 'Redis Pub/Sub' },
        ],
      },
      {
        id: 'storage', label: 'Storage',
        nodes: [
          { id: 'pg',    label: 'PostgreSQL' },
          { id: 'mongo', label: 'MongoDB' },
          { id: 'es',    label: 'Elasticsearch' },
        ],
      },
    ],
    theme: 'excalidraw',
    direction: 'TB',
    width: 900,
  });
  matchSvgSnapshot('arch-microservices', svg);
});
