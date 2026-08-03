import React, { useState } from 'react';
import Button from '../../../../components/ui/Button';
import { IconDatabaseExport, IconDatabaseImport, IconClock } from '@tabler/icons-react';
import { toast } from 'react-toastify';

export default function BackupTab({ settings, handleSettingChange }) {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleManualBackup = () => {
    setIsBackingUp(true);
    // Simulate backup delay
    setTimeout(() => {
      setIsBackingUp(false);
      toast.success('Database backup created successfully!');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Automated Backups</h3>
          <p className="text-sm text-gray-500 mt-1">Configure automated daily or weekly backups.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Backup Frequency</label>
            <select 
              value={settings.backupFrequency || 'daily'}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="none">Disabled</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Retention Period</label>
            <select 
              value={settings.backupRetention || '30'}
              onChange={(e) => handleSettingChange('backupRetention', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Manual Actions</h3>
        </div>
        <div className="p-6 flex flex-col md:flex-row gap-4">
          <Button 
            onClick={handleManualBackup} 
            disabled={isBackingUp}
            className="flex items-center gap-2"
          >
            {isBackingUp ? <IconClock size={16} className="animate-spin" /> : <IconDatabaseExport size={16} />}
            {isBackingUp ? 'Creating Backup...' : 'Create Manual Backup'}
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <IconDatabaseImport size={16} /> Restore from Backup
          </Button>
        </div>
      </div>
    </div>
  );
}
