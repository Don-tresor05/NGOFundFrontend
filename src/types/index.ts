export type Actor =
  | 'super_administrator'
  | 'finance_officer'
  | 'field_staff'
  | 'project_manager'
  | 'executive_director'
  | 'external_auditor'
  | 'donor_user';

export type Role =
  | 'SUPER_ADMIN'
  | 'FINANCE_OFFICER'
  | 'PROJECT_MANAGER'
  | 'EXECUTIVE_DIRECTOR'
  | 'FIELD_STAFF'
  | 'EXTERNAL_AUDITOR'
  | 'DONOR_USER';

export type UseCaseId =
  | 'manage-user-accounts'
  | 'manage-system-settings'
  | 'view-event-logs'
  | 'view-analytical-dashboard'
  | 'register-new-donor'
  | 'record-fund-receipt'
  | 'allocate-funds-to-projects'
  | 'bank-reconciliation'
  | 'generate-financial-reports'
  | 'maintain-audit-trail'
  | 'submit-expense-claims'
  | 'capture-staff-requirements'
  | 'manage-testing-validation'
  | 'update-user-profile'
  | 'review-budget-requests'
  | 'monitor-project-budget'
  | 'final-approve-requisitions'
  | 'view-strategic-dashboard'
  | 'view-audit-trail'
  | 'verify-compliance-checklist'
  | 'access-donor-portal'
  | 'view-transaction-summaries';

export type ModuleId =
  | 'donor-management'
  | 'fund-collection-tracking'
  | 'project-fund-allocation'
  | 'expenditure-monitoring'
  | 'reporting-analytics'
  | 'staff-operations'
  | 'testing-validation'
  | 'user-access-management'
  | 'dashboard-transparency'
  | 'audit-compliance';

export type TrendDirection = 'up' | 'down' | 'neutral';
export type SimpleStatus =
  | 'active'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'in_review'
  | 'reconciled'
  | 'open'
  | 'high'
  | 'medium'
  | 'low';

export interface ActorDefinition {
  id: Actor;
  label: string;
  shortLabel: string;
  dashboardTitle: string;
  dashboardSummary: string;
  accentColor: string;
  accessLabel: string;
  loginTitle: string;
  loginSummary: string;
  registrationSummary: string;
  highlights: string[];
}

export interface RoleFormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'select';
  placeholder: string;
  options?: Array<{ label: string; value: string }>;
}

export interface UseCaseDefinition {
  id: UseCaseId;
  moduleId: ModuleId;
  title: string;
  summary: string;
  actors: Actor[];
}

export interface PlatformModuleDefinition {
  id: ModuleId;
  title: string;
  summary: string;
  uiElements: string[];
  features: string[];
  useCaseIds: UseCaseId[];
}

export interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  trendDirection: TrendDirection;
}

export interface NavItem {
  to: string;
  label: string;
  description: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  actor: Actor;
  phone: string;
  department: string;
  location: string;
  avatarText: string;
  metadata: Record<string, string>;
}

export interface MockAccount {
  id: string;
  actor: Actor;
  email: string;
  password: string;
  name: string;
  metadata: Record<string, string>;
}

export interface SystemSetting {
  key: string;
  label: string;
  value: string;
  group: 'access' | 'finance' | 'notifications';
}

export interface Requisition {
  requisition_id: number;
  submitted_by_user_id: number;
  budget_line_id: number;
  amount: number;
  description: string;
  receipt_document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string;
  created_at: string;
}

export interface ComplianceItem {
  id: string;
  title: string;
  owner: string;
  verified: boolean;
}

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  password: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Donor {
  donor_id: number;
  organization_name: string;
  contact_person: string;
  contact_email: string;
  country: string;
  category: string;
  status: 'active' | 'inactive';
  notes: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Grant {
  grant_id: number;
  donor_id: number;
  grant_title: string;
  total_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'pending' | 'closed';
  compliance_notes: string;
}

export interface BudgetLine {
  budget_line_id: number;
  grant_id: number;
  line_name: string;
  allocated_amount: number;
  spent_amount: number;
}

export interface Project {
  project_id: number;
  name: string;
  grant_id: number;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'pending' | 'completed';
}

export interface AuditLog {
  log_id: number;
  user_id: number;
  action_type: string;
  target_entity_id: number;
  target_entity_type: string;
  timestamp: string;
  ip_address: string;
  details: string;
}

export interface Transaction {
  transaction_id: number;
  requisition_id: number;
  budget_line_id: number;
  processed_by_user_id: number;
  amount: number;
  transaction_date: string;
  bank_reference_number: string;
  created_at: string;
}

export interface Report {
  report_id: number;
  grant_id: number;
  report_type: string;
  generated_by_user_id: number;
  file_url: string;
  format: 'PDF' | 'Excel';
  created_at: string;
}
