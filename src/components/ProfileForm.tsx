import React, { useState } from 'react';
import { Button } from './Button';
import { X, User, Mail, Phone, MapPin, Save, Edit, Shield, Clock, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email || 'admin@rpa.org',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345',
    bio: 'Experienced administrator with 5+ years in NGO management.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-[#dee2e6] sticky top-0 bg-white">
          <h3 className="text-2xl font-bold text-[#212529] m-0">User Profile</h3>
          <button onClick={onClose} className="text-[#6c757d] hover:text-[#212529]">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Profile Header Card */}
          <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-[#212529] m-0">Profile Information</h4>
              <Button 
                variant="outline" 
                icon={Edit} 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#e9ecef] flex items-center justify-center text-[#212529] font-semibold text-3xl">
                {currentUser.avatarText}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#212529] mb-2">{formData.name}</h3>
                <p className="text-[#6c757d] mb-1 capitalize">{currentUser.role}</p>
                <p className="text-[#6c757d]">{formData.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#FF9800]" />
                <h4 className="text-lg font-bold text-[#212529] m-0">Personal Information</h4>
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9800]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9800]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9800]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border border-[#dee2e6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9800]"
                    />
                  </div>
                  <Button type="submit" icon={Save} className="w-full">
                    Save Changes
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#6c757d]" />
                    <span className="text-[#495057]">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#6c757d]" />
                    <span className="text-[#495057]">{formData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#6c757d]" />
                    <span className="text-[#495057]">{formData.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Account Security Card */}
            <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#FF9800]" />
                <h4 className="text-lg font-bold text-[#212529] m-0">Account Security</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#495057]">Password</span>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#495057]">Two-Factor Authentication</span>
                  <span className="text-[#4CAF50] text-sm font-semibold">Enabled</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#495057]">Login Notifications</span>
                  <span className="text-[#4CAF50] text-sm font-semibold">Enabled</span>
                </div>
              </div>
            </div>

            {/* Activity Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[#FF9800]" />
                <h4 className="text-lg font-bold text-[#212529] m-0">Activity Summary</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#495057]">Last Login</span>
                  <span className="text-[#6c757d] text-sm">Today, 2:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#495057]">Total Sessions</span>
                  <span className="text-[#6c757d] text-sm">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#495057]">Account Created</span>
                  <span className="text-[#6c757d] text-sm">Jan 15, 2024</span>
                </div>
              </div>
            </div>

            {/* Preferences Card */}
            <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#FF9800]" />
                <h4 className="text-lg font-bold text-[#212529] m-0">Preferences</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#495057]">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#FF9800] rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#495057]">SMS Notifications</span>
                  <input type="checkbox" className="w-4 h-4 text-[#FF9800] rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#495057]">Dark Mode</span>
                  <input type="checkbox" className="w-4 h-4 text-[#FF9800] rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};