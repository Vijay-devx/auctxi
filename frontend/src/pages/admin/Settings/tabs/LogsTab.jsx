import React from 'react';
import DataTable from '../../../../components/ui/DataTable';

export default function LogsTab() {
  const logsData = [
    { id: 1, user: 'Super Admin', action: 'Modified General Settings', module: 'Settings', time: '10 mins ago', status: 'Success' },
    { id: 2, user: 'System', action: 'Automated Database Backup', module: 'System', time: '2 hours ago', status: 'Success' },
    { id: 3, user: 'Manager John', action: 'Approved Team Registration', module: 'Teams', time: '5 hours ago', status: 'Success' },
    { id: 4, user: 'Super Admin', action: 'Changed SMTP Configuration', module: 'Settings', time: '1 day ago', status: 'Success' },
    { id: 5, user: 'System', action: 'Failed to send SMS (Gateway Error)', module: 'Notification', time: '1 day ago', status: 'Failed' },
  ];

  const columns = [
    { header: 'Time', accessorKey: 'time', cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.time}</span> },
    { header: 'User', accessorKey: 'user' },
    { header: 'Module', accessorKey: 'module' },
    { header: 'Action', accessorKey: 'action' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.original.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.original.status}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Activity Logs</h3>
          <p className="text-sm text-gray-500 mt-1">Recent administrative and system-level actions.</p>
        </div>
        <DataTable data={logsData} columns={columns} />
      </div>
    </div>
  );
}
