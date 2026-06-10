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

export interface RoleRecord {
  role_key: Role;
  role_name: string;
  description: string;
  is_active: boolean;
}

export interface PermissionRecord {
  id: number;
  permission_key: string;
  permission_name: string;
  description: string;
}

export interface RolePermissionRecord {
  id: number;
  role: Role;
  permission: number;
  granted_at: string;
}

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

export interface SystemSetting {
  id?: number;
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

export interface SecuritySummary {
  session_timeout_minutes: number;
  password_reset_requests: number;
  inactive_users: number;
}

export interface PasswordResetRequestRecord {
  id: number;
  user: number;
  token: string;
  expires_at: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface PasswordResetRequestResponse {
  detail: string;
  token?: string;
}

export interface SignupRegistrationResponse {
  detail: string;
  email: string;
  verification_required: boolean;
  expires_in_minutes: number;
}

export interface SignupVerificationResponse {
  detail: string;
  access: string;
  refresh: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: Role;
    phone: string;
    department: string;
    location: string;
  };
}

export interface DonorEngagementSummary {
  donor_id: number;
  organization_name?: string;
  status?: 'active' | 'inactive';
  communication_count: number;
  last_contact_date: string | null;
  last_contact_subject: string | null;
  channels: string[];
  recent_communications?: Array<{
    id: number;
    channel: string;
    subject: string;
    message: string;
    communication_date: string;
  }>;
  engagement_score?: number;
  next_action?: string;
}

export interface DonorEngagementDashboard {
  total_donors: number;
  active_donors: number;
  inactive_donors: number;
  total_communications: number;
  channel_totals: Record<string, number>;
  top_donors: Array<{
    donor_id: number;
    organization_name: string;
    status: 'active' | 'inactive';
    communication_count: number;
    last_contact_date: string | null;
    engagement_score: number;
  }>;
}

export interface SystemSettingsSummary {
  total: number;
  groups: Record<string, number>;
  access_timeout_minutes: number;
}

export interface ComplianceItem {
  id: string;
  title: string;
  owner: string;
  verified: boolean;
}

export interface DocumentRecord {
  id: number;
  uploaded_by: number;
  related_entity_type: string;
  related_entity_id: number;
  document_type: string;
  file: string;
  uploaded_at: string;
}

export interface StaffRequirement {
  id: number;
  captured_by: number;
  interviewee_name: string;
  process_area: string;
  feedback: string;
  validation_status: 'pending' | 'in_review' | 'approved' | 'rejected';
  signed_off_by: number | null;
  signed_off_at: string | null;
  created_at: string;
}

export interface TestCase {
  id: number;
  created_by: number;
  title: string;
  scenario: string;
  environment: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export interface UATFeedback {
  id: number;
  test_case: number;
  submitted_by: number;
  feedback: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  created_at: string;
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

export interface BankAccount {
  id: number;
  account_name: string;
  bank_name: string;
  account_number: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface BankStatement {
  id: number;
  bank_account: number;
  statement_number: string;
  period_start: string;
  period_end: string;
  opening_balance: number;
  closing_balance: number;
  imported_by: number;
  statement_file: string | null;
  created_at: string;
}

export interface BankStatementLine {
  id: number;
  bank_statement: number;
  transaction_date: string;
  description: string;
  reference_number: string;
  amount: number;
  matched: boolean;
}

export interface Reconciliation {
  id: number;
  transaction: number;
  bank_statement_line: number;
  reviewed_by: number;
  status: 'matched' | 'unmatched' | 'exception';
  difference_amount: number;
  notes: string;
  matched_at: string | null;
  created_at: string;
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
  status?: 'pending' | 'cleared' | 'reconciled';
  created_at: string;
}

export interface Report {
  report_id: number;
  grant_id: number;
  report_type: string;
  generated_by_user_id: number;
  file_url: string | null;
  format: 'PDF' | 'Excel' | 'CSV';
  created_at: string;
}

export interface ReallocationRequest {
  id: number;
  source_budget_line: number;
  target_budget_line: number;
  requested_by: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ExpenseApproval {
  id: number;
  requisition: number;
  requested_by: number;
  reviewed_by: number | null;
  stage: 'submitted' | 'department_review' | 'finance_review' | 'executive_review' | 'approved' | 'rejected';
  notes: string;
  decision_reason: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface ReportSchedule {
  id: number;
  report_type: string;
  grant: number | null;
  created_by: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  delivery_method: 'email' | 'download' | 'archive';
  recipient_emails: string;
  next_run_at: string | null;
  last_run_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ReportDelivery {
  id: number;
  report: number;
  created_by: number;
  delivery_method: string;
  destination: string;
  status: 'queued' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
}

export interface ProcessDocument {
  id: number;
  title: string;
  version: string;
  summary: string;
  content: string;
  created_by: number;
  approved_by: number | null;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
}

export interface BugReport {
  id: number;
  reported_by: number;
  assigned_to: number | null;
  title: string;
  description: string;
  reproduction_steps: string;
  environment: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'triaged' | 'in_progress' | 'resolved' | 'closed';
  resolved_at: string | null;
  created_at: string;
}

export interface ReleaseNote {
  id: number;
  version: string;
  title: string;
  summary: string;
  changelog: string;
  environment: string;
  created_by: number;
  published_by: number | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
}
