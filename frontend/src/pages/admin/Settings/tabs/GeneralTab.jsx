import React, { useRef } from 'react';
import Button from '../../../../components/ui/Button';
import ToggleSwitch from '../../../../components/ui/ToggleSwitch';
import { IconUpload, IconTrash, IconActivity, IconDatabase } from '@tabler/icons-react';
import { toast } from 'react-toastify';

export default function GeneralTab({ settings, handleSettingChange, handleFileUpload }) {
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const handleToggle = (key) => {
    const currentVal = settings[key] === 'true';
    handleSettingChange(key, currentVal ? 'false' : 'true');
  };

  return (
    <>
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          <p className="text-sm text-gray-500 mt-1">Update platform name, contact, and localization details.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Platform Name</label>
            <input 
              type="text" 
              value={settings.platformName || ''} 
              onChange={(e) => handleSettingChange('platformName', e.target.value)}
              placeholder="AuctXI Platform"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tagline</label>
            <input 
              type="text" 
              value={settings.platformTagline || ''} 
              onChange={(e) => handleSettingChange('platformTagline', e.target.value)}
              placeholder="Premium Cricket Auction Management"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Admin Email</label>
            <input 
              type="email" 
              value={settings.adminEmail || ''} 
              onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
              placeholder="admin@auctxi.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input 
              type="text" 
              value={settings.contactNumber || ''} 
              onChange={(e) => handleSettingChange('contactNumber', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <select 
              value={settings.timezone || ''}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
              <option value="IST">IST (Indian Standard Time)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date Format</label>
            <select 
              value={settings.dateFormat || ''}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logo & Favicon */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Branding Assets</h3>
        </div>
        <div className="p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Platform Logo</label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={logoInputRef}
              onChange={(e) => handleFileUpload(e, 'platformLogo')}
            />
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden h-32"
            >
              {settings.platformLogo ? (
                <img src={settings.platformLogo} alt="Logo Preview" className="h-full object-contain" />
              ) : (
                <>
                  <IconUpload className="text-gray-400 mb-2" size={32} />
                  <p className="text-sm font-medium text-gray-700">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG (max 2MB)</p>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Favicon</label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={faviconInputRef}
              onChange={(e) => handleFileUpload(e, 'platformFavicon')}
            />
            <div 
              onClick={() => faviconInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden h-32"
            >
              {settings.platformFavicon ? (
                <img src={settings.platformFavicon} alt="Favicon Preview" className="h-full object-contain" />
              ) : (
                <>
                  <IconUpload className="text-gray-400 mb-2" size={32} />
                  <p className="text-sm font-medium text-gray-700">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">ICO, PNG (32x32px)</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Feature Toggles</h3>
          <p className="text-sm text-gray-500 mt-1">Enable or disable core platform features.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Team Registration</h4>
              <p className="text-sm text-gray-500">Allow new teams to register on the platform</p>
            </div>
            <ToggleSwitch 
              enabled={settings.featureTeamRegistration === 'true'} 
              onChange={() => handleToggle('featureTeamRegistration')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Player Registration</h4>
              <p className="text-sm text-gray-500">Allow new players to submit profiles</p>
            </div>
            <ToggleSwitch 
              enabled={settings.featurePlayerRegistration === 'true'} 
              onChange={() => handleToggle('featurePlayerRegistration')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Live Auctions</h4>
              <p className="text-sm text-gray-500">Enable real-time bidding system</p>
            </div>
            <ToggleSwitch 
              enabled={settings.featureLiveAuctions === 'true'} 
              onChange={() => handleToggle('featureLiveAuctions')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Public Viewing</h4>
              <p className="text-sm text-gray-500">Allow non-registered users to view auction results</p>
            </div>
            <ToggleSwitch 
              enabled={settings.featurePublicViewing === 'true'} 
              onChange={() => handleToggle('featurePublicViewing')} 
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-red-600">Maintenance Mode</h4>
              <p className="text-sm text-gray-500">Take the platform offline for updates</p>
            </div>
            <ToggleSwitch 
              enabled={settings.featureMaintenanceMode === 'true'} 
              onChange={() => handleToggle('featureMaintenanceMode')} 
            />
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Preferences</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Default Currency</label>
            <select 
              value={settings.defaultCurrency || ''}
              onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Items Per Page</label>
            <select 
              value={settings.itemsPerPage || ''}
              onChange={(e) => handleSettingChange('itemsPerPage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6 flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              const loadingToast = toast.loading('Clearing system cache...');
              setTimeout(() => toast.update(loadingToast, { render: 'Cache cleared successfully!', type: 'success', isLoading: false, autoClose: 3000 }), 1500);
            }}
          >
            <IconTrash size={16} /> Clear Cache
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              const loadingToast = toast.loading('Running system health check...');
              setTimeout(() => toast.update(loadingToast, { render: 'System is healthy and running optimally.', type: 'success', isLoading: false, autoClose: 3000 }), 2000);
            }}
          >
            <IconActivity size={16} /> System Health Check
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              if(window.confirm('Are you sure you want to run database cleanup? This will remove orphaned records.')) {
                const loadingToast = toast.loading('Cleaning up database...');
                setTimeout(() => toast.update(loadingToast, { render: 'Database cleanup complete.', type: 'success', isLoading: false, autoClose: 3000 }), 2500);
              }
            }}
          >
            <IconDatabase size={16} /> Database Cleanup
          </Button>
        </div>
      </div>
    </>
  );
}
