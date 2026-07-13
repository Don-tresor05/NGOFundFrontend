import { create } from 'zustand';
import { ApiError, apiList, apiRequest } from '../lib/api';
import {
  AuditLog,
  BugReport,
  BudgetLine,
  BankAccount,
  BankStatement,
  BankStatementLine,
  ComplianceItem,
  DocumentRecord,
  Donor,
  DonorEngagementDashboard,
  DonorEngagementSummary,
  ExpenseApproval,
  Grant,
  Notification,
  Project,
  ProcessDocument,
  Report,
  ReportDelivery,
  ReportSchedule,
  ReallocationRequest,
  Reconciliation,
  Requisition,
  PermissionRecord,
  RolePermissionRecord,
  RoleRecord,
  Role,
  StaffRequirement,
  SecuritySummary,
  SystemSetting,
  SystemSettingsSummary,
  Transaction,
  TestCase,
  User,
  UATFeedback,
  ReleaseNote,
  Actor,
} from '../types';

interface AppDataState {
  isLoading: boolean;
  apiError: string | null;
  dataReady: boolean;
  users: User[];
  donors: Donor[];
  notifications: Notification[];
  grants: Grant[];
  budgetLines: BudgetLine[];
  projects: Project[];
  roles: RoleRecord[];
  permissions: PermissionRecord[];
  rolePermissions: RolePermissionRecord[];
  bankAccounts: BankAccount[];
  bankStatements: BankStatement[];
  bankStatementLines: BankStatementLine[];
  requisitions: Requisition[];
  auditLogs: AuditLog[];
  transactions: Transaction[];
  reports: Report[];
  systemSettings: SystemSetting[];
  complianceItems: ComplianceItem[];
  documents: DocumentRecord[];
  securitySummary: SecuritySummary | null;
  donorEngagementDashboard: DonorEngagementDashboard | null;
  systemSettingsSummary: SystemSettingsSummary | null;
  reallocationRequests: ReallocationRequest[];
  expenseApprovals: ExpenseApproval[];
  reportSchedules: ReportSchedule[];
  reportDeliveries: ReportDelivery[];
  reconciliations: Reconciliation[];
  processDocuments: ProcessDocument[];
  staffRequirements: StaffRequirement[];
  testCases: TestCase[];
  uatFeedback: UATFeedback[];
  bugReports: BugReport[];
  releaseNotes: ReleaseNote[];
  resetData: () => void;
  fetchAll: (actor?: Actor) => Promise<void>;
  fetchSecuritySummary: () => Promise<SecuritySummary | null>;
  fetchDonorEngagementDashboard: () => Promise<DonorEngagementDashboard | null>;
  fetchSystemSettingsSummary: () => Promise<SystemSettingsSummary | null>;
  updateDonorProfile: (payload: { organization_name: string; contact_person: string; contact_email: string; country: string; category: string }) => Promise<void>;
  createUser: (payload: Omit<User, 'user_id' | 'created_at' | 'is_active'>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<string>;
  updateSetting: (key: string, value: string) => Promise<void>;
  bulkUpdateSettings: (items: Array<{ setting_key: string; label?: string; setting_value: string; setting_group?: SystemSetting['group'] }>) => Promise<void>;
  createDonor: (payload: Omit<Donor, 'donor_id' | 'status' | 'notes'>) => Promise<void>;
  fetchDonorEngagementSummary: (donorId: number) => Promise<DonorEngagementSummary | null>;
  acknowledgeDonor: (donorId: number, payload?: { channel?: string; subject?: string; message?: string }) => Promise<void>;
  createGrant: (payload: Omit<Grant, 'grant_id' | 'status' | 'compliance_notes'>) => Promise<void>;
  createBudgetLine: (payload: Omit<BudgetLine, 'budget_line_id' | 'spent_amount'>) => Promise<void>;
  createBankStatement: (payload: { bank_account: number; statement_number: string; period_start: string; period_end: string; opening_balance: number; closing_balance: number; statement_file?: File | null }) => Promise<number>;
  importBankStatementLines: (bankStatementId: number, payload: { statement_number: string; period_start: string; period_end: string; opening_balance: number; closing_balance: number; statement_file?: File | null; lines?: Array<{ transaction_date: string; description: string; reference_number?: string; amount: number }> }) => Promise<void>;
  autoMatchBankStatement: (bankStatementId: number) => Promise<void>;
  createRequisition: (payload: Omit<Requisition, 'requisition_id' | 'status' | 'rejection_reason' | 'created_at'>) => Promise<void>;
  approveRequisition: (id: number) => Promise<void>;
  rejectRequisition: (id: number, reason: string) => Promise<void>;
  createReallocationRequest: (payload: { source_budget_line: number; target_budget_line: number; amount: number; reason: string }) => Promise<void>;
  approveReallocationRequest: (id: number) => Promise<void>;
  rejectReallocationRequest: (id: number) => Promise<void>;
  recordTransaction: (payload: Omit<Transaction, 'transaction_id' | 'created_at'>) => Promise<void>;
  reconcileTransaction: (id: number) => Promise<void>;
  createExpenseApproval: (payload: { requisition: number; notes?: string }) => Promise<void>;
  advanceExpenseApproval: (id: number, stage: 'department-review' | 'finance-review' | 'executive-review') => Promise<void>;
  approveExpenseApproval: (id: number, notes?: string) => Promise<void>;
  rejectExpenseApproval: (id: number, decisionReason: string) => Promise<void>;
  createAuditLog: (payload: Omit<AuditLog, 'log_id' | 'timestamp'>) => Promise<void>;
  createDocument: (payload: { related_entity_type: string; related_entity_id: number; document_type: string; file: File }) => Promise<void>;
  createReconciliation: (payload: { transaction: number; bank_statement_line: number; status?: Reconciliation['status']; difference_amount?: number; notes?: string }) => Promise<void>;
  matchReconciliation: (id: number, payload?: { difference_amount?: number; notes?: string }) => Promise<void>;
  markReconciliationException: (id: number, payload?: { difference_amount?: number; notes?: string }) => Promise<void>;
  createStaffRequirement: (payload: { interviewee_name: string; process_area: string; feedback?: string }) => Promise<void>;
  reviewStaffRequirement: (id: number) => Promise<void>;
  signOffStaffRequirement: (id: number) => Promise<void>;
  rejectStaffRequirement: (id: number) => Promise<void>;
  createTestCase: (payload: { title: string; scenario: string; environment: string; priority: TestCase['priority'] }) => Promise<void>;
  startTestCase: (id: number) => Promise<void>;
  reviewTestCase: (id: number) => Promise<void>;
  approveTestCase: (id: number) => Promise<void>;
  rejectTestCase: (id: number) => Promise<void>;
  createUATFeedback: (payload: { test_case: number; feedback: string; status?: UATFeedback['status'] }) => Promise<void>;
  resolveUATFeedback: (id: number) => Promise<void>;
  closeUATFeedback: (id: number) => Promise<void>;
  generateReport: (
    report_type: string,
    grant_id: number,
    generated_by_user_id: number,
    format: 'PDF' | 'Excel' | 'CSV'
  ) => Promise<void>;
  createReportSchedule: (payload: { report_type: string; grant: number | null; frequency: ReportSchedule['frequency']; delivery_method: ReportSchedule['delivery_method']; recipient_emails: string; next_run_at?: string | null }) => Promise<void>;
  activateReportSchedule: (id: number) => Promise<void>;
  deactivateReportSchedule: (id: number) => Promise<void>;
  runReportSchedule: (id: number) => Promise<void>;
  deliverReport: (reportId: number, payload?: { destination?: string; delivery_method?: string }) => Promise<void>;
  dispatchReportDelivery: (id: number) => Promise<void>;
  createProcessDocument: (payload: { title: string; version: string; summary: string; content: string }) => Promise<void>;
  submitProcessDocumentForReview: (id: number) => Promise<void>;
  approveProcessDocument: (id: number) => Promise<void>;
  publishProcessDocument: (id: number) => Promise<void>;
  rejectProcessDocument: (id: number) => Promise<void>;
  createBugReport: (payload: { title: string; description: string; reproduction_steps?: string; environment: string; severity: BugReport['severity'] }) => Promise<void>;
  triageBugReport: (id: number) => Promise<void>;
  startBugReport: (id: number) => Promise<void>;
  resolveBugReport: (id: number) => Promise<void>;
  closeBugReport: (id: number) => Promise<void>;
  createReleaseNote: (payload: { version: string; title: string; summary: string; changelog: string; environment: string }) => Promise<void>;
  publishReleaseNote: (id: number) => Promise<void>;
  archiveReleaseNote: (id: number) => Promise<void>;
  createNotification: (payload: Omit<Notification, 'notification_id' | 'created_at' | 'is_read'>) => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
  markAllNotificationsAsRead: (userId: number) => Promise<void>;
  updateProjectStatus: (projectId: number, status: Project['status']) => Promise<void>;
  enforceBudgetLimit: (budgetLineId: number, amount: number) => boolean;
  toggleComplianceItem: (id: string) => Promise<void>;
}

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: 'Super Administrator',
  FINANCE_OFFICER: 'Finance Officer',
  PROJECT_MANAGER: 'Project Manager',
  EXECUTIVE_DIRECTOR: 'Executive Director',
  FIELD_STAFF: 'Field Staff',
  EXTERNAL_AUDITOR: 'External Auditor',
  DONOR_USER: 'Donor User',
};

