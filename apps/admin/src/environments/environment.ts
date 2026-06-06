import { Environment } from '@ihsan/core';

export const environment: Environment = {
  production: false,
  apiUrls: {
    identity: 'http://localhost:5001',
    tenant: 'http://localhost:5002',
    notification: 'http://localhost:5004',
    fileManager: 'http://localhost:5005',
    translation: 'http://localhost:5006',
    ai: 'http://localhost:5008',
    category: 'http://localhost:5007',
    nasheed: 'http://localhost:5009',
    gateway: 'http://localhost:5000',
  },
};
