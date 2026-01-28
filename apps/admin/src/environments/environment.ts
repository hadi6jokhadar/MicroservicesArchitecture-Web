import { Environment } from '@ihsan/core';

export const environment: Environment = {
  production: false,
  apiUrls: {
    identity: 'http://localhost:5001',
    tenant: 'http://localhost:5002',
    notification: 'http://localhost:5003',
    fileManager: 'http://localhost:5005',
    translation: 'http://localhost:5006',
  },
};
