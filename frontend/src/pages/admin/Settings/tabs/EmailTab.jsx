import React from 'react';

export default function EmailTab({ settings, handleSettingChange }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">SMTP Configuration</h3>
          <p className="text-sm text-gray-500 mt-1">Configure email delivery settings for system notifications.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
            <input 
              type="text" 
              value={settings.smtpHost || ''} 
              onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
              placeholder="smtp.mailgun.org"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
            <input 
              type="text" 
              value={settings.smtpPort || ''} 
              onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
              placeholder="587"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
            <input 
              type="text" 
              value={settings.smtpUsername || ''} 
              onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
            <input 
              type="password" 
              value={settings.smtpPassword || ''} 
              onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Sender Name</label>
            <input 
              type="text" 
              value={settings.emailSenderName || ''} 
              onChange={(e) => handleSettingChange('emailSenderName', e.target.value)}
              placeholder="AuctXI Admin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Sender Email</label>
            <input 
              type="email" 
              value={settings.emailSenderAddress || ''} 
              onChange={(e) => handleSettingChange('emailSenderAddress', e.target.value)}
              placeholder="noreply@auctxi.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
