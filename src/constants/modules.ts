import { Module } from '../types';
import { 
  Gauge, 
  Users, 
  DollarSign, 
  FolderKanban, 
  PieChart, 
  ClipboardList, 
  FlaskConical, 
  UserCog, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';

export const ADMIN_MODULES: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: Gauge,
    path: '/dashboard',
    roles: ['admin'],
  },
  {
    id: 'donor-management',
    name: 'Donor Management',
    icon: Users,
    path: '/donor-management',
    roles: ['admin'],
  },
  {
    id: 'fund-tracking',
    name: 'Fund Tracking',
    icon: DollarSign,
    path: '/fund-tracking',
    roles: ['admin'],
  },
  {
    id: 'project-allocation',
    name: 'Project Allocation',
    icon: FolderKanban,
    path: '/project-allocation',
    roles: ['admin'],
  },
  {
    id: 'expenditure-monitoring',
    name: 'Expenditure Monitoring',
    icon: PieChart,
    path: '/expenditure-monitoring',
    roles: ['admin'],
  },
  {
    id: 'staff-operations',
    name: 'Staff & Operations',
    icon: ClipboardList,
    path: '/staff-operations',
    roles: ['admin'],
  },
  {
    id: 'testing-validation',
    name: 'Testing & Validation',
    icon: FlaskConical,
    path: '/testing-validation',
    roles: ['admin'],
  },
  {
    id: 'user-management',
    name: 'User Management',
    icon: UserCog,
    path: '/user-management',
    roles: ['admin'],
  },
  {
    id: 'reports-analytics',
    name: 'Reports & Analytics',
    icon: BarChart3,
    path: '/reports-analytics',
    roles: ['admin'],
  },
  {
    id: 'audit-compliance',
    name: 'Audit & Compliance',
    icon: ShieldCheck,
    path: '/audit-compliance',
    roles: ['admin'],
  },
];
