import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('ER diagram — blog schema, default palette', () => {
  const svg = fig({
    figure: 'er',
    title: 'Blog Schema',
    entities: [
      {
        id: 'User',
        label: 'User',
        accent: true,
        fields: [
          { name: 'id',    key: 'pk', type: 'uuid' },
          { name: 'email',            type: 'text' },
          { name: 'name',             type: 'text' },
        ],
      },
      {
        id: 'Post',
        label: 'Post',
        fields: [
          { name: 'id',        key: 'pk', type: 'uuid' },
          { name: 'author_id', key: 'fk', type: 'uuid' },
          { name: 'title',               type: 'text' },
          { name: 'body',                type: 'text' },
        ],
      },
      {
        id: 'Comment',
        label: 'Comment',
        fields: [
          { name: 'id',      key: 'pk', type: 'uuid' },
          { name: 'post_id', key: 'fk', type: 'uuid' },
          { name: 'user_id', key: 'fk', type: 'uuid' },
          { name: 'content',            type: 'text' },
        ],
      },
    ],
    relations: [
      { from: 'User', to: 'Post',    label: 'writes',  fromCard: '1', toCard: 'N' },
      { from: 'Post', to: 'Comment', label: 'has',     fromCard: '1', toCard: 'N' },
      { from: 'User', to: 'Comment', label: 'authors', fromCard: '1', toCard: 'N' },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('er-blog-schema-default', svg);
});
