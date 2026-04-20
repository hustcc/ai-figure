import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('ER diagram — social network, vega palette', () => {
  const svg = fig({
    figure: 'er',
    title: 'Social Network',
    subtitle: 'Users, posts and interactions',
    entities: [
      {
        id: 'User',
        label: 'User',
        accent: true,
        fields: [
          { name: 'id',       key: 'pk', type: 'uuid' },
          { name: 'username',            type: 'text' },
          { name: 'bio',                 type: 'text' },
        ],
      },
      {
        id: 'Post',
        label: 'Post',
        fields: [
          { name: 'id',        key: 'pk', type: 'uuid' },
          { name: 'author_id', key: 'fk', type: 'uuid' },
          { name: 'content',             type: 'text' },
          { name: 'created',             type: 'datetime' },
        ],
      },
      {
        id: 'Comment',
        label: 'Comment',
        fields: [
          { name: 'id',       key: 'pk', type: 'uuid' },
          { name: 'post_id',  key: 'fk', type: 'uuid' },
          { name: 'user_id',  key: 'fk', type: 'uuid' },
          { name: 'text',               type: 'text' },
        ],
      },
    ],
    relations: [
      { from: 'User', to: 'Post',    label: 'writes',    fromCard: '1', toCard: 'N' },
      { from: 'User', to: 'Comment', label: 'comments',  fromCard: '1', toCard: 'N' },
      { from: 'Post', to: 'Comment', label: 'receives',  fromCard: '1', toCard: 'N' },
    ],
    palette: 'vega',
  });
  matchSvgSnapshot('er-social-network-vega', svg);
});
