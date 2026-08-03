import React from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import DataTable from '../../../../components/ui/DataTable';

const PlayerPoolTab = ({ players }) => {
  const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Role', accessorKey: 'role' },
    { header: 'Category', accessorKey: 'category' },
    { 
      header: 'Base Price', 
      accessorKey: 'basePrice', 
      cell: ({ row }) => `₹${row.original.basePrice?.toLocaleString()}` 
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status || 'AVAILABLE';
        let color = 'bg-gray-100 text-gray-800';
        if (status === 'SOLD') color = 'bg-emerald-100 text-emerald-800';
        if (status === 'UNSOLD') color = 'bg-red-100 text-red-800';
        if (status === 'AVAILABLE') color = 'bg-blue-100 text-blue-800';
        
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        );
      }
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Player Pool</h2>
          <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
            {players.length} Players
          </span>
        </div>
        
        {players.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <DataTable columns={columns} data={players} />
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No players have been assigned to this auction yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerPoolTab;
