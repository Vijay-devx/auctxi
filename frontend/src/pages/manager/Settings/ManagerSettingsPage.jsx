import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';
import { cn } from '../../../utils/cn';
import { 
  IconSettings, IconGavel, IconBell, IconShieldLock, IconDeviceFloppy
} from '@tabler/icons-react';

const tabs = [
  { id: 'general', label: 'General', icon: <IconSettings size={20} /> },
  { id: 'auction', label: 'Auction Default Rules', icon: <IconGavel size={20} /> },
  { id: 'notification', label: 'Notification Preferences', icon: <IconBell size={20} /> },
  { id: 'security', label: 'Security Settings', icon: <IconShieldLock size={20} /> }
];

export default function ManagerSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [features, setFeatures] = useState({
    emailAlerts: true,
    smsAlerts: false,
    autoApproveTeams: false,
    publicAuctions: true
  });

  const handleSave = () => {
    console.log('Saving manager settings...');
  };

  const handleToggle = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manager Settings" 
        description="Manage your auction manager preferences and defaults"
        actionLabel="Save Changes"
        onAction={handleSave}
        actionIcon={IconDeviceFloppy}
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  activeTab === tab.id 
                    ? "bg-black text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className={activeTab === tab.id ? "text-amber-500" : "text-gray-500"}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <>
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Dashboard Preferences</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>EST (Eastern Standard Time)</option>
                      <option>IST (Indian Standard Time)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Items Per Page</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Feature Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Automation & Visibility</h3>
                  <p className="text-sm text-gray-500 mt-1">Configure default behaviors for your auctions.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Auto-Approve Teams</h4>
                      <p className="text-sm text-gray-500">Automatically accept team applications</p>
                    </div>
                    <ToggleSwitch 
                      checked={features.autoApproveTeams} 
                      onChange={() => handleToggle('autoApproveTeams')} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Public Auctions</h4>
                      <p className="text-sm text-gray-500">List created auctions in the public directory by default</p>
                    </div>
                    <ToggleSwitch 
                      checked={features.publicAuctions} 
                      onChange={() => handleToggle('publicAuctions')} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500 flex flex-col items-center">
              <IconSettings className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">{tabs.find(t => t.id === activeTab)?.label} Settings</h3>
              <p>Configuration options for this module are coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
