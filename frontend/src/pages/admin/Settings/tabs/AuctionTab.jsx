import React from 'react';
import ToggleSwitch from '../../../../components/ui/ToggleSwitch';

export default function AuctionTab({ settings, handleSettingChange }) {
  const handleToggle = (key) => {
    const currentVal = settings[key] === 'true';
    handleSettingChange(key, currentVal ? 'false' : 'true');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bidding Rules</h3>
          <p className="text-sm text-gray-500 mt-1">Configure default bidding timers and logic.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Default Bid Timer (Seconds)</label>
            <input 
              type="number" 
              value={settings.auctionDefaultTimer || '30'} 
              onChange={(e) => handleSettingChange('auctionDefaultTimer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Timer Extension (Seconds)</label>
            <input 
              type="number" 
              value={settings.auctionTimerExtension || '10'} 
              onChange={(e) => handleSettingChange('auctionTimerExtension', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Minimum Bid Increment (₹)</label>
            <input 
              type="number" 
              value={settings.auctionMinIncrement || '500000'} 
              onChange={(e) => handleSettingChange('auctionMinIncrement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Auction Features</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-extend Timer</h4>
              <p className="text-sm text-gray-500">Automatically extend the timer if a bid is placed in the last few seconds</p>
            </div>
            <ToggleSwitch 
              enabled={settings.featureAutoExtend === 'true'} 
              onChange={() => handleToggle('featureAutoExtend')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Unsold Player Recirculation</h4>
              <p className="text-sm text-gray-500">Allow unsold players to automatically re-enter the pool at the end</p>
            </div>
            <ToggleSwitch 
              enabled={settings.featureRecirculation === 'true'} 
              onChange={() => handleToggle('featureRecirculation')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
