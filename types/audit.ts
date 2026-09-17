export interface AuditLogEntry {
  id: string; // e.g. "AUD-00001"
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
}

export type AuditLogInput = Omit<AuditLogEntry, "id" | "timestamp"> & {
  timestamp?: string;
};
