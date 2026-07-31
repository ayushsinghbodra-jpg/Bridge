export type AuditLogAction =
  | "SERVER_CREATED"
  | "SERVER_UPDATED"
  | "OWNERSHIP_TRANSFERRED"
  | "ROLE_CHANGED"
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "MEMBER_KICKED"
  | "MEMBER_NICKNAME_CHANGED"
  | "CHANNEL_CREATED"
  | "CHANNEL_UPDATED"
  | "CHANNEL_DELETED"
  | "INVITE_CREATED"
  | "INVITE_REVOKED";

export interface AuditLogActor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface AuditLogResponse {
  id: string;
  serverId: string;
  action: AuditLogAction;
  actor: AuditLogActor;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogsPage {
  logs: AuditLogResponse[];
  nextCursor: string | null;
}
