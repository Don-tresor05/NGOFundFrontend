import { create } from 'zustand';
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
  createUser: (payload: Omit<User, 'user_id' | 'created_at' | 'is_active'>) => void;
  updateSetting: (key: string, value: string) => void;
  createDonor: (payload: Omit<Donor, 'donor_id' | 'status' | 'notes'>) => void;
  createGrant: (payload: Omit<Grant, 'grant_id' | 'status' | 'compliance_notes'>) => void;
  createBudgetLine: (payload: Omit<BudgetLine, 'budget_line_id' | 'spent_amount'>) => void;
  createRequisition: (payload: Omit<Requisition, 'requisition_id' | 'status' | 'rejection_reason' | 'created_at'>) => void;
  approveRequisition: (id: number) => void;
  rejectRequisition: (id: number, reason: string) => void;
  recordTransaction: (payload: Omit<Transaction, 'transaction_id' | 'created_at'>) => void;
  reconcileTransaction: (id: number) => void;
  createAuditLog: (payload: Omit<AuditLog, 'log_id' | 'timestamp'>) => void;
  generateReport: (report_type: string, grant_id: number, generated_by_user_id: number, format: 'PDF' | 'Excel') => void;
  createNotification: (payload: Omit<Notification, 'notification_id' | 'created_at' | 'is_read'>) => void;
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: (userId: number) => void;
  updateProjectStatus: (projectId: number, status: Project['status']) => void;
  enforceBudgetLimit: (budgetLineId: number, amount: number) => boolean;
  toggleComplianceItem: (id: string) => void;
}

const today = '2026-05-26';

const nextId = <T extends object>(items: T[], key: keyof T) =>
  Math.max(0, ...items.map((item) => Number(item[key]) || 0)) + 1;

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: 'Super Administrator',
  FINANCE_OFFICER: 'Finance Officer',
  PROJECT_MANAGER: 'Project Manager',
  EXECUTIVE_DIRECTOR: 'Executive Director',
  FIELD_STAFF: 'Field Staff',
  EXTERNAL_AUDITOR: 'External Auditor',
  DONOR_USER: 'Donor User',
};

export const useAppDataStore = create<AppDataState>((set, get) => ({
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

  createUser: (payload) =>
    set((state) => ({
      users: [
        ...state.users,
        {
          user_id: nextId(state.users, 'user_id'),
          is_active: true,
          created_at: `${today} 09:00`,
          ...payload,
        },
      ],
    })),

  updateSetting: (key, value) =>
    set((state) => ({
      systemSettings: state.systemSettings.map((setting) =>
        setting.key === key ? { ...setting, value } : setting
      ),
    })),

  createDonor: (payload) =>
    set((state) => ({
      donors: [
        ...state.donors,
        {
          donor_id: nextId(state.donors, 'donor_id'),
          status: 'active',
          notes: 'Created from Register New Donor workflow.',
          ...payload,
        },
      ],
    })),

  createGrant: (payload) =>
    set((state) => ({
      grants: [
        ...state.grants,
        {
          grant_id: nextId(state.grants, 'grant_id'),
          status: 'active',
          compliance_notes: 'Generated from Record Fund Receipt workflow.',
          ...payload,
        },
      ],
    })),

  createBudgetLine: (payload) =>
    set((state) => ({
      budgetLines: [
        ...state.budgetLines,
        {
          budget_line_id: nextId(state.budgetLines, 'budget_line_id'),
          spent_amount: 0,
          ...payload,
        },
      ],
    })),

  createRequisition: (payload) =>
    set((state) => ({
      requisitions: [
        {
          requisition_id: nextId(state.requisitions, 'requisition_id'),
          status: 'pending',
          rejection_reason: '',
          created_at: `${today} 10:00`,
          ...payload,
        },
        ...state.requisitions,
      ],
    })),

  approveRequisition: (id) =>
    set((state) => ({
      requisitions: state.requisitions.map((requisition) =>
        requisition.requisition_id === id ? { ...requisition, status: 'approved', rejection_reason: '' } : requisition
      ),
    })),

  rejectRequisition: (id, reason) =>
    set((state) => ({
      requisitions: state.requisitions.map((requisition) =>
        requisition.requisition_id === id ? { ...requisition, status: 'rejected', rejection_reason: reason } : requisition
      ),
    })),

  recordTransaction: (payload) =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        {
          transaction_id: nextId(state.transactions, 'transaction_id'),
          created_at: `${today} 11:00`,
          ...payload,
        },
      ],
      budgetLines: state.budgetLines.map((budgetLine) =>
        budgetLine.budget_line_id === payload.budget_line_id
          ? { ...budgetLine, spent_amount: budgetLine.spent_amount + payload.amount }
          : budgetLine
      ),
    })),

  reconcileTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction.transaction_id === id && transaction.bank_reference_number === 'PENDING'
          ? { ...transaction, bank_reference_number: `BNK-${10000 + id}` }
          : transaction
      ),
    })),

  createAuditLog: (payload) =>
    set((state) => ({
      auditLogs: [
        {
          log_id: nextId(state.auditLogs, 'log_id'),
          timestamp: `${today} 11:00`,
          ...payload,
        },
        ...state.auditLogs,
      ],
    })),

  generateReport: (report_type, grant_id, generated_by_user_id, format) =>
    set((state) => ({
      reports: [
        ...state.reports,
        {
          report_id: nextId(state.reports, 'report_id'),
          grant_id,
          report_type,
          generated_by_user_id,
          format,
          file_url: `/reports/${report_type.toLowerCase().replace(/\s+/g, '-')}.${format === 'PDF' ? 'pdf' : 'xlsx'}`,
          created_at: `${today} 12:00`,
        },
      ],
    })),

  createNotification: (payload) =>
    set((state) => ({
      notifications: [
        {
          notification_id: nextId(state.notifications, 'notification_id'),
          is_read: false,
          created_at: `${today} 12:30`,
          ...payload,
        },
        ...state.notifications,
      ],
    })),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.notification_id === id ? { ...notification, is_read: true } : notification
      ),
    })),

  markAllNotificationsAsRead: (userId) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.user_id === userId ? { ...notification, is_read: true } : notification
      ),
    })),

  updateProjectStatus: (projectId, status) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.project_id === projectId ? { ...project, status } : project
      ),
    })),

  enforceBudgetLimit: (budgetLineId, amount) => {
    const budgetLine = get().budgetLines.find((line) => line.budget_line_id === budgetLineId);
    if (!budgetLine) {
      return false;
    }
    return budgetLine.spent_amount + amount <= budgetLine.allocated_amount;
  },

  toggleComplianceItem: (id) =>
    set((state) => ({
      complianceItems: state.complianceItems.map((item) =>
        item.id === id ? { ...item, verified: !item.verified } : item
      ),
    })),
}));
