import React from 'react';
import ToggleSwitch from '../../../../components/ui/ToggleSwitch';

export default function PaymentTab({ settings, handleSettingChange }) {
  const handleToggle = (key) => {
    const currentVal = settings[key] === 'true';
    handleSettingChange(key, currentVal ? 'false' : 'true');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment Gateway Integration</h3>
          <p className="text-sm text-gray-500 mt-1">Configure Stripe or Razorpay credentials for team registration fees.</p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Active Gateway</label>
            <select 
              value={settings.paymentGateway || 'stripe'}
              onChange={(e) => handleSettingChange('paymentGateway', e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="stripe">Stripe</option>
              <option value="razorpay">Razorpay</option>
              <option value="offline">Offline / Manual Approval</option>
            </select>
          </div>
          
          {(settings.paymentGateway || 'stripe') === 'stripe' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Stripe Public Key</label>
                <input 
                  type="text" 
                  value={settings.stripePublicKey || ''} 
                  onChange={(e) => handleSettingChange('stripePublicKey', e.target.value)}
                  placeholder="pk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Stripe Secret Key</label>
                <input 
                  type="password" 
                  value={settings.stripeSecretKey || ''} 
                  onChange={(e) => handleSettingChange('stripeSecretKey', e.target.value)}
                  placeholder="sk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
                />
              </div>
            </div>
          )}

          {(settings.paymentGateway || 'stripe') === 'razorpay' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Razorpay Key ID</label>
                <input 
                  type="text" 
                  value={settings.razorpayKeyId || ''} 
                  onChange={(e) => handleSettingChange('razorpayKeyId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Razorpay Key Secret</label>
                <input 
                  type="password" 
                  value={settings.razorpayKeySecret || ''} 
                  onChange={(e) => handleSettingChange('razorpayKeySecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment Features</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Require Registration Fee</h4>
              <p className="text-sm text-gray-500">Force teams to pay a fee before their registration is approved</p>
            </div>
            <ToggleSwitch 
              enabled={settings.featureRequireFee === 'true'} 
              onChange={() => handleToggle('featureRequireFee')} 
            />
          </div>
          {settings.featureRequireFee === 'true' && (
            <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700">Registration Fee Amount (₹)</label>
              <input 
                type="number" 
                value={settings.registrationFeeAmount || '1000'} 
                onChange={(e) => handleSettingChange('registrationFeeAmount', e.target.value)}
                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
