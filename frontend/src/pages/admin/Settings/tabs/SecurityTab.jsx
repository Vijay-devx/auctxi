import React from 'react';
import ToggleSwitch from '../../../../components/ui/ToggleSwitch';

export default function SecurityTab({ settings, handleSettingChange }) {
  const handleToggle = (key) => {
    const currentVal = settings[key] === 'true';
    handleSettingChange(key, currentVal ? 'false' : 'true');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Authentication & Access</h3>
          <p className="text-sm text-gray-500 mt-1">Configure security policies for platform users.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Enforce Two-Factor Authentication (2FA)</h4>
              <p className="text-sm text-gray-500">Require all Admin and Manager accounts to use 2FA</p>
            </div>
            <ToggleSwitch 
              enabled={settings.securityRequire2FA === 'true'} 
              onChange={() => handleToggle('securityRequire2FA')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Strong Password Policy</h4>
              <p className="text-sm text-gray-500">Require 8+ chars, numbers, and special characters</p>
            </div>
            <ToggleSwitch 
              enabled={settings.securityStrongPasswords === 'true'} 
              onChange={() => handleToggle('securityStrongPasswords')} 
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Session Timeout (Minutes)</h4>
              <p className="text-sm text-gray-500">Auto-logout idle users after this duration</p>
            </div>
            <input 
              type="number" 
              value={settings.securitySessionTimeout || '60'} 
              onChange={(e) => handleSettingChange('securitySessionTimeout', e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">IP Whitelisting</h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Allowed Admin IPs (Comma separated)</label>
            <textarea 
              value={settings.securityAllowedIps || ''} 
              onChange={(e) => handleSettingChange('securityAllowedIps', e.target.value)}
              placeholder="e.g., 192.168.1.1, 10.0.0.0/24 (Leave blank to allow all)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
