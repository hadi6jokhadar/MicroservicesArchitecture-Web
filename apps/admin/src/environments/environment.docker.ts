import { Environment } from '@ihsan/core';

// ihsandev.gleeze.com is PC2's DDNS hostname — update it here (and rebuild) if it ever changes.
// This file is committed (no secrets here) — it's a per-deployment address, not a credential.
export const environment: Environment = {
  production: true,
  apiUrls: {
    identity: 'http://ihsandev.gleeze.com:5001',
    tenant: 'http://ihsandev.gleeze.com:5002',
    notification: 'http://ihsandev.gleeze.com:5004',
    fileManager: 'http://ihsandev.gleeze.com:5005',
    translation: 'http://ihsandev.gleeze.com:5006',
    ai: 'http://ihsandev.gleeze.com:5008',
    category: 'http://ihsandev.gleeze.com:5007',
    nasheed: 'http://ihsandev.gleeze.com:5009',
    gateway: 'http://ihsandev.gleeze.com:5000',
  },
};