type ApiUser = {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  phone?: string;
  department?: string;
  location?: string;
};
type ApiRole = RoleRecord;
type ApiPermission = PermissionRecord;
type ApiRolePermission = RolePermissionRecord;
type ApiBankAccount = BankAccount;
type ApiBankStatement = Omit<BankStatement, 'bank_account' | 'imported_by'> & {
  bank_account: number;
  imported_by: number;
};
type ApiBankStatementLine = Omit<BankStatementLine, 'bank_statement'> & { bank_statement: number };

type ApiSystemSetting = {
  id: number;
  setting_key: string;
  label: string;
  setting_value: string;
  setting_group: SystemSetting['group'];
};
type ApiSystemSettingsSummary = SystemSettingsSummary;
type ApiDonorEngagementDashboard = DonorEngagementDashboard;

type ApiDonor = Omit<Donor, 'donor_id'> & { id: number };
type ApiGrant = Omit<Grant, 'grant_id' | 'donor_id'> & { id: number; donor: number };
type ApiBudgetLine = Omit<BudgetLine, 'budget_line_id' | 'grant_id'> & { id: number; grant: number; remaining_amount?: string };
type ApiProject = Omit<Project, 'project_id' | 'grant_id'> & { id: number; grant: number };
type ApiRequisition = Omit<Requisition, 'requisition_id' | 'submitted_by_user_id' | 'budget_line_id' | 'receipt_document_url'> & {
  id: number;
  submitted_by: number;
  budget_line: number;
  receipt_document: string | null;
};
type ApiAuditLog = Omit<AuditLog, 'log_id' | 'user_id'> & { id: number; user: number };
type ApiTransaction = Omit<Transaction, 'transaction_id' | 'donor_id' | 'requisition_id' | 'budget_line_id' | 'processed_by_user_id'> & {
  id: number;
  donor: number | null;
  requisition: number;
  budget_line: number;
  processed_by: number;
};
type ApiReport = Omit<Report, 'report_id' | 'grant_id' | 'generated_by_user_id' | 'file_url'> & {
  id: number;
  grant: number;
  generated_by: number;
  file: string | null;
};
type ApiNotification = Omit<Notification, 'notification_id' | 'user_id'> & { id: number; user: number };
type ApiComplianceItem = Omit<ComplianceItem, 'id'> & { id: number };
type ApiDocument = Omit<DocumentRecord, 'id'> & { id: number };
type ApiSecuritySummary = SecuritySummary;
type ApiDonorEngagementSummary = DonorEngagementSummary;
type ApiPasswordResetRequestResponse = {
  detail: string;
  token?: string;
};
type ApiReallocationRequest = Omit<ReallocationRequest, 'id' | 'source_budget_line' | 'target_budget_line' | 'requested_by' | 'reviewed_by'> & {
  id: number;
  source_budget_line: number;
  target_budget_line: number;
  requested_by: number;
  reviewed_by: number | null;
};
type ApiExpenseApproval = Omit<ExpenseApproval, 'id' | 'requisition' | 'requested_by' | 'reviewed_by'> & {
  id: number;
  requisition: number;
  requested_by: number;
  reviewed_by: number | null;
};
type ApiReportSchedule = Omit<ReportSchedule, 'id' | 'grant' | 'created_by'> & {
  id: number;
  grant: number | null;
  created_by: number;
};
type ApiReportDelivery = Omit<ReportDelivery, 'id' | 'report' | 'created_by'> & {
  id: number;
  report: number;
  created_by: number;
};
type ApiReconciliation = Omit<Reconciliation, 'id'> & {
  id: number;
  transaction: number;
  bank_statement_line: number;
  reviewed_by: number;
};
type ApiProcessDocument = Omit<ProcessDocument, 'id' | 'created_by' | 'approved_by'> & {
  id: number;
  created_by: number;
  approved_by: number | null;
};
type ApiStaffRequirement = Omit<StaffRequirement, 'id' | 'captured_by' | 'signed_off_by'> & {
  id: number;
  captured_by: number;
  signed_off_by: number | null;
};
type ApiTestCase = Omit<TestCase, 'id' | 'created_by'> & {
  id: number;
  created_by: number;
};
type ApiUATFeedback = Omit<UATFeedback, 'id' | 'test_case' | 'submitted_by'> & {
  id: number;
  test_case: number;
  submitted_by: number;
};
type ApiBugReport = Omit<BugReport, 'id' | 'reported_by' | 'assigned_to'> & {
  id: number;
  reported_by: number;
  assigned_to: number | null;
};
type ApiReleaseNote = Omit<ReleaseNote, 'id' | 'created_by' | 'published_by'> & {
  id: number;
  created_by: number;
  published_by: number | null;
};

const toNumber = (value: number | string) => Number(value);

const toNumberOrNull = (value: number | string | null) => (value === null ? null : Number(value));

const mapUser = (user: ApiUser): User => ({
  user_id: user.id,
  full_name: user.full_name,
  email: user.email,
  password: '',
  role: user.role,
  is_active: user.is_active,
  created_at: user.created_at,
});

const mapRole = (role: ApiRole): RoleRecord => role;
const mapPermission = (permission: ApiPermission): PermissionRecord => permission;
const mapRolePermission = (rolePermission: ApiRolePermission): RolePermissionRecord => rolePermission;

const mapSetting = (setting: ApiSystemSetting): SystemSetting => ({
  id: setting.id,
  key: setting.setting_key,
  label: setting.label,
  value: setting.setting_value,
  group: setting.setting_group,
});

