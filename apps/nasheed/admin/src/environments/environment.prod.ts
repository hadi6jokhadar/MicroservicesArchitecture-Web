import { Environment } from '@ihsan/core';

export const environment: Environment = {
  production: true,
  tenantId: 'anashid',
  apiUrls: {
    gateway: 'https://api.nasheed.app',
    identity: 'https://identity.nasheed.app',
    tenant: 'https://tenant.nasheed.app',
    notification: 'https://notification.nasheed.app',
    fileManager: 'https://filemanager.nasheed.app',
    translation: 'https://translation.nasheed.app',
    ai: 'https://ai.nasheed.app',
  },
};
