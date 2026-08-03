import React from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import DataTable from '../../../../components/ui/DataTable';

const BidsHistoryTab = ({ bids }) => {
  const columns = [
    { header: 'Player', accessorKey: 'playerName' },
    { header: 'Bidding Team', accessorKey: 'teamName' },
    { 
      header: 'Bid Amount', 
      accessorKey: 'bidAmount', 
      cell: ({ row }) => <span className="font-medium text-emerald-600">₹{row.original.bidAmount?.toLocaleString()}</span>
    },
    { 
      header: 'Time', 
      accessorKey: 'bidTime', 
      cell: ({ row }) => new Date(row.original.bidTime).toLocaleString() 
    }
  ];

  // Bids might be in ascending order from the backend report, let's show newest first on top
  const sortedBids = [...(bids || [])].sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Bids History</h2>
          <span className="text-sm font-medium bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            {bids.length} Total Bids
          </span>
        </div>
        
        {sortedBids.length > 0 ? (
          <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
            <DataTable columns={columns} data={sortedBids} />
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No bids have been placed in this auction yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidsHistoryTab;
