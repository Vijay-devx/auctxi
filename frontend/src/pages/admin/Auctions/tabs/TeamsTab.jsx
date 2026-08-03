import React from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import DataTable from '../../../../components/ui/DataTable';

const TeamsTab = ({ teams }) => {
  const columns = [
    { header: 'Team', accessorKey: 'teamName' },
    { header: 'Short Name', accessorKey: 'shortName' },
    { 
      header: 'Budget', 
      accessorKey: 'totalBudget', 
      cell: ({ row }) => `₹${row.original.totalBudget?.toLocaleString()}` 
    },
    { 
      header: 'Spent', 
      accessorKey: 'moneySpent', 
      cell: ({ row }) => {
        const spent = row.original.moneySpent || 0;
        const total = row.original.totalBudget || 1;
        const percentage = Math.round((spent / total) * 100);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm">₹{spent.toLocaleString()}</span>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Remaining Purse', 
      accessorKey: 'remainingPurse', 
      cell: ({ row }) => `₹${row.original.remainingPurse?.toLocaleString()}` 
    },
    { header: 'Players Bought', accessorKey: 'playersBought' },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Teams Registered</h2>
          <span className="text-sm font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            {teams.length} Teams
          </span>
        </div>
        
        {teams.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <DataTable columns={columns} data={teams} />
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No teams are currently registered for this auction.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamsTab;
