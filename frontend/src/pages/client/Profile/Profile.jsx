import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { IconUser, IconMail, IconPhone, IconMapPin, IconShieldLock, IconBuilding, IconEdit } from '@tabler/icons-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* Left Column - ID Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center relative pt-12 pb-8 px-6">
            <div className="absolute top-0 left-0 w-full h-24 bg-[#111111]">
              {/* Abstract Background pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f59e0b] via-transparent to-transparent"></div>
            </div>
            
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-white rounded-full p-1 mx-auto shadow-md relative z-10">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <IconUser size={48} stroke={1.5} />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white text-gray-700 hover:text-[#f59e0b] rounded-full shadow-sm border border-gray-100 transition-colors z-20">
                <IconEdit size={16} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'Client User'}</h2>
            <p className="text-sm font-medium text-[#f59e0b] uppercase tracking-wider mb-6">
              {user?.role?.replace('ROLE_', '') || 'CLIENT'}
            </p>
            
            <div className="border-t border-gray-100 pt-6 mt-2 space-y-4 text-left">
              <div className="flex items-start gap-3">
                <IconMail size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconBuilding size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Organization</p>
                  <p className="text-sm font-medium text-gray-900">AuctXI Elite Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">Personal Information</h3>
            
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name || 'Client User'}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'user@example.com'}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 py-2.5 px-4 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="Mumbai, India"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b] focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-[#111111] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#222222] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100 flex items-center gap-2">
              <IconShieldLock size={20} className="text-[#f59e0b]" />
              Security Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500 mt-0.5">Update your password to keep your account secure.</p>
                </div>
                <button className="text-sm font-medium text-[#f59e0b] hover:text-amber-600 px-3 py-1.5 rounded-lg border border-transparent hover:border-amber-100 hover:bg-amber-50 transition-colors">
                  Update
                </button>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-50 pt-4">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500 mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                  Not Enabled
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
