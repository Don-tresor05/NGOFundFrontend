import React from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { X } from 'lucide-react';

interface UserSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_CONFIG: Record<UserRole, { title: string; description: string; features: string[]; icon: string; color: string }> = {
  admin: {
    title: 'Admin Dashboard',
    description: 'System Administrator',
    features: ['User Management', 'System Settings', 'Audit Logs', 'Full Access'],
    icon: '🛡️',
    color: 'bg-[#FF9800]',
  },
  finance: {
    title: 'Finance Dashboard',
    description: 'Financial Operations',
    features: ['Fund Management', 'Expense Tracking', 'Budget Reports', 'Transaction Processing'],
    icon: '📈',
    color: 'bg-[#2196F3]',
  },
  auditor: {
    title: 'Auditor Dashboard',
    description: 'Compliance & Audit',
    features: ['Audit Trails', 'Compliance Checks', 'Report Verification', 'Risk Assessment'],
    icon: '🔍',
    color: 'bg-[#9C27B0]',
  },
  donor: {
    title: 'Donor Dashboard',
    description: 'Public Donor Interface',
    features: ['Donation History', 'Impact Tracking', 'Project Updates', 'Tax Receipts'],
    icon: '❤️',
    color: 'bg-[#4CAF50]',
  },
  staff: {
    title: 'Staff Portal',
    description: 'Staff Access',
    features: ['Task Management', 'Announcements', 'Support', 'Information'],
    icon: '👤',
    color: 'bg-[#607D8B]',
  },
};

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ isOpen, onClose }) => {
  const { setCurrentRole, currentRole } = useAuthStore();

  const handleSwitchRole = (role: UserRole) => {
    setCurrentRole(role);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl animate-in">
        {/* Header */}
        <div className="bg-[#1a1a2e] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <h3 className="text-2xl text-white m-0">Switch User Role</h3>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG.admin][]).map(([role, config]) => (
              <button
                key={role}
                onClick={() => handleSwitchRole(role)}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  currentRole === role
                    ? 'border-[#FFC857] bg-[rgba(255,200,87,0.05)]'
                    : 'border-[#dee2e6] hover:border-[#FFC857] hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center text-xl text-white`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-[#212529] m-0">{config.title}</h4>
                    <p className="text-sm text-[#6c757d] m-0">{config.description}</p>
                  </div>
                </div>
                <p className="text-sm text-[#6c757d] mb-3">
                  {config.features.slice(0, 2).join(', ')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {config.features.map((feature) => (
                    <span key={feature} className="bg-[#e9ecef] text-[#495057] px-2 py-1 rounded-full text-xs font-medium">
                      {feature}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
