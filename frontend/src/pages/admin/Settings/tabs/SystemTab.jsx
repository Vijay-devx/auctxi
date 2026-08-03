import React from 'react';
import ToggleSwitch from '../../../../components/ui/ToggleSwitch';

export default function SystemTab({ settings, handleSettingChange }) {
  const handleToggle = (key) => {
    const currentVal = settings[key] === 'true';
    handleSettingChange(key, currentVal ? 'false' : 'true');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Optimization</h3>
          <p className="text-sm text-gray-500 mt-1">Configure performance and caching settings.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Enable Redis Caching</h4>
              <p className="text-sm text-gray-500">Cache frequently accessed data to improve load times</p>
            </div>
            <ToggleSwitch 
              enabled={settings.sysEnableCache === 'true'} 
              onChange={() => handleToggle('sysEnableCache')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Debug Mode</h4>
              <p className="text-sm text-gray-500">Log detailed error traces (Not recommended in production)</p>
            </div>
            <ToggleSwitch 
              enabled={settings.sysDebugMode === 'true'} 
              onChange={() => handleToggle('sysDebugMode')} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">API Limits & Rate Limiting</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Max API Requests Per Minute (Per IP)</label>
            <input 
              type="number" 
              value={settings.sysRateLimit || '100'} 
              onChange={(e) => handleSettingChange('sysRateLimit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Max Upload Size (MB)</label>
            <input 
              type="number" 
              value={settings.sysMaxUploadSize || '5'} 
              onChange={(e) => handleSettingChange('sysMaxUploadSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
