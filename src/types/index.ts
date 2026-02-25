export type UserRole = 'admin' | 'finance' | 'auditor' | 'donor' | 'staff';

export interface UserStats {
  [key: string]: string | number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarText: string;
  badgeClass: string;
  badgeIcon: string;
  stats: UserStats;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  path: string;
  roles: UserRole[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'cleared' | 'reconciled' | 'failed';
}

export interface Project {
  id: string;
  name: string;
  category: string;
  budget: number;
  allocated: number;
  utilized: number;
  startDate: string;
  endDate: string;
  disbursement: number;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  type: 'individual' | 'corporate';
  totalDonated: number;
  lastDonation: string;
  status: 'active' | 'inactive';
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submittedBy: string;
}

export interface AuditTrail {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  ip: string;
}

export interface TestCase {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'testing' | 'done';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  module: string;
  status: string;
  assignedTo: string;
}

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface DashboardStats {
  [key: string]: {
    value: string | number;
    icon: string;
    trend: string;
    trendDirection: 'up' | 'down';
  };
}
