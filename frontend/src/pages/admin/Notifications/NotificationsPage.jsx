import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { 
  IconBell, IconCheck, IconTrash, IconMessageCircle, 
  IconAlertTriangle, IconInfoCircle, IconSettings 
} from '@tabler/icons-react';

const initialNotifications = [
  { id: 1, type: 'alert', title: 'System Maintenance', message: 'Scheduled maintenance will occur on Sunday at 2:00 AM UTC.', time: '10 minutes ago', read: false },
  { id: 2, type: 'message', title: 'New Message from Support', message: 'Ticket #4592 has been updated by the support team.', time: '1 hour ago', read: false },
  { id: 3, type: 'info', title: 'Auction Completed', message: 'The IPL 2026 Mega Auction has been marked as completed.', time: '3 hours ago', read: true },
  { id: 4, type: 'system', title: 'Settings Updated', message: 'Platform general settings were modified by Admin.', time: '1 day ago', read: true },
  { id: 5, type: 'alert', title: 'High CPU Usage', message: 'Server CPU usage exceeded 90% for 5 minutes.', time: '2 days ago', read: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all'); // all, unread

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || !n.read);

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <IconAlertTriangle className="text-orange-500" />;
      case 'message': return <IconMessageCircle className="text-blue-500" />;
      case 'info': return <IconInfoCircle className="text-green-500" />;
      case 'system': return <IconSettings className="text-gray-500" />;
      default: return <IconBell className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Notifications" 
        subtitle="Manage your system alerts and messages"
        primaryAction={{ label: 'Mark All as Read', onClick: handleMarkAllRead, icon: <IconCheck size={18} /> }}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === 'all' ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === 'unread' ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              Unread
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {notifications.filter(n => !n.read).length} unread
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-5 flex gap-4 transition-colors hover:bg-gray-50 group",
                  !notification.read ? "bg-blue-50/30" : ""
                )}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    {getIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className={cn(
                        "text-sm font-medium text-gray-900 flex items-center gap-2",
                        !notification.read ? "font-semibold" : ""
                      )}>
                        {notification.title}
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</span>
                  </div>
                  <div className="mt-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkRead(notification.id)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <IconCheck size={14} /> Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <IconTrash size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <IconBell className="w-12 h-12 text-gray-300 mb-3" />
              <p>No notifications found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
