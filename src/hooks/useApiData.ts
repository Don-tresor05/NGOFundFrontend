import { useEffect, useState } from 'react';
import { apiList } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { 
  Donor, 
  Grant, 
  Project, 
  Transaction, 
  Requisition,
  BudgetLine,
  User,
  Report,
  BankAccount,
  AuditLog
} from '../types';

const useCurrentActor = () => useAuthStore((state) => state.currentProfile?.actor);

const canAccessAdminData = (actor?: string | null) => actor === 'super_administrator';
const canAccessComplianceData = (actor?: string | null) => actor === 'super_administrator' || actor === 'external_auditor' || actor === 'executive_director' || actor === 'finance_officer';
const canAccessTestingData = (actor?: string | null) => actor === 'super_administrator' || actor === 'external_auditor' || actor === 'executive_director' || actor === 'project_manager';
const canAccessOperationalData = (actor?: string | null) => actor === 'super_administrator' || actor === 'external_auditor' || actor === 'executive_director' || actor === 'project_manager' || actor === 'field_staff' || actor === 'finance_officer';

export function useDonors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<Donor>('/donors/')
      .then(data => setDonors(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { donors, loading, error, refresh: () => setLoading(true) };
}

export function useGrants() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<Grant>('/grants/')
      .then(data => setGrants(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { grants, loading, error, refresh: () => setLoading(true) };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<Project>('/projects/')
      .then(data => setProjects(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error, refresh: () => setLoading(true) };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<Transaction>('/transactions/')
      .then(data => setTransactions(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { transactions, loading, error, refresh: () => setLoading(true) };
}

export function useRequisitions() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<Requisition>('/requisitions/')
      .then(data => setRequisitions(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { requisitions, loading, error, refresh: () => setLoading(true) };
}

export function useBudgetLines() {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<BudgetLine>('/budget-lines/')
      .then(data => setBudgetLines(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { budgetLines, loading, error, refresh: () => setLoading(true) };
}

export function useUsers() {
  const actor = useCurrentActor();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canAccessAdminData(actor)) {
      setUsers([]);
      setLoading(false);
      return;
    }
    apiList<User>('/users/')
      .then(data => setUsers(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [actor]);

  return { users, loading, error, refresh: () => setLoading(true) };
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<Report>('/reports/')
      .then(data => setReports(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { reports, loading, error, refresh: () => setLoading(true) };
}

export function useBankAccounts() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<BankAccount>('/bank-accounts/')
      .then(data => setBankAccounts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { bankAccounts, loading, error, refresh: () => setLoading(true) };
}

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiList<AuditLog>('/audit-logs/')
      .then(data => setAuditLogs(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { auditLogs, loading, error, refresh: () => setLoading(true) };
}

// Additional entities for full coverage
export function useReportSchedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiList('/report-schedules/')
      .then(data => setSchedules(data))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, []);
  
  return { schedules, loading };
}

export function useReportDeliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiList('/report-deliveries/')
      .then(data => setDeliveries(data))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);
  
  return { deliveries, loading };
}

export function useReconciliations() {
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiList('/reconciliations/')
      .then(data => setReconciliations(data))
      .catch(() => setReconciliations([]))
      .finally(() => setLoading(false));
  }, []);
  
  return { reconciliations, loading };
}

export function useBankStatementLines() {
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiList('/bank-statement-lines/')
      .then(data => setLines(data))
      .catch(() => setLines([]))
      .finally(() => setLoading(false));
  }, []);
  
  return { lines, loading };
}

export function useComplianceItems() {
  const actor = useCurrentActor();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!canAccessComplianceData(actor)) {
      setItems([]);
      setLoading(false);
      return;
    }
    apiList('/compliance-items/')
      .then(data => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [actor]);
  
  return { items, loading };
}

export function useDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiList('/documents/')
      .then(data => setDocuments(data))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, []);
  
  return { documents, loading };
}

export function useStaffRequirements() {
  const actor = useCurrentActor();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!canAccessTestingData(actor)) {
      setRequirements([]);
      setLoading(false);
      return;
    }
    apiList('/staff-requirements/')
      .then(data => setRequirements(data))
      .catch(() => setRequirements([]))
      .finally(() => setLoading(false));
  }, [actor]);
  
  return { requirements, loading };
}

export function useTestCases() {
  const actor = useCurrentActor();
  const [testCases, setTestCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!canAccessTestingData(actor)) {
      setTestCases([]);
      setLoading(false);
      return;
    }
    apiList('/test-cases/')
      .then(data => setTestCases(data))
      .catch(() => setTestCases([]))
      .finally(() => setLoading(false));
  }, [actor]);
  
  return { testCases, loading };
}

export function useRolePermissions() {
  const actor = useCurrentActor();
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!canAccessAdminData(actor)) {
      setRolePermissions([]);
      setLoading(false);
      return;
    }
    apiList('/role-permissions/')
      .then(data => setRolePermissions(data))
      .catch(() => setRolePermissions([]))
      .finally(() => setLoading(false));
  }, [actor]);
  
  return { rolePermissions, loading };
}

export function useBugReports() {
  const actor = useCurrentActor();
  const [bugReports, setBugReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!canAccessTestingData(actor)) {
      setBugReports([]);
      setLoading(false);
      return;
    }
    apiList('/bug-reports/')
      .then(data => setBugReports(data))
      .catch(() => setBugReports([]))
      .finally(() => setLoading(false));
  }, [actor]);
  
  return { bugReports, loading };
}

export function useUATFeedback() {
  const actor = useCurrentActor();
  const [uatFeedback, setUATFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!canAccessTestingData(actor)) {
      setUATFeedback([]);
      setLoading(false);
      return;
    }
    apiList('/uat-feedback/')
      .then(data => setUATFeedback(data))
      .catch(() => setUATFeedback([]))
      .finally(() => setLoading(false));
  }, [actor]);
  
  return { uatFeedback, loading };
}

export function useReleaseNotes() {
  const actor = useCurrentActor();
  const [releaseNotes, setReleaseNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!canAccessTestingData(actor)) {
      setReleaseNotes([]);
      setLoading(false);
      return;
    }
    apiList('/release-notes/')
      .then(data => setReleaseNotes(data))
      .catch(() => setReleaseNotes([]))
      .finally(() => setLoading(false));
  }, [actor]);
  
  return { releaseNotes, loading };
}

export function useExpenseApprovals() {
  const [expenseApprovals, setExpenseApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiList('/expense-approvals/')
      .then(data => setExpenseApprovals(data))
      .catch(() => setExpenseApprovals([]))
      .finally(() => setLoading(false));
  }, []);
  
  return { expenseApprovals, loading };
}

export function useReallocationRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiList('/reallocation-requests/')
      .then(data => setRequests(data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);
  
  return { requests, loading };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiList('/notifications/')
      .then(data => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);
  
  return { notifications, loading };
}

export function useProcessDocuments() {
  const actor = useCurrentActor();
  const [processDocuments, setProcessDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!canAccessOperationalData(actor)) {
      setProcessDocuments([]);
      setLoading(false);
      return;
    }
    apiList('/process-documents/')
      .then(data => setProcessDocuments(data))
      .catch(() => setProcessDocuments([]))
      .finally(() => setLoading(false));
  }, [actor]);
  
  return { processDocuments, loading };
}
