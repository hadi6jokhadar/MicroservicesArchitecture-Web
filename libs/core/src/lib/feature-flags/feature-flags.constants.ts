export const FeatureFlags = {
  AiChatEnabled: 'aiChatEnabled',
  NasheedIngestionEnabled: 'nasheedIngestionEnabled',
  IsBackgroundJobPageEnabled: 'isBackgroundJobPageEnabled',
  IsAuditLogPageEnabled: 'isAuditLogPageEnabled',
  NasheedNewLyricsExtractionEnabled: 'nasheedNewLyricsExtractionEnabled',
} as const;

export type FeatureFlag = (typeof FeatureFlags)[keyof typeof FeatureFlags];
