import { Environment } from '@ihsan/core';

export const environment: Environment = {
  production: true,
  apiUrls: {
    identity: 'https://api.yourdomain.com/identity',
    tenant: 'https://api.yourdomain.com/tenant',
    notification: 'https://api.yourdomain.com/notification',
    fileManager: 'https://api.yourdomain.com/filemanager',
  },
};