const mapDonor = (donor: ApiDonor): Donor => ({ ...donor, donor_id: donor.id });
const mapGrant = (grant: ApiGrant): Grant => ({ ...grant, grant_id: grant.id, donor_id: grant.donor, total_amount: toNumber(grant.total_amount) });
const mapBudgetLine = (line: ApiBudgetLine): BudgetLine => ({
  budget_line_id: line.id,
  grant_id: line.grant,
  line_name: line.line_name,
  allocated_amount: toNumber(line.allocated_amount),
  spent_amount: toNumber(line.spent_amount),
});
const mapProject = (project: ApiProject): Project => ({ ...project, project_id: project.id, grant_id: project.grant });
const mapBankAccount = (account: ApiBankAccount): BankAccount => account;
const mapBankStatement = (statement: ApiBankStatement): BankStatement => ({
  ...statement,
  bank_account: statement.bank_account,
  imported_by: statement.imported_by,
  opening_balance: toNumber(statement.opening_balance),
  closing_balance: toNumber(statement.closing_balance),
});
const mapBankStatementLine = (line: ApiBankStatementLine): BankStatementLine => ({
  ...line,
  bank_statement: line.bank_statement,
  amount: toNumber(line.amount),
});
const mapRequisition = (requisition: ApiRequisition): Requisition => ({
  requisition_id: requisition.id,
  submitted_by_user_id: requisition.submitted_by,
  budget_line_id: requisition.budget_line,
  amount: toNumber(requisition.amount),
  description: requisition.description,
  receipt_document_url: requisition.receipt_document ?? '',
  status: requisition.status,
  rejection_reason: requisition.rejection_reason,
  created_at: requisition.created_at,
});
const mapAuditLog = (log: ApiAuditLog): AuditLog => ({ ...log, log_id: log.id, user_id: log.user });
const mapTransaction = (transaction: ApiTransaction): Transaction => ({
  transaction_id: transaction.id,
  donor_id: transaction.donor,
  requisition_id: transaction.requisition,
  budget_line_id: transaction.budget_line,
  processed_by_user_id: transaction.processed_by,
  amount: toNumber(transaction.amount),
  transaction_date: transaction.transaction_date,
  bank_reference_number: transaction.bank_reference_number,
  status: transaction.status,
  created_at: transaction.created_at,
});
const mapReport = (report: ApiReport): Report => ({
  report_id: report.id,
  grant_id: report.grant,
  report_type: report.report_type,
  generated_by_user_id: report.generated_by,
  file_url: report.file,
  format: report.format,
  created_at: report.created_at,
  custom_fields: report.custom_fields,
});
const mapNotification = (notification: ApiNotification): Notification => ({
  notification_id: notification.id,
  user_id: notification.user,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  is_read: notification.is_read,
  created_at: notification.created_at,
});
const mapComplianceItem = (item: ApiComplianceItem): ComplianceItem => ({ ...item, id: String(item.id) });
const mapDocument = (document: ApiDocument): DocumentRecord => ({
  id: document.id,
  uploaded_by: document.uploaded_by,
  related_entity_type: document.related_entity_type,
  related_entity_id: document.related_entity_id,
  document_type: document.document_type,
  file: document.file,
  uploaded_at: document.uploaded_at,
});
const mapReallocationRequest = (request: ApiReallocationRequest): ReallocationRequest => ({
  id: request.id,
  source_budget_line: request.source_budget_line,
  target_budget_line: request.target_budget_line,
  requested_by: request.requested_by,
  amount: toNumber(request.amount),
  reason: request.reason,
  status: request.status,
  reviewed_by: toNumberOrNull(request.reviewed_by),
  reviewed_at: request.reviewed_at,
  created_at: request.created_at,
});
const mapExpenseApproval = (approval: ApiExpenseApproval): ExpenseApproval => ({
  id: approval.id,
  requisition: approval.requisition,
  requested_by: approval.requested_by,
  reviewed_by: toNumberOrNull(approval.reviewed_by),
  stage: approval.stage,
  notes: approval.notes,
  decision_reason: approval.decision_reason,
  reviewed_at: approval.reviewed_at,
  created_at: approval.created_at,
});
const mapReportSchedule = (schedule: ApiReportSchedule): ReportSchedule => ({
  id: schedule.id,
  report_type: schedule.report_type,
  grant: schedule.grant,
  created_by: schedule.created_by,
  frequency: schedule.frequency,
  delivery_method: schedule.delivery_method,
  recipient_emails: schedule.recipient_emails,
  next_run_at: schedule.next_run_at,
  last_run_at: schedule.last_run_at,
  is_active: schedule.is_active,
  created_at: schedule.created_at,
});
const mapReportDelivery = (delivery: ApiReportDelivery): ReportDelivery => ({
  id: delivery.id,
  report: delivery.report,
  created_by: delivery.created_by,
  delivery_method: delivery.delivery_method,
  destination: delivery.destination,
  status: delivery.status,
  sent_at: delivery.sent_at,
  created_at: delivery.created_at,
});
const mapReconciliation = (reconciliation: ApiReconciliation): Reconciliation => ({
  id: reconciliation.id,
  transaction: reconciliation.transaction,
  bank_statement_line: reconciliation.bank_statement_line,
  reviewed_by: reconciliation.reviewed_by,
  status: reconciliation.status,
  difference_amount: toNumber(reconciliation.difference_amount),
  notes: reconciliation.notes,
  matched_at: reconciliation.matched_at,
  created_at: reconciliation.created_at,
});
const mapProcessDocument = (document: ApiProcessDocument): ProcessDocument => ({
  id: document.id,
  title: document.title,
  version: document.version,
  summary: document.summary,
  content: document.content,
  created_by: document.created_by,
  approved_by: document.approved_by,
  status: document.status,
  created_at: document.created_at,
  updated_at: document.updated_at,
});
const mapStaffRequirement = (requirement: ApiStaffRequirement): StaffRequirement => ({
  id: requirement.id,
  captured_by: requirement.captured_by,
  interviewee_name: requirement.interviewee_name,
  process_area: requirement.process_area,
  feedback: requirement.feedback,
  validation_status: requirement.validation_status,
  signed_off_by: requirement.signed_off_by,
  signed_off_at: requirement.signed_off_at,
  created_at: requirement.created_at,
});
const mapTestCase = (testCase: ApiTestCase): TestCase => ({
  id: testCase.id,
  created_by: testCase.created_by,
  title: testCase.title,
  scenario: testCase.scenario,
  environment: testCase.environment,
  status: testCase.status,
  priority: testCase.priority,
  created_at: testCase.created_at,
});
const mapUATFeedback = (feedback: ApiUATFeedback): UATFeedback => ({
  id: feedback.id,
  test_case: feedback.test_case,
  submitted_by: feedback.submitted_by,
  feedback: feedback.feedback,
  status: feedback.status,
  created_at: feedback.created_at,
});
const mapBugReport = (bug: ApiBugReport): BugReport => ({
  id: bug.id,
  reported_by: bug.reported_by,
  assigned_to: bug.assigned_to,
  title: bug.title,
  description: bug.description,
  reproduction_steps: bug.reproduction_steps,
  environment: bug.environment,
  severity: bug.severity,
  status: bug.status,
  resolved_at: bug.resolved_at,
  created_at: bug.created_at,
});
const mapReleaseNote = (note: ApiReleaseNote): ReleaseNote => ({
  id: note.id,
  version: note.version,
  title: note.title,
  summary: note.summary,
  changelog: note.changelog,
  environment: note.environment,
  created_by: note.created_by,
  published_by: note.published_by,
  status: note.status,
  published_at: note.published_at,
  created_at: note.created_at,
});

const emptyOnForbidden = async <T>(request: Promise<T[]>) => {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      return [];
    }
    throw error;
  }
};

const emptyOnForbiddenValue = async <T>(request: Promise<T>): Promise<T | null> => {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      return null;
    }
    throw error;
  }
};

const isAdminActor = (actor?: Actor | null) => actor === 'super_administrator';
const isFinanceActor = (actor?: Actor | null) =>
  actor === 'finance_officer' || actor === 'executive_director' || actor === 'project_manager';
const isOperationalActor = (actor?: Actor | null) =>
  actor === 'field_staff' || actor === 'project_manager' || actor === 'executive_director';
const isDonorActor = (actor?: Actor | null) => actor === 'donor_user';
const isAuditActor = (actor?: Actor | null) => actor === 'external_auditor' || actor === 'super_administrator';

