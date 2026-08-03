import React from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import { IconUser, IconMail, IconPhone, IconMapPin, IconShield, IconDeviceFloppy, IconCamera } from '@tabler/icons-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your personal information and preferences"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-700 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-amber-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                AD
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-amber-600 shadow-sm transition-colors">
                <IconCamera size={16} />
              </button>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <IconShield size={14} /> Super Admin
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-16 p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin User</h2>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <IconMapPin size={16} /> New York, USA
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <IconDeviceFloppy size={18} /> Save Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconUser size={18} className="text-gray-400" />
                      </div>
                      <input type="text" defaultValue="Admin User" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconMail size={18} className="text-gray-400" />
                      </div>
                      <input type="email" defaultValue="admin@auctxi.com" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-gray-500" readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconPhone size={18} className="text-gray-400" />
                      </div>
                      <input type="text" defaultValue="+1 (555) 019-2834" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Security & Preferences</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" placeholder="Leave blank to keep current" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-xs text-gray-500 mt-1">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" className="text-sm h-8 py-0">Enable 2FA</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
