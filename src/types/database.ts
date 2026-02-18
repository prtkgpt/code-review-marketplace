export type UserRole = 'client' | 'expert' | 'admin';

export type SessionStatus =
  | 'pending_payment'
  | 'paid'
  | 'matched'
  | 'in_progress'
  | 'pr_submitted'
  | 'pending_review'
  | 'completed'
  | 'refund_requested'
  | 'refunded'
  | 'cancelled';

export type SessionTier = 'fix' | 'build' | 'ship' | 'autofix';

export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  github_handle: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ExpertProfile {
  id: string;
  user_id: string;
  stack_tags: string[];
  bio: string | null;
  hourly_rate: number | null;
  sessions_completed: number;
  satisfaction_score: number;
  avg_delivery_hours: number;
  stripe_connect_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Session {
  id: string;
  client_id: string;
  expert_id: string | null;
  tier: SessionTier;
  status: SessionStatus;
  repo_url: string;
  branch: string | null;
  pr_url: string | null;
  goal_description: string;
  stack_tags: string[];
  audit_report_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  expert_payout_cents: number;
  platform_fee_cents: number;
  deadline_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  client?: User;
  expert?: User;
  expert_profile?: ExpertProfile;
  audit_report?: AuditReport;
  messages?: Message[];
}

export interface AuditReport {
  id: string;
  session_id: string;
  stack_detected: string[];
  completion_score: number;
  blockers: AuditBlocker[];
  suggested_fix_plan: string;
  model_version: string;
  created_at: string;
}

export interface AuditBlocker {
  title: string;
  description: string;
  severity: AuditSeverity;
  file_path: string | null;
  estimated_effort: string;
}

export interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  is_system: boolean;
  created_at: string;
  sender?: User;
}

export interface DatasetEntry {
  id: string;
  session_id: string;
  repo_snapshot_before: string | null;
  repo_diff: string | null;
  outcome: string | null;
  expert_consented: boolean;
  logged_at: string;
}

export const TIER_CONFIG: Record<SessionTier, {
  name: string;
  price: number;
  priceCents: number;
  expertPayoutCents: number;
  platformFeeCents: number;
  description: string;
  guarantee: string;
  deadlineHours: number;
}> = {
  fix: {
    name: 'Fix',
    price: 99,
    priceCents: 9900,
    expertPayoutCents: 6000,
    platformFeeCents: 3900,
    description: 'Single bug or broken integration',
    guarantee: 'Works in 48hrs or full refund',
    deadlineHours: 48,
  },
  build: {
    name: 'Build',
    price: 249,
    priceCents: 24900,
    expertPayoutCents: 15000,
    platformFeeCents: 9900,
    description: 'Complete a specific feature end-to-end',
    guarantee: 'Ships in 72hrs or full refund',
    deadlineHours: 72,
  },
  ship: {
    name: 'Ship',
    price: 499,
    priceCents: 49900,
    expertPayoutCents: 29900,
    platformFeeCents: 20000,
    description: 'Entire project to production-ready',
    guarantee: 'Deployed in 5 days or full refund',
    deadlineHours: 120,
  },
  autofix: {
    name: 'AutoFix',
    price: 29,
    priceCents: 2900,
    expertPayoutCents: 0,
    platformFeeCents: 2900,
    description: 'AI-only, simple well-scoped fixes',
    guarantee: '24hr turnaround or full refund',
    deadlineHours: 24,
  },
};
