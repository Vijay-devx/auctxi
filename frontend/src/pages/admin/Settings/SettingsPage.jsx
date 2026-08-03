import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import { cn } from '../../../utils/cn';
import { 
  IconSettings, IconGavel, IconCreditCard, IconMail, 
  IconBell, IconShieldLock, IconServer, IconDatabase, 
  IconActivity, IconDeviceFloppy
} from '@tabler/icons-react';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

// Import Tabs
import GeneralTab from './tabs/GeneralTab';
import AuctionTab from './tabs/AuctionTab';
import PaymentTab from './tabs/PaymentTab';
import EmailTab from './tabs/EmailTab';
import NotificationTab from './tabs/NotificationTab';
import SecurityTab from './tabs/SecurityTab';
import SystemTab from './tabs/SystemTab';
import BackupTab from './tabs/BackupTab';
import LogsTab from './tabs/LogsTab';

const tabs = [
  { id: 'general', label: 'General', icon: <IconSettings size={20} />, component: GeneralTab },
  { id: 'auction', label: 'Auction', icon: <IconGavel size={20} />, component: AuctionTab },
  { id: 'payment', label: 'Payment', icon: <IconCreditCard size={20} />, component: PaymentTab },
  { id: 'email', label: 'Email', icon: <IconMail size={20} />, component: EmailTab },
  { id: 'notification', label: 'Notification', icon: <IconBell size={20} />, component: NotificationTab },
  { id: 'security', label: 'Security', icon: <IconShieldLock size={20} />, component: SecurityTab },
  { id: 'system', label: 'System', icon: <IconServer size={20} />, component: SystemTab },
  { id: 'backup', label: 'Backup & Restore', icon: <IconDatabase size={20} />, component: BackupTab },
  { id: 'logs', label: 'Activity Logs', icon: <IconActivity size={20} />, component: LogsTab }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [modifiedKeys, setModifiedKeys] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/v1/settings');
        const fetched = {};
        response.data.forEach(s => {
          fetched[s.settingKey] = s.settingValue;
        });
        setSettings(fetched);
      } catch (err) {
        toast.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setModifiedKeys(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const handleFileUpload = async (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const loadingToast = toast.loading('Uploading image...');
    try {
      const res = await api.post('/api/v1/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleSettingChange(key, res.data.url);
      toast.update(loadingToast, { render: 'Image uploaded!', type: 'success', isLoading: false, autoClose: 2000 });
    } catch (err) {
      toast.update(loadingToast, { render: 'Failed to upload image', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  const handleSave = async () => {
    if (modifiedKeys.size === 0) {
      toast.info('No changes to save');
      return;
    }
    setIsSaving(true);
    try {
      for (const key of modifiedKeys) {
        await api.put(`/api/v1/settings/${key}`, { value: settings[key] });
      }
      setModifiedKeys(new Set());
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        subtitle="Manage system configurations and preferences"
        actionLabel={isSaving ? 'Saving...' : 'Save Changes'}
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
        <div className="flex-1 min-w-0">
          {ActiveComponent && (
            <ActiveComponent 
              settings={settings} 
              handleSettingChange={handleSettingChange} 
              handleFileUpload={handleFileUpload} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
