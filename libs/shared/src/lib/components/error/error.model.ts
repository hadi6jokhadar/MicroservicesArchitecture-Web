export interface ErrorDialogData {
  title: string;
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  traceId?: string;
}
