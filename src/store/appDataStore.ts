import { create } from 'zustand';
import { apiList, apiRequest } from '../lib/api';
import {
  AuditLog,
  BudgetLine,
  ComplianceItem,
  Donor,
  Grant,
  Notification,
  Project,
  Report,
  Requisition,
  Role,
  SystemSetting,
  Transaction,
  User,
} from '../types';

interface AppDataState {
  isLoading: boolean;
  apiError: string | null;
  users: User[];
  donors: Donor[];
  notifications: Notification[];
  grants: Grant[];
  budgetLines: BudgetLine[];
  projects: Project[];
  requisitions: Requisition[];
  auditLogs: AuditLog[];
  transactions: Transaction[];
  reports: Report[];
  systemSettings: SystemSetting[];
  complianceItems: ComplianceItem[];
  fetchAll: () => Promise<void>;
  createUser: (payload: Omit<User, 'user_id' | 'created_at' | 'is_active'>) => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  createDonor: (payload: Omit<Donor, 'donor_id' | 'status' | 'notes'>) => Promise<void>;
  createGrant: (payload: Omit<Grant, 'grant_id' | 'status' | 'compliance_notes'>) => Promise<void>;
  createBudgetLine: (payload: Omit<BudgetLine, 'budget_line_id' | 'spent_amount'>) => Promise<void>;
  createRequisition: (payload: Omit<Requisition, 'requisition_id' | 'status' | 'rejection_reason' | 'created_at'>) => Promise<void>;
  approveRequisition: (id: number) => Promise<void>;
  rejectRequisition: (id: number, reason: string) => Promise<void>;
  recordTransaction: (payload: Omit<Transaction, 'transaction_id' | 'created_at'>) => Promise<void>;
  reconcileTransaction: (id: number) => Promise<void>;
  createAuditLog: (payload: Omit<AuditLog, 'log_id' | 'timestamp'>) => Promise<void>;
  generateReport: (report_type: string, grant_id: number, generated_by_user_id: number, format: 'PDF' | 'Excel') => Promise<void>;
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
};

