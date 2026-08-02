import { Environment } from '@ihsan/core';

export const environment: Environment = {
  production: true,
  tenantId: 'polysnap',
  apiUrls: {
    gateway: 'https://api.{{DOMAIN}}',
    identity: 'https://identity.{{DOMAIN}}',
    tenant: 'https://tenant.{{DOMAIN}}',
    notification: 'https://notification.{{DOMAIN}}',
    fileManager: 'https://filemanager.{{DOMAIN}}',
    translation: 'https://translation.{{DOMAIN}}',
    ai: 'https://ai.{{DOMAIN}}',
    polySnap: 'https://polysnap.{{DOMAIN}}',
  },
};
