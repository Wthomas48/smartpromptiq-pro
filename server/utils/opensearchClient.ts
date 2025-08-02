import { Client } from '@opensearch-project/opensearch';

export const openSearchClient = new Client({
  node: 'http://localhost:9200',
  ssl: {
    rejectUnauthorized: false
  }
});