type ApiSystemSetting = {
  id: number;
  setting_key: string;
  label: string;
  setting_value: string;
  setting_group: SystemSetting['group'];
};

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
type ApiTransaction = Omit<Transaction, 'transaction_id' | 'requisition_id' | 'budget_line_id' | 'processed_by_user_id'> & {
  id: number;
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

const toNumber = (value: number | string) => Number(value);

const mapUser = (user: ApiUser): User => ({
  user_id: user.id,
  full_name: user.full_name,
  email: user.email,
  password: '',
  role: user.role,
  is_active: user.is_active,
  created_at: user.created_at,
});

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

const retainOnForbidden = async <T>(request: Promise<T[]>, fallback: T[]) => {
  try {
    return await request;
  } catch {
    return fallback;
  }
};

export const useAppDataStore = create<AppDataState>((set, get) => ({
  isLoading: false,
  apiError: null,
  users: [
    {
      user_id: 1,
      full_name: 'Nadine Uwase',
      email: 'superadmin@ngofund.org',
      password: 'demo123',
      role: 'SUPER_ADMIN',
      is_active: true,
      created_at: '2026-01-10 08:00',
    },
    {
      user_id: 2,
      full_name: 'Michael Finance',
      email: 'finance@ngofund.org',
      password: 'demo123',
      role: 'FINANCE_OFFICER',
      is_active: true,
      created_at: '2026-01-12 09:15',
    },
    {
      user_id: 3,
      full_name: 'Grace Field',
      email: 'field@ngofund.org',
      password: 'demo123',
      role: 'FIELD_STAFF',
      is_active: true,
      created_at: '2026-02-03 14:05',
    },
    {
      user_id: 4,
      full_name: 'Patrick Manager',
      email: 'manager@ngofund.org',
      password: 'demo123',
      role: 'PROJECT_MANAGER',
      is_active: true,
      created_at: '2026-02-10 10:25',
    },
  ],
  donors: [
    {
      donor_id: 1,
      organization_name: 'Sarah Donor',
      contact_person: 'Sarah Donor',
      contact_email: 'sarah@impact.org',
      country: 'Rwanda',
      category: 'Individual',
      status: 'active',
      notes: 'Supports maternal care and water access.',
    },
    {
      donor_id: 2,
      organization_name: 'Health Equity Fund',
      contact_person: 'Robert Johnson',
      contact_email: 'contact@hef.org',
      country: 'United States',
      category: 'Foundation',
      status: 'active',
      notes: 'Quarterly compliance package required.',
    },
  ],
  notifications: [
    {
      notification_id: 1,
      user_id: 1,
      type: 'system',
      title: 'Budget request escalated',
      message: 'Water Access request requires review.',
      is_read: false,
      created_at: '2026-05-26 08:10',
    },
    {
      notification_id: 2,
      user_id: 2,
      type: 'finance',
      title: 'Bank reference pending',
      message: 'Transaction BNK-10043 needs reconciliation.',
      is_read: false,
      created_at: '2026-05-26 09:00',
    },
  ],
  grants: [
    {
      grant_id: 1,
      donor_id: 2,
      grant_title: 'Health Systems Grant',
      total_amount: 85000,
      currency: 'USD',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      status: 'active',
      compliance_notes: 'Quarterly utilization and audit report required.',
    },
    {
      grant_id: 2,
      donor_id: 1,
      grant_title: 'Maternal Care Support',
      total_amount: 32000,
      currency: 'USD',
      start_date: '2026-03-01',
      end_date: '2026-09-30',
      status: 'active',
      compliance_notes: 'Receipts required for all field claims.',
    },
  ],
  budgetLines: [
    { budget_line_id: 1, grant_id: 1, line_name: 'Water Access', allocated_amount: 25000, spent_amount: 16400 },
    { budget_line_id: 2, grant_id: 1, line_name: 'School Nutrition', allocated_amount: 18000, spent_amount: 9100 },
    { budget_line_id: 3, grant_id: 2, line_name: 'Maternal Care', allocated_amount: 21000, spent_amount: 8750 },
  ],
  projects: [
    {
      project_id: 1,
      name: 'Water Access',
      grant_id: 1,
      description: 'Community water-point rehabilitation and monitoring.',
      start_date: '2026-02-01',
      end_date: '2026-10-31',
      status: 'active',
    },
    {
      project_id: 2,
      name: 'School Nutrition',
      grant_id: 1,
      description: 'Nutrition support for school-age children.',
      start_date: '2026-01-15',
      end_date: '2026-11-30',
      status: 'active',
    },
    {
      project_id: 3,
      name: 'Maternal Care',
      grant_id: 2,
      description: 'Field care support for mothers and newborns.',
      start_date: '2026-03-01',
      end_date: '2026-09-30',
      status: 'active',
    },
  ],
  requisitions: [
    {
      requisition_id: 1,
      submitted_by_user_id: 3,
      budget_line_id: 1,
      amount: 5300,
      description: 'Water pump installation materials',
      receipt_document_url: '/receipts/water-pump.pdf',
      status: 'pending',
      rejection_reason: '',
      created_at: '2026-05-23 11:40',
    },
    {
      requisition_id: 2,
      submitted_by_user_id: 4,
      budget_line_id: 2,
      amount: 7800,
      description: 'Nutrition kit procurement',
      receipt_document_url: '/receipts/nutrition-kit.pdf',
      status: 'approved',
      rejection_reason: '',
      created_at: '2026-05-21 15:10',
    },
  ],
  auditLogs: [
    {
      log_id: 1,
      user_id: 2,
      action_type: 'recordTransaction',
      target_entity_id: 1,
      target_entity_type: 'transactions',
      timestamp: '2026-05-25 07:55',
      ip_address: '192.168.1.24',
      details: 'Receipt posted and linked to Maternal Care budget line.',
    },
    {
      log_id: 2,
      user_id: 4,
      action_type: 'approveRequisition',
      target_entity_id: 2,
      target_entity_type: 'requisitions',
      timestamp: '2026-05-24 16:10',
      ip_address: '192.168.1.42',
      details: 'Budget request approved for School Nutrition.',
    },
  ],
  transactions: [
    {
      transaction_id: 1,
      requisition_id: 2,
      budget_line_id: 2,
      processed_by_user_id: 2,
      amount: 7800,
      transaction_date: '2026-05-22',
      bank_reference_number: 'BNK-10042',
      created_at: '2026-05-22 12:00',
    },
    {
      transaction_id: 2,
      requisition_id: 1,
      budget_line_id: 1,
      processed_by_user_id: 2,
      amount: 4200,
      transaction_date: '2026-05-25',
      bank_reference_number: 'BNK-10043',
      created_at: '2026-05-25 09:20',
    },
  ],
  reports: [
    {
      report_id: 1,
      grant_id: 1,
      report_type: 'Q2 Financial Position',
      generated_by_user_id: 2,
      file_url: '/reports/q2-financial-position.pdf',
      format: 'PDF',
      created_at: '2026-05-20 10:00',
    },
    {
      report_id: 2,
      grant_id: 2,
      report_type: 'Receipts Summary',
      generated_by_user_id: 2,
      file_url: '/reports/receipts-summary.xlsx',
      format: 'Excel',
      created_at: '2026-05-22 13:30',
    },
  ],
  systemSettings: [
    { key: 'approval_window', label: 'Approval Window', value: '48 hours', group: 'access' },
    { key: 'receipt_currency', label: 'Receipt Currency', value: 'USD', group: 'finance' },
    { key: 'notify_executive', label: 'Executive Alerts', value: 'Enabled', group: 'notifications' },
  ],
  complianceItems: [
    { id: 'cmp-001', title: 'Donor consent evidence attached', owner: 'Fundraising', verified: true },
    { id: 'cmp-002', title: 'Expense receipt archive complete', owner: 'Finance', verified: false },
    { id: 'cmp-003', title: 'Role review performed this quarter', owner: 'Administration', verified: true },
  ],

  fetchAll: async () => {
    const state = get();
    set({ isLoading: true, apiError: null });
    try {
      const [
        users,
        donors,
        notifications,
        grants,
        budgetLines,
        projects,
        requisitions,
        auditLogs,
        transactions,
        reports,
        systemSettings,
        complianceItems,
      ] = await Promise.all([
        retainOnForbidden(apiList<ApiUser>('/users/').then((rows) => rows.map(mapUser)), state.users),
        retainOnForbidden(apiList<ApiDonor>('/donors/').then((rows) => rows.map(mapDonor)), state.donors),
        retainOnForbidden(apiList<ApiNotification>('/notifications/').then((rows) => rows.map(mapNotification)), state.notifications),
        retainOnForbidden(apiList<ApiGrant>('/grants/').then((rows) => rows.map(mapGrant)), state.grants),
        retainOnForbidden(apiList<ApiBudgetLine>('/budget-lines/').then((rows) => rows.map(mapBudgetLine)), state.budgetLines),
        retainOnForbidden(apiList<ApiProject>('/projects/').then((rows) => rows.map(mapProject)), state.projects),
        retainOnForbidden(apiList<ApiRequisition>('/requisitions/').then((rows) => rows.map(mapRequisition)), state.requisitions),
        retainOnForbidden(apiList<ApiAuditLog>('/audit-logs/').then((rows) => rows.map(mapAuditLog)), state.auditLogs),
        retainOnForbidden(apiList<ApiTransaction>('/transactions/').then((rows) => rows.map(mapTransaction)), state.transactions),
        retainOnForbidden(apiList<ApiReport>('/reports/').then((rows) => rows.map(mapReport)), state.reports),
        retainOnForbidden(apiList<ApiSystemSetting>('/system-settings/').then((rows) => rows.map(mapSetting)), state.systemSettings),
        retainOnForbidden(apiList<ApiComplianceItem>('/compliance-items/').then((rows) => rows.map(mapComplianceItem)), state.complianceItems),
      ]);

      set({
        users,
        donors,
        notifications,
        grants,
        budgetLines,
        projects,
        requisitions,
        auditLogs,
        transactions,
        reports,
        systemSettings,
        complianceItems,
        isLoading: false,
      });
    } catch (error) {
      set({ apiError: error instanceof Error ? error.message : 'Could not load backend data.', isLoading: false });
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

  createDonor: async (payload) => {
    const created = await apiRequest<ApiDonor>('/donors/', {
      method: 'POST',
      body: JSON.stringify({ ...payload, status: 'active', notes: 'Created from Register New Donor workflow.' }),
    });
    set((state) => ({ donors: [...state.donors, mapDonor(created)] }));
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

  generateReport: async (report_type, grant_id, _generated_by_user_id, format) => {
    const created = await apiRequest<ApiReport>('/reports/', {
      method: 'POST',
      body: JSON.stringify({ grant: grant_id, report_type, format }),
    });
    set((state) => ({ reports: [...state.reports, mapReport(created)] }));
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
