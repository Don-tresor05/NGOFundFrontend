import { Module } from '../types';

export const ADMIN_MODULES: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
    roles: ['admin'],
  },
  {
    id: 'donor-management',
    name: 'Donor Management',
    icon: '👥',
    path: '/donor-management',
    roles: ['admin'],
  },
  {
    id: 'fund-tracking',
    name: 'Fund Tracking',
    icon: '💰',
    path: '/fund-tracking',
    roles: ['admin'],
  },
  {
    id: 'project-allocation',
    name: 'Project Allocation',
    icon: '📑',
    path: '/project-allocation',
    roles: ['admin'],
  },
  {
    id: 'expenditure-monitoring',
    name: 'Expenditure Monitoring',
    icon: '📊',
    path: '/expenditure-monitoring',
    roles: ['admin'],
  },
  {
    id: 'staff-operations',
    name: 'Staff & Operations',
    icon: '📋',
    path: '/staff-operations',
    roles: ['admin'],
  },
  {
    id: 'testing-validation',
    name: 'Testing & Validation',
    icon: '🧪',
    path: '/testing-validation',
    roles: ['admin'],
  },
  {
    id: 'user-management',
    name: 'User Management',
    icon: '⚙️',
    path: '/user-management',
    roles: ['admin'],
  },
  {
    id: 'reports-analytics',
    name: 'Reports & Analytics',
    icon: '📈',
    path: '/reports-analytics',
    roles: ['admin'],
  },
  {
    id: 'audit-compliance',
    name: 'Audit & Compliance',
    icon: '🔒',
    path: '/audit-compliance',
    roles: ['admin'],
  },
];
