import React from 'react';
import ToggleSwitch from '../../../../components/ui/ToggleSwitch';

export default function NotificationTab({ settings, handleSettingChange }) {
  const handleToggle = (key) => {
    const currentVal = settings[key] === 'true';
    handleSettingChange(key, currentVal ? 'false' : 'true');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-500 mt-1">Configure automated notifications sent to users.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Welcome Emails</h4>
              <p className="text-sm text-gray-500">Send an email when a new team or player registers</p>
            </div>
            <ToggleSwitch 
              enabled={settings.notifyWelcomeEmail === 'true'} 
              onChange={() => handleToggle('notifyWelcomeEmail')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auction Start Reminders</h4>
              <p className="text-sm text-gray-500">Send an email 24 hours before an auction starts</p>
            </div>
            <ToggleSwitch 
              enabled={settings.notifyAuctionStart === 'true'} 
              onChange={() => handleToggle('notifyAuctionStart')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Bid Won Notifications</h4>
              <p className="text-sm text-gray-500">Notify the winning team via email immediately</p>
            </div>
            <ToggleSwitch 
              enabled={settings.notifyBidWon === 'true'} 
              onChange={() => handleToggle('notifyBidWon')} 
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">SMS Gateway Configuration</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">SMS Provider</label>
            <select 
              value={settings.smsProvider || 'none'}
              onChange={(e) => handleSettingChange('smsProvider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="none">None (Disabled)</option>
              <option value="twilio">Twilio</option>
              <option value="msg91">MSG91</option>
            </select>
          </div>
          
          {settings.smsProvider && settings.smsProvider !== 'none' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input 
                  type="password" 
                  value={settings.smsApiKey || ''} 
                  onChange={(e) => handleSettingChange('smsApiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sender ID</label>
                <input 
                  type="text" 
                  value={settings.smsSenderId || ''} 
                  onChange={(e) => handleSettingChange('smsSenderId', e.target.value)}
                  placeholder="AUCTXI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
