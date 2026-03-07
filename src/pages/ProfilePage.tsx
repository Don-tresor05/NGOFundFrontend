import React, { useState } from 'react';
import { Button } from '../components/Button';
import { User, Mail, Phone, MapPin, Save, Edit, Shield, Clock, Activity, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const ProfilePage: React.FC = () => {
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

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#dee2e6] mb-8">
        <h2 className="text-3xl font-bold text-[#212529] m-0">User Profile</h2>
        <p className="text-[#6c757d] text-sm mt-2">Manage your account settings and personal information</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#212529] m-0">Profile Information</h3>
          <Button 
            variant="outline" 
            icon={Edit} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-[#e9ecef] flex items-center justify-center text-[#212529] font-semibold text-4xl">
              {currentUser.avatarText}
            </div>
            <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#FF9800] rounded-full flex items-center justify-center text-white hover:bg-[#F57C00] transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-[#212529] mb-3">{formData.name}</h3>
            <p className="text-[#6c757d] mb-2 text-lg capitalize">{currentUser.role}</p>
            <p className="text-[#6c757d] text-lg">{formData.email}</p>
            <div className="mt-4">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-[rgba(76,175,80,0.15)] text-[#4CAF50]">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[rgba(255,152,0,0.1)] rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[#FF9800]" />
            </div>
            <h4 className="text-xl font-bold text-[#212529] m-0">Personal Information</h4>
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
                  className="w-full border border-[#dee2e6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9800]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-[#dee2e6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9800]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-[#dee2e6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9800]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-[#dee2e6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9800]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-[#dee2e6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9800] resize-none"
                />
              </div>
              <Button type="submit" icon={Save} className="w-full">
                Save Changes
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-[#6c757d]" />
                <div>
                  <p className="text-sm text-[#6c757d]">Email</p>
                  <p className="text-[#495057] font-medium">{formData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-[#6c757d]" />
                <div>
                  <p className="text-sm text-[#6c757d]">Phone</p>
                  <p className="text-[#495057] font-medium">{formData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-[#6c757d]" />
                <div>
                  <p className="text-sm text-[#6c757d]">Address</p>
                  <p className="text-[#495057] font-medium">{formData.address}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6c757d] mb-2">Bio</p>
                <p className="text-[#495057]">{formData.bio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Account Security Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[rgba(255,152,0,0.1)] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#FF9800]" />
            </div>
            <h4 className="text-xl font-bold text-[#212529] m-0">Account Security</h4>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#495057] font-medium">Password</p>
                <p className="text-sm text-[#6c757d]">Last changed 30 days ago</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#495057] font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-[#6c757d]">Extra security for your account</p>
              </div>
              <span className="text-[#4CAF50] text-sm font-semibold">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#495057] font-medium">Login Notifications</p>
                <p className="text-sm text-[#6c757d]">Get notified of new sign-ins</p>
              </div>
              <span className="text-[#4CAF50] text-sm font-semibold">Enabled</span>
            </div>
          </div>
        </div>

        {/* Activity Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[rgba(255,152,0,0.1)] rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#FF9800]" />
            </div>
            <h4 className="text-xl font-bold text-[#212529] m-0">Activity Summary</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#495057] font-medium">Last Login</span>
              <span className="text-[#6c757d]">Today, 2:30 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#495057] font-medium">Total Sessions</span>
              <span className="text-[#6c757d]">247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#495057] font-medium">Account Created</span>
              <span className="text-[#6c757d]">Jan 15, 2024</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#495057] font-medium">Profile Completion</span>
              <span className="text-[#4CAF50] font-semibold">95%</span>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[rgba(255,152,0,0.1)] rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#FF9800]" />
            </div>
            <h4 className="text-xl font-bold text-[#212529] m-0">Preferences</h4>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#495057] font-medium">Email Notifications</p>
                <p className="text-sm text-[#6c757d]">Receive updates via email</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-[#FF9800] rounded" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#495057] font-medium">SMS Notifications</p>
                <p className="text-sm text-[#6c757d]">Receive updates via SMS</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-[#FF9800] rounded" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#495057] font-medium">Dark Mode</p>
                <p className="text-sm text-[#6c757d]">Use dark theme</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-[#FF9800] rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};