export const useAppDataStore = create<AppDataState>((set, get) => ({
  isLoading: false,
  apiError: null,
  dataReady: false,
  users: [],
  donors: [],
  notifications: [],
  grants: [],
  budgetLines: [],
  projects: [],
  roles: [],
  permissions: [],
  rolePermissions: [],
  bankAccounts: [],
  bankStatements: [],
  bankStatementLines: [],
  requisitions: [],
  auditLogs: [],
  transactions: [],
  reports: [],
  systemSettings: [],
  complianceItems: [],
  documents: [],
  securitySummary: null,
  donorEngagementDashboard: null,
  systemSettingsSummary: null,
  reallocationRequests: [],
  expenseApprovals: [],
  reportSchedules: [],
  reportDeliveries: [],
  reconciliations: [],
  processDocuments: [],
  staffRequirements: [],
  testCases: [],
  uatFeedback: [],
  bugReports: [],
  releaseNotes: [],

  resetData: () =>
    set({
      isLoading: false,
      dataReady: false,
      apiError: null,
      users: [],
      donors: [],
      notifications: [],
      grants: [],
      budgetLines: [],
      projects: [],
      roles: [],
      permissions: [],
      rolePermissions: [],
      bankAccounts: [],
      bankStatements: [],
      bankStatementLines: [],
      requisitions: [],
      auditLogs: [],
      transactions: [],
      reports: [],
      systemSettings: [],
      complianceItems: [],
      documents: [],
      securitySummary: null,
      donorEngagementDashboard: null,
      systemSettingsSummary: null,
      reallocationRequests: [],
      expenseApprovals: [],
      reportSchedules: [],
      reportDeliveries: [],
      reconciliations: [],
      processDocuments: [],
      staffRequirements: [],
      testCases: [],
      uatFeedback: [],
      bugReports: [],
      releaseNotes: [],
    }),

  fetchAll: async (actor) => {
    set({ isLoading: true, apiError: null, dataReady: false });
    try {
      const [
        notifications,
        grants,
        budgetLines,
        projects,
        transactions,
        reports,
        reallocationRequests,
        expenseApprovals,
        reportSchedules,
        reportDeliveries,
        donors,
      ] = await Promise.all([
        emptyOnForbidden(apiList<ApiNotification>('/notifications/').then((rows) => rows.map(mapNotification))),
        emptyOnForbidden(apiList<ApiGrant>('/grants/').then((rows) => rows.map(mapGrant))),
        emptyOnForbidden(apiList<ApiBudgetLine>('/budget-lines/').then((rows) => rows.map(mapBudgetLine))),
        emptyOnForbidden(apiList<ApiProject>('/projects/').then((rows) => rows.map(mapProject))),
        emptyOnForbidden(apiList<ApiTransaction>('/transactions/').then((rows) => rows.map(mapTransaction))),
        emptyOnForbidden(apiList<ApiReport>('/reports/').then((rows) => rows.map(mapReport))),
        emptyOnForbidden(apiList<ApiReallocationRequest>('/reallocation-requests/').then((rows) => rows.map(mapReallocationRequest))),
        emptyOnForbidden(apiList<ApiExpenseApproval>('/expense-approvals/').then((rows) => rows.map(mapExpenseApproval))),
        emptyOnForbidden(apiList<ApiReportSchedule>('/report-schedules/').then((rows) => rows.map(mapReportSchedule))),
        emptyOnForbidden(apiList<ApiReportDelivery>('/report-deliveries/').then((rows) => rows.map(mapReportDelivery))),
        emptyOnForbidden(apiList<ApiDonor>('/donors/').then((rows) => rows.map(mapDonor))),
      ]);

      const baseState: Partial<AppDataState> = {
        notifications,
        grants,
        budgetLines,
        projects,
        transactions,
        reports,
        reallocationRequests,
        expenseApprovals,
        reportSchedules,
        reportDeliveries,
        donors,
      };

      if (isAdminActor(actor)) {
        const [
          users,
          roles,
          permissions,
          rolePermissions,
          bankAccounts,
          bankStatements,
          bankStatementLines,
          systemSettings,
          complianceItems,
          documents,
          securitySummary,
          systemSettingsSummary,
          processDocuments,
          staffRequirements,
          testCases,
          uatFeedback,
          bugReports,
          releaseNotes,
        ] = await Promise.all([
          emptyOnForbidden(apiList<ApiUser>('/users/').then((rows) => rows.map(mapUser))),
          emptyOnForbidden(apiList<ApiRole>('/roles/').then((rows) => rows.map(mapRole))),
          emptyOnForbidden(apiList<ApiPermission>('/permissions/').then((rows) => rows.map(mapPermission))),
          emptyOnForbidden(apiList<ApiRolePermission>('/role-permissions/').then((rows) => rows.map(mapRolePermission))),
          emptyOnForbidden(apiList<ApiBankAccount>('/bank-accounts/').then((rows) => rows.map(mapBankAccount))),
          emptyOnForbidden(apiList<ApiBankStatement>('/bank-statements/').then((rows) => rows.map(mapBankStatement))),
          emptyOnForbidden(apiList<ApiBankStatementLine>('/bank-statement-lines/').then((rows) => rows.map(mapBankStatementLine))),
          emptyOnForbidden(apiList<ApiSystemSetting>('/system-settings/').then((rows) => rows.map(mapSetting))),
          emptyOnForbidden(apiList<ApiComplianceItem>('/compliance-items/').then((rows) => rows.map(mapComplianceItem))),
          emptyOnForbidden(apiList<ApiDocument>('/documents/').then((rows) => rows.map(mapDocument))),
          emptyOnForbiddenValue(apiRequest<ApiSecuritySummary>('/users/security-summary/')),
          emptyOnForbiddenValue(apiRequest<ApiSystemSettingsSummary>('/system-settings/summary/')),
          emptyOnForbidden(apiList<ApiProcessDocument>('/process-documents/').then((rows) => rows.map(mapProcessDocument))),
          emptyOnForbidden(apiList<ApiStaffRequirement>('/staff-requirements/').then((rows) => rows.map(mapStaffRequirement))),
          emptyOnForbidden(apiList<ApiTestCase>('/test-cases/').then((rows) => rows.map(mapTestCase))),
          emptyOnForbidden(apiList<ApiUATFeedback>('/uat-feedback/').then((rows) => rows.map(mapUATFeedback))),
          emptyOnForbidden(apiList<ApiBugReport>('/bug-reports/').then((rows) => rows.map(mapBugReport))),
          emptyOnForbidden(apiList<ApiReleaseNote>('/release-notes/').then((rows) => rows.map(mapReleaseNote))),
        ]);
        baseState.users = users;
        baseState.roles = roles;
        baseState.permissions = permissions;
        baseState.rolePermissions = rolePermissions;
        baseState.bankAccounts = bankAccounts;
        baseState.bankStatements = bankStatements;
        baseState.bankStatementLines = bankStatementLines;
        baseState.systemSettings = systemSettings;
        baseState.complianceItems = complianceItems;
        baseState.documents = documents;
        baseState.securitySummary = securitySummary;
        baseState.systemSettingsSummary = systemSettingsSummary;
        baseState.processDocuments = processDocuments;
        baseState.staffRequirements = staffRequirements;
        baseState.testCases = testCases;
        baseState.uatFeedback = uatFeedback;
        baseState.bugReports = bugReports;
        baseState.releaseNotes = releaseNotes;
      } else if (isFinanceActor(actor)) {
        const [bankAccounts, bankStatements, bankStatementLines, documents, donorEngagementDashboard, requisitions, reconciliations, users] = await Promise.all([
          emptyOnForbidden(apiList<ApiBankAccount>('/bank-accounts/').then((rows) => rows.map(mapBankAccount))),
          emptyOnForbidden(apiList<ApiBankStatement>('/bank-statements/').then((rows) => rows.map(mapBankStatement))),
          emptyOnForbidden(apiList<ApiBankStatementLine>('/bank-statement-lines/').then((rows) => rows.map(mapBankStatementLine))),
          emptyOnForbidden(apiList<ApiDocument>('/documents/').then((rows) => rows.map(mapDocument))),
          emptyOnForbiddenValue(apiRequest<ApiDonorEngagementDashboard>('/donors/engagement-dashboard/')),
          emptyOnForbidden(apiList<ApiRequisition>('/requisitions/').then((rows) => rows.map(mapRequisition))),
          emptyOnForbidden(apiList<ApiReconciliation>('/reconciliations/').then((rows) => rows.map(mapReconciliation))),
          emptyOnForbidden(apiList<ApiUser>('/users/').then((rows) => rows.map(mapUser))),
        ]);
        baseState.bankAccounts = bankAccounts;
        baseState.bankStatements = bankStatements;
        baseState.bankStatementLines = bankStatementLines;
        baseState.documents = documents;
        baseState.donorEngagementDashboard = donorEngagementDashboard;
        baseState.requisitions = requisitions;
        baseState.reconciliations = reconciliations;
        baseState.users = users;
      } else if (isAuditActor(actor)) {
        const [auditLogs, complianceItems, documents, securitySummary, systemSettingsSummary, processDocuments, testCases, uatFeedback, bugReports, releaseNotes, requisitions, reconciliations, users] = await Promise.all([
          emptyOnForbidden(apiList<ApiAuditLog>('/audit-logs/').then((rows) => rows.map(mapAuditLog))),
          emptyOnForbidden(apiList<ApiComplianceItem>('/compliance-items/').then((rows) => rows.map(mapComplianceItem))),
          emptyOnForbidden(apiList<ApiDocument>('/documents/').then((rows) => rows.map(mapDocument))),
          emptyOnForbiddenValue(apiRequest<ApiSecuritySummary>('/users/security-summary/')),
          emptyOnForbiddenValue(apiRequest<ApiSystemSettingsSummary>('/system-settings/summary/')),
          emptyOnForbidden(apiList<ApiProcessDocument>('/process-documents/').then((rows) => rows.map(mapProcessDocument))),
          emptyOnForbidden(apiList<ApiTestCase>('/test-cases/').then((rows) => rows.map(mapTestCase))),
          emptyOnForbidden(apiList<ApiUATFeedback>('/uat-feedback/').then((rows) => rows.map(mapUATFeedback))),
          emptyOnForbidden(apiList<ApiBugReport>('/bug-reports/').then((rows) => rows.map(mapBugReport))),
          emptyOnForbidden(apiList<ApiReleaseNote>('/release-notes/').then((rows) => rows.map(mapReleaseNote))),
          emptyOnForbidden(apiList<ApiRequisition>('/requisitions/').then((rows) => rows.map(mapRequisition))),
          emptyOnForbidden(apiList<ApiReconciliation>('/reconciliations/').then((rows) => rows.map(mapReconciliation))),
          emptyOnForbidden(apiList<ApiUser>('/users/').then((rows) => rows.map(mapUser))),
        ]);
        baseState.auditLogs = auditLogs;
        baseState.complianceItems = complianceItems;
        baseState.documents = documents;
        baseState.securitySummary = securitySummary;
        baseState.systemSettingsSummary = systemSettingsSummary;
        baseState.processDocuments = processDocuments;
        baseState.testCases = testCases;
        baseState.uatFeedback = uatFeedback;
        baseState.bugReports = bugReports;
        baseState.releaseNotes = releaseNotes;
        baseState.requisitions = requisitions;
        baseState.reconciliations = reconciliations;
        baseState.users = users;
      } else if (isOperationalActor(actor)) {
        const [processDocuments, staffRequirements, testCases, uatFeedback, bugReports, releaseNotes] = await Promise.all([
          emptyOnForbidden(apiList<ApiProcessDocument>('/process-documents/').then((rows) => rows.map(mapProcessDocument))),
          emptyOnForbidden(apiList<ApiStaffRequirement>('/staff-requirements/').then((rows) => rows.map(mapStaffRequirement))),
          emptyOnForbidden(apiList<ApiTestCase>('/test-cases/').then((rows) => rows.map(mapTestCase))),
          emptyOnForbidden(apiList<ApiUATFeedback>('/uat-feedback/').then((rows) => rows.map(mapUATFeedback))),
          emptyOnForbidden(apiList<ApiBugReport>('/bug-reports/').then((rows) => rows.map(mapBugReport))),
          emptyOnForbidden(apiList<ApiReleaseNote>('/release-notes/').then((rows) => rows.map(mapReleaseNote))),
        ]);
        baseState.processDocuments = processDocuments;
        baseState.staffRequirements = staffRequirements;
        baseState.testCases = testCases;
        baseState.uatFeedback = uatFeedback;
        baseState.bugReports = bugReports;
        baseState.releaseNotes = releaseNotes;
      }

      if (isDonorActor(actor)) {
        const donorEngagementDashboard = await emptyOnForbiddenValue(apiRequest<ApiDonorEngagementDashboard>('/donors/engagement-dashboard/'));
        baseState.donorEngagementDashboard = donorEngagementDashboard;
      }

      set({
        ...baseState,
        isLoading: false,
        dataReady: true,
      });
    } catch (error) {
      set({
        apiError: error instanceof Error ? error.message : 'Could not load backend data.',
        isLoading: false,
        dataReady: false,
      });
    }
  },

  createUser: async (payload) => {
    const created = await apiRequest<ApiUser>('/users/', {
      method: 'POST',
      body: JSON.stringify({
        full_name: payload.full_name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      }),
    });
    set((state) => ({ users: [...state.users, mapUser(created)] }));
  },

  fetchSecuritySummary: async () => {
    const summary = await emptyOnForbiddenValue(apiRequest<ApiSecuritySummary>('/users/security-summary/'));
    set({ securitySummary: summary });
    return summary;
  },

  fetchDonorEngagementDashboard: async () => {
    const dashboard = await emptyOnForbiddenValue(apiRequest<ApiDonorEngagementDashboard>('/donors/engagement-dashboard/'));
    set({ donorEngagementDashboard: dashboard });
    return dashboard;
  },

  fetchSystemSettingsSummary: async () => {
    const summary = await emptyOnForbiddenValue(apiRequest<ApiSystemSettingsSummary>('/system-settings/summary/'));
    set({ systemSettingsSummary: summary });
    return summary;
  },

  updateDonorProfile: async (payload) => {
    await apiRequest('/donors/me/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await get().fetchAll();
  },

  requestPasswordReset: async (email) => {
    const resetRequest = await apiRequest<ApiPasswordResetRequestResponse>('/users/password-reset-request/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email }),
    });
    return resetRequest.token ?? null;
  },

  confirmPasswordReset: async (token, newPassword) => {
    const response = await apiRequest<{ detail: string }>('/users/password-reset-confirm/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    return response.detail;
  },

  updateSetting: async (key, value) => {
    const setting = get().systemSettings.find((entry) => entry.key === key);
    if (!setting?.id) {
      return;
    }
    const updated = await apiRequest<ApiSystemSetting>(`/system-settings/${setting.id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ setting_value: value }),
    });
    set((state) => ({
      systemSettings: state.systemSettings.map((entry) => (entry.key === key ? mapSetting(updated) : entry)),
    }));
  },

  bulkUpdateSettings: async (items) => {
    const updated = await apiRequest<ApiSystemSetting[]>('/system-settings/bulk-update/', {
      method: 'POST',
      body: JSON.stringify(
        items.map((item) => ({
          setting_key: item.setting_key,
          label: item.label,
          setting_value: item.setting_value,
          setting_group: item.setting_group,
        }))
      ),
    });
    set((state) => {
      const mapped = updated.map(mapSetting);
      const merged = [...state.systemSettings];
      for (const entry of mapped) {
        const index = merged.findIndex((setting) => setting.key === entry.key);
        if (index >= 0) {
          merged[index] = entry;
        } else {
          merged.push(entry);
        }
      }
      return { systemSettings: merged };
    });
  },

  createDonor: async (payload) => {
    const created = await apiRequest<ApiDonor>('/donors/', {
      method: 'POST',
      body: JSON.stringify({ ...payload, status: 'active', notes: 'Created from Register New Donor workflow.' }),
    });
    set((state) => ({ donors: [...state.donors, mapDonor(created)] }));
  },

  fetchDonorEngagementSummary: async (donorId) => {
    const summary = await emptyOnForbiddenValue(apiRequest<ApiDonorEngagementSummary>(`/donors/${donorId}/engagement-summary/`));
    return summary;
  },

  acknowledgeDonor: async (donorId, payload = {}) => {
    await apiRequest(`/donors/${donorId}/acknowledge/`, {
      method: 'POST',
      body: JSON.stringify({
        channel: payload.channel ?? 'email',
        subject: payload.subject,
        message: payload.message,
      }),
    });
  },

  createGrant: async (payload) => {
    const created = await apiRequest<ApiGrant>('/grants/', {
      method: 'POST',
      body: JSON.stringify({
        donor: payload.donor_id,
        grant_title: payload.grant_title,
        total_amount: payload.total_amount,
        currency: payload.currency,
        start_date: payload.start_date,
        end_date: payload.end_date,
        status: 'active',
        compliance_notes: 'Generated from frontend workflow.',
      }),
    });
    set((state) => ({ grants: [...state.grants, mapGrant(created)] }));
  },

  createBudgetLine: async (payload) => {
    const created = await apiRequest<ApiBudgetLine>('/budget-lines/', {
      method: 'POST',
      body: JSON.stringify({
        grant: payload.grant_id,
        line_name: payload.line_name,
        allocated_amount: payload.allocated_amount,
      }),
    });
    set((state) => ({ budgetLines: [...state.budgetLines, mapBudgetLine(created)] }));
  },

  createBankStatement: async (payload) => {
    const formData = new FormData();
    formData.append('bank_account', String(payload.bank_account));
    formData.append('statement_number', payload.statement_number);
    formData.append('period_start', payload.period_start);
    formData.append('period_end', payload.period_end);
    formData.append('opening_balance', String(payload.opening_balance));
    formData.append('closing_balance', String(payload.closing_balance));
    if (payload.statement_file) {
      formData.append('statement_file', payload.statement_file);
    }

    const response = await apiRequest<ApiBankStatement>('/bank-statements/', {
      method: 'POST',
      body: formData,
    });
    set((state) => ({ bankStatements: [mapBankStatement(response), ...state.bankStatements] }));
    return response.id;
  },

  importBankStatementLines: async (bankStatementId, payload) => {
    const body =
      payload.statement_file || !payload.lines
        ? (() => {
            const formData = new FormData();
            formData.append('statement_number', payload.statement_number);
            formData.append('period_start', payload.period_start);
            formData.append('period_end', payload.period_end);
            formData.append('opening_balance', String(payload.opening_balance));
            formData.append('closing_balance', String(payload.closing_balance));
            if (payload.statement_file) {
              formData.append('statement_file', payload.statement_file);
            }
            return formData;
          })()
        : JSON.stringify(payload);

    const response = await apiRequest<{ statement: ApiBankStatement; lines: ApiBankStatementLine[] }>(`/bank-statements/${bankStatementId}/import-lines/`, {
      method: 'POST',
      body,
    });
    const statement = mapBankStatement(response.statement);
    const lines = response.lines.map(mapBankStatementLine);
    set((state) => ({
      bankStatements: state.bankStatements.map((entry) => (entry.id === statement.id ? statement : entry)),
      bankStatementLines: [...lines, ...state.bankStatementLines],
    }));
  },

  autoMatchBankStatement: async (bankStatementId) => {
    await apiRequest<{ matched: number; created: number }>('/reconciliations/auto-match/', {
      method: 'POST',
      body: JSON.stringify({ bank_statement: bankStatementId }),
    });
    await get().fetchAll();
  },

  createReconciliation: async (payload) => {
    const created = await apiRequest<ApiReconciliation>('/reconciliations/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({ reconciliations: [mapReconciliation(created), ...state.reconciliations] }));
  },

  matchReconciliation: async (id, payload = {}) => {
    const updated = await apiRequest<ApiReconciliation>(`/reconciliations/${id}/match/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({
      reconciliations: state.reconciliations.map((entry) => (entry.id === id ? mapReconciliation(updated) : entry)),
    }));
  },

  markReconciliationException: async (id, payload = {}) => {
    const updated = await apiRequest<ApiReconciliation>(`/reconciliations/${id}/mark-exception/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({
      reconciliations: state.reconciliations.map((entry) => (entry.id === id ? mapReconciliation(updated) : entry)),
    }));
  },

  createReallocationRequest: async (payload) => {
    const created = await apiRequest<ApiReallocationRequest>('/reallocation-requests/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({ reallocationRequests: [mapReallocationRequest(created), ...state.reallocationRequests] }));
  },

  approveReallocationRequest: async (id) => {
    const updated = await apiRequest<ApiReallocationRequest>(`/reallocation-requests/${id}/approve/`, {
      method: 'POST',
    });
    set((state) => ({
      reallocationRequests: state.reallocationRequests.map((request) => (request.id === id ? mapReallocationRequest(updated) : request)),
      budgetLines: state.budgetLines.map((line) =>
        line.budget_line_id === updated.source_budget_line
          ? { ...line, allocated_amount: line.allocated_amount - updated.amount }
          : line.budget_line_id === updated.target_budget_line
            ? { ...line, allocated_amount: line.allocated_amount + updated.amount }
            : line
      ),
    }));
  },

  rejectReallocationRequest: async (id) => {
    const updated = await apiRequest<ApiReallocationRequest>(`/reallocation-requests/${id}/reject/`, {
      method: 'POST',
    });
    set((state) => ({
      reallocationRequests: state.reallocationRequests.map((request) => (request.id === id ? mapReallocationRequest(updated) : request)),
    }));
  },

  createRequisition: async (payload) => {
    const created = await apiRequest<ApiRequisition>('/requisitions/', {
      method: 'POST',
      body: JSON.stringify({
        budget_line: payload.budget_line_id,
        amount: payload.amount,
        description: payload.description,
      }),
    });
    set((state) => ({ requisitions: [mapRequisition(created), ...state.requisitions] }));
  },

  approveRequisition: async (id) => {
    const updated = await apiRequest<ApiRequisition>(`/requisitions/${id}/approve/`, { method: 'POST' });
    set((state) => ({
      requisitions: state.requisitions.map((requisition) =>
        requisition.requisition_id === id ? mapRequisition(updated) : requisition
      ),
    }));
  },

  rejectRequisition: async (id, reason) => {
    const updated = await apiRequest<ApiRequisition>(`/requisitions/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason: reason }),
    });
    set((state) => ({
      requisitions: state.requisitions.map((requisition) =>
        requisition.requisition_id === id ? mapRequisition(updated) : requisition
      ),
    }));
  },

  createExpenseApproval: async (payload) => {
    const created = await apiRequest<ApiExpenseApproval>('/expense-approvals/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({ expenseApprovals: [mapExpenseApproval(created), ...state.expenseApprovals] }));
  },

  advanceExpenseApproval: async (id, stage) => {
    const endpoint = {
      'department-review': 'department-review',
      'finance-review': 'finance-review',
      'executive-review': 'executive-review',
    }[stage];
    const updated = await apiRequest<ApiExpenseApproval>(`/expense-approvals/${id}/${endpoint}/`, {
      method: 'POST',
    });
    set((state) => ({
      expenseApprovals: state.expenseApprovals.map((approval) => (approval.id === id ? mapExpenseApproval(updated) : approval)),
    }));
  },

  approveExpenseApproval: async (id, notes) => {
    const updated = await apiRequest<ApiExpenseApproval>(`/expense-approvals/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    set((state) => ({
      expenseApprovals: state.expenseApprovals.map((approval) => (approval.id === id ? mapExpenseApproval(updated) : approval)),
      requisitions: state.requisitions.map((requisition) =>
        requisition.requisition_id === updated.requisition
          ? { ...requisition, status: 'approved', rejection_reason: '' }
          : requisition
      ),
    }));
  },

  rejectExpenseApproval: async (id, decisionReason) => {
    const updated = await apiRequest<ApiExpenseApproval>(`/expense-approvals/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ decision_reason: decisionReason }),
    });
    set((state) => ({
      expenseApprovals: state.expenseApprovals.map((approval) => (approval.id === id ? mapExpenseApproval(updated) : approval)),
      requisitions: state.requisitions.map((requisition) =>
        requisition.requisition_id === updated.requisition
          ? { ...requisition, status: 'rejected', rejection_reason: decisionReason }
          : requisition
      ),
    }));
  },

  recordTransaction: async (payload) => {
    const created = await apiRequest<ApiTransaction>('/transactions/', {
      method: 'POST',
      body: JSON.stringify({
        requisition: payload.requisition_id,
        budget_line: payload.budget_line_id,
        amount: payload.amount,
        transaction_date: payload.transaction_date,
        bank_reference_number: payload.bank_reference_number,
      }),
    });
    set((state) => ({
      transactions: [...state.transactions, mapTransaction(created)],
      budgetLines: state.budgetLines.map((budgetLine) =>
        budgetLine.budget_line_id === payload.budget_line_id
          ? { ...budgetLine, spent_amount: budgetLine.spent_amount + payload.amount }
          : budgetLine
      ),
    }));
  },

  reconcileTransaction: async (id) => {
    const updated = await apiRequest<ApiTransaction>(`/transactions/${id}/reconcile/`, {
      method: 'POST',
      body: JSON.stringify({ bank_reference_number: `BNK-${10000 + id}` }),
    });
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction.transaction_id === id ? mapTransaction(updated) : transaction
      ),
    }));
  },

  createAuditLog: async (payload) => {
    const created = await apiRequest<ApiAuditLog>('/audit-logs/', {
      method: 'POST',
      body: JSON.stringify({
        user: payload.user_id,
        action_type: payload.action_type,
        target_entity_id: payload.target_entity_id,
        target_entity_type: payload.target_entity_type,
        ip_address: payload.ip_address,
        details: payload.details,
      }),
    });
    set((state) => ({ auditLogs: [mapAuditLog(created), ...state.auditLogs] }));
  },

  createDocument: async (payload) => {
    const formData = new FormData();
    formData.append('related_entity_type', payload.related_entity_type);
    formData.append('related_entity_id', String(payload.related_entity_id));
    formData.append('document_type', payload.document_type);
    formData.append('file', payload.file);

    const created = await apiRequest<ApiDocument>('/documents/', {
      method: 'POST',
      body: formData,
    });
    set((state) => ({ documents: [mapDocument(created), ...state.documents] }));
  },

  createStaffRequirement: async (payload) => {
    const created = await apiRequest<ApiStaffRequirement>('/staff-requirements/', {
      method: 'POST',
      body: JSON.stringify({
        interviewee_name: payload.interviewee_name,
        process_area: payload.process_area,
        feedback: payload.feedback ?? '',
      }),
    });
    set((state) => ({ staffRequirements: [mapStaffRequirement(created), ...state.staffRequirements] }));
  },

  reviewStaffRequirement: async (id) => {
    const updated = await apiRequest<ApiStaffRequirement>(`/staff-requirements/${id}/review/`, { method: 'POST' });
    set((state) => ({
      staffRequirements: state.staffRequirements.map((requirement) =>
        requirement.id === id ? mapStaffRequirement(updated) : requirement
      ),
    }));
  },

  signOffStaffRequirement: async (id) => {
    const updated = await apiRequest<ApiStaffRequirement>(`/staff-requirements/${id}/sign-off/`, { method: 'POST' });
    set((state) => ({
      staffRequirements: state.staffRequirements.map((requirement) =>
        requirement.id === id ? mapStaffRequirement(updated) : requirement
      ),
    }));
  },

  rejectStaffRequirement: async (id) => {
    const updated = await apiRequest<ApiStaffRequirement>(`/staff-requirements/${id}/reject/`, { method: 'POST' });
    set((state) => ({
      staffRequirements: state.staffRequirements.map((requirement) =>
        requirement.id === id ? mapStaffRequirement(updated) : requirement
      ),
    }));
  },

  createTestCase: async (payload) => {
    const created = await apiRequest<ApiTestCase>('/test-cases/', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        scenario: payload.scenario,
        environment: payload.environment,
        priority: payload.priority,
      }),
    });
    set((state) => ({ testCases: [mapTestCase(created), ...state.testCases] }));
  },

  startTestCase: async (id) => {
    const updated = await apiRequest<ApiTestCase>(`/test-cases/${id}/start/`, { method: 'POST' });
    set((state) => ({
      testCases: state.testCases.map((testCase) => (testCase.id === id ? mapTestCase(updated) : testCase)),
    }));
  },

  reviewTestCase: async (id) => {
    const updated = await apiRequest<ApiTestCase>(`/test-cases/${id}/review/`, { method: 'POST' });
    set((state) => ({
      testCases: state.testCases.map((testCase) => (testCase.id === id ? mapTestCase(updated) : testCase)),
    }));
  },

  approveTestCase: async (id) => {
    const updated = await apiRequest<ApiTestCase>(`/test-cases/${id}/approve/`, { method: 'POST' });
    set((state) => ({
      testCases: state.testCases.map((testCase) => (testCase.id === id ? mapTestCase(updated) : testCase)),
    }));
  },

  rejectTestCase: async (id) => {
    const updated = await apiRequest<ApiTestCase>(`/test-cases/${id}/reject/`, { method: 'POST' });
    set((state) => ({
      testCases: state.testCases.map((testCase) => (testCase.id === id ? mapTestCase(updated) : testCase)),
    }));
  },

  createUATFeedback: async (payload) => {
    const created = await apiRequest<ApiUATFeedback>('/uat-feedback/', {
      method: 'POST',
      body: JSON.stringify({
        test_case: payload.test_case,
        feedback: payload.feedback,
        status: payload.status ?? 'open',
      }),
    });
    set((state) => ({ uatFeedback: [mapUATFeedback(created), ...state.uatFeedback] }));
  },

  resolveUATFeedback: async (id) => {
    const updated = await apiRequest<ApiUATFeedback>(`/uat-feedback/${id}/resolve/`, { method: 'POST' });
    set((state) => ({
      uatFeedback: state.uatFeedback.map((feedback) => (feedback.id === id ? mapUATFeedback(updated) : feedback)),
    }));
  },

  closeUATFeedback: async (id) => {
    const updated = await apiRequest<ApiUATFeedback>(`/uat-feedback/${id}/close/`, { method: 'POST' });
    set((state) => ({
      uatFeedback: state.uatFeedback.map((feedback) => (feedback.id === id ? mapUATFeedback(updated) : feedback)),
    }));
  },

  generateReport: async (report_type, grant_id, _generated_by_user_id, format) => {
    const created = await apiRequest<ApiReport>('/reports/', {
      method: 'POST',
      body: JSON.stringify({ grant: grant_id, report_type, format }),
    });
    set((state) => ({ reports: [...state.reports, mapReport(created)] }));
  },

  createReportSchedule: async (payload) => {
    const created = await apiRequest<ApiReportSchedule>('/report-schedules/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({ reportSchedules: [mapReportSchedule(created), ...state.reportSchedules] }));
  },

  activateReportSchedule: async (id) => {
    const updated = await apiRequest<ApiReportSchedule>(`/report-schedules/${id}/activate/`, {
      method: 'POST',
    });
    set((state) => ({
      reportSchedules: state.reportSchedules.map((schedule) => (schedule.id === id ? mapReportSchedule(updated) : schedule)),
    }));
  },

  deactivateReportSchedule: async (id) => {
    const updated = await apiRequest<ApiReportSchedule>(`/report-schedules/${id}/deactivate/`, {
      method: 'POST',
    });
    set((state) => ({
      reportSchedules: state.reportSchedules.map((schedule) => (schedule.id === id ? mapReportSchedule(updated) : schedule)),
    }));
  },

  runReportSchedule: async (id) => {
    const response = await apiRequest<{ schedule: ApiReportSchedule; deliveries: ApiReportDelivery[] }>(`/report-schedules/${id}/run/`, {
      method: 'POST',
    });
    const schedule = mapReportSchedule(response.schedule);
    const deliveries = response.deliveries.map(mapReportDelivery);
    set((state) => ({
      reportSchedules: state.reportSchedules.map((entry) => (entry.id === schedule.id ? schedule : entry)),
      reportDeliveries: [...deliveries, ...state.reportDeliveries],
    }));
  },

  deliverReport: async (reportId, payload = {}) => {
    const created = await apiRequest<ApiReportDelivery>(`/reports/${reportId}/deliver/`, {
      method: 'POST',
      body: JSON.stringify({
        destination: payload.destination,
        delivery_method: payload.delivery_method,
      }),
    });
    set((state) => ({ reportDeliveries: [mapReportDelivery(created), ...state.reportDeliveries] }));
  },

  dispatchReportDelivery: async (id) => {
    const updated = await apiRequest<ApiReportDelivery>(`/report-deliveries/${id}/dispatch/`, {
      method: 'POST',
    });
    set((state) => ({
      reportDeliveries: state.reportDeliveries.map((delivery) => (delivery.id === id ? mapReportDelivery(updated) : delivery)),
    }));
  },

  createProcessDocument: async (payload) => {
    const created = await apiRequest<ApiProcessDocument>('/process-documents/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({ processDocuments: [mapProcessDocument(created), ...state.processDocuments] }));
  },

  submitProcessDocumentForReview: async (id) => {
    const updated = await apiRequest<ApiProcessDocument>(`/process-documents/${id}/submit-for-review/`, {
      method: 'POST',
    });
    set((state) => ({
      processDocuments: state.processDocuments.map((document) => (document.id === id ? mapProcessDocument(updated) : document)),
    }));
  },

  approveProcessDocument: async (id) => {
    const updated = await apiRequest<ApiProcessDocument>(`/process-documents/${id}/approve/`, {
      method: 'POST',
    });
    set((state) => ({
      processDocuments: state.processDocuments.map((document) => (document.id === id ? mapProcessDocument(updated) : document)),
    }));
  },

  publishProcessDocument: async (id) => {
    const updated = await apiRequest<ApiProcessDocument>(`/process-documents/${id}/publish/`, {
      method: 'POST',
    });
    set((state) => ({
      processDocuments: state.processDocuments.map((document) => (document.id === id ? mapProcessDocument(updated) : document)),
    }));
  },

  rejectProcessDocument: async (id) => {
    const updated = await apiRequest<ApiProcessDocument>(`/process-documents/${id}/reject/`, {
      method: 'POST',
    });
    set((state) => ({
      processDocuments: state.processDocuments.map((document) => (document.id === id ? mapProcessDocument(updated) : document)),
    }));
  },

  createNotification: async (payload) => {
    const created = await apiRequest<ApiNotification>('/notifications/', {
      method: 'POST',
      body: JSON.stringify({
        user: payload.user_id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
      }),
    });
    set((state) => ({ notifications: [mapNotification(created), ...state.notifications] }));
  },

  markNotificationAsRead: async (id) => {
    const updated = await apiRequest<ApiNotification>(`/notifications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    });
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.notification_id === id ? mapNotification(updated) : notification
      ),
    }));
  },

  markAllNotificationsAsRead: async () => {
    await apiRequest<void>('/notifications/mark-all-read/', { method: 'POST' });
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, is_read: true })),
    }));
  },

  createBugReport: async (payload) => {
    const created = await apiRequest<ApiBugReport>('/bug-reports/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({ bugReports: [mapBugReport(created), ...state.bugReports] }));
  },

  triageBugReport: async (id) => {
    const updated = await apiRequest<ApiBugReport>(`/bug-reports/${id}/triage/`, { method: 'POST' });
    set((state) => ({
      bugReports: state.bugReports.map((bug) => (bug.id === id ? mapBugReport(updated) : bug)),
    }));
  },

  startBugReport: async (id) => {
    const updated = await apiRequest<ApiBugReport>(`/bug-reports/${id}/start/`, { method: 'POST' });
    set((state) => ({
      bugReports: state.bugReports.map((bug) => (bug.id === id ? mapBugReport(updated) : bug)),
    }));
  },

  resolveBugReport: async (id) => {
    const updated = await apiRequest<ApiBugReport>(`/bug-reports/${id}/resolve/`, { method: 'POST' });
    set((state) => ({
      bugReports: state.bugReports.map((bug) => (bug.id === id ? mapBugReport(updated) : bug)),
    }));
  },

  closeBugReport: async (id) => {
    const updated = await apiRequest<ApiBugReport>(`/bug-reports/${id}/close/`, { method: 'POST' });
    set((state) => ({
      bugReports: state.bugReports.map((bug) => (bug.id === id ? mapBugReport(updated) : bug)),
    }));
  },

  createReleaseNote: async (payload) => {
    const created = await apiRequest<ApiReleaseNote>('/release-notes/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((state) => ({ releaseNotes: [mapReleaseNote(created), ...state.releaseNotes] }));
  },

  publishReleaseNote: async (id) => {
    const updated = await apiRequest<ApiReleaseNote>(`/release-notes/${id}/publish/`, { method: 'POST' });
    set((state) => ({
      releaseNotes: state.releaseNotes.map((note) => (note.id === id ? mapReleaseNote(updated) : note)),
    }));
  },

  archiveReleaseNote: async (id) => {
    const updated = await apiRequest<ApiReleaseNote>(`/release-notes/${id}/archive/`, { method: 'POST' });
    set((state) => ({
      releaseNotes: state.releaseNotes.map((note) => (note.id === id ? mapReleaseNote(updated) : note)),
    }));
  },

  updateProjectStatus: async (projectId, status) => {
    const updated = await apiRequest<ApiProject>(`/projects/${projectId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    set((state) => ({
      projects: state.projects.map((project) => (project.project_id === projectId ? mapProject(updated) : project)),
    }));
  },

  enforceBudgetLimit: (budgetLineId, amount) => {
    const budgetLine = get().budgetLines.find((line) => line.budget_line_id === budgetLineId);
    if (!budgetLine) {
      return false;
    }
    return budgetLine.spent_amount + amount <= budgetLine.allocated_amount;
  },

  toggleComplianceItem: async (id) => {
    const item = get().complianceItems.find((entry) => entry.id === id);
    if (!item) {
      return;
    }

    const updated = item.verified
      ? await apiRequest<ApiComplianceItem>(`/compliance-items/${id}/`, {
          method: 'PATCH',
          body: JSON.stringify({ verified: false }),
        })
      : await apiRequest<ApiComplianceItem>(`/compliance-items/${id}/verify/`, { method: 'POST' });

    set((state) => ({
      complianceItems: state.complianceItems.map((entry) => (entry.id === id ? mapComplianceItem(updated) : entry)),
    }));
  },
}));
