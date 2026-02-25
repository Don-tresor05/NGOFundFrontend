import { create } from 'zustand';
import { UserRole, User } from '../types';

const defaultUsers: Record<UserRole, User> = {
  admin: {
    id: 'adm001',
    name: 'John Admin',
    email: 'admin@rpa.org',
    role: 'admin',
    avatarText: 'JA',
    badgeClass: 'admin-badge',
    badgeIcon: 'shield',
    stats: {
      totalUsers: '48',
      activeProjects: '12',
      pendingApprovals: '7',
      systemHealth: '98%',
      totalDonations: '$182,540',
      avgDonation: '$245',
      platformUptime: '99.9%',
      securityScore: 'A+',
    },
  },
  finance: {
    id: 'fin001',
    name: 'Michael Finance',
    email: 'finance@rpa.org',
    role: 'finance',
    avatarText: 'MF',
    badgeClass: 'finance-badge',
    badgeIcon: 'chart-line',
    stats: {
      totalFunds: '$182,540',
      monthlyExpenses: '$24,800',
      budgetUtilization: '78%',
      pendingTransactions: '12',
      auditCompliance: '100%',
      taxFilingStatus: 'Current',
      payrollProcessed: '$15,200',
      grantDisbursements: '$45,000',
    },
  },
  auditor: {
    id: 'aud001',
    name: 'Lisa Auditor',
    email: 'audit@rpa.org',
    role: 'auditor',
    avatarText: 'LA',
    badgeClass: 'auditor-badge',
    badgeIcon: 'search',
    stats: {
      auditsCompleted: '24',
      complianceRate: '96%',
      issuesFound: '3',
      riskLevel: 'Low',
      documentReviews: '142',
      auditTrails: '1,248',
      recommendations: '12',
      certificationStatus: 'Certified',
    },
  },
  donor: {
    id: 'don001',
    name: 'Sarah Donor',
    email: 'sarah.donor@email.com',
    role: 'donor',
    avatarText: 'SD',
    badgeClass: 'donor-badge',
    badgeIcon: 'heart',
    stats: {
      totalDonated: '$2,850',
      donationsCount: '14',
      activeSubscriptions: '3',
      impactScore: '8.7/10',
      favoriteProject: 'Child Vaccination',
      lastDonation: '$150',
      taxReceipts: '5',
      projectsSupported: '4',
    },
  },
  staff: {
    id: 'staff001',
    name: 'Staff Member',
    email: 'staff@rpa.org',
    role: 'staff',
    avatarText: 'SM',
    badgeClass: 'staff-badge',
    badgeIcon: 'user',
    stats: {},
  },
};

interface AuthState {
  currentUser: User;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  getCurrentUser: () => User;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: defaultUsers.admin,
  currentRole: 'admin',

  setCurrentRole: (role: UserRole) => {
    set({
      currentUser: defaultUsers[role],
      currentRole: role,
    });
  },

  getCurrentUser: () => {
    return get().currentUser;
  },
}));
