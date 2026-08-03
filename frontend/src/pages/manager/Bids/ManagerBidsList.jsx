import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardContent } from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { IconHistory } from '@tabler/icons-react';

export default function ManagerBidsList() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await api.get('/api/v1/bidding');
        console.log("BIDS DATA:", response.data);
        setBids(response.data);
      } catch (err) {
        console.error("Failed to fetch bids", err);
        setError("Failed to load bids data.");
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const columns = [
    { 
      header: 'Date & Time', 
      accessorKey: 'createdAt',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString()
    },
    { header: 'Auction', accessorKey: 'auctionName' },
    { header: 'Player', accessorKey: 'playerName' },
    { 
      header: 'Team', 
      accessorKey: 'team',
      cell: ({ row }) => row.original.team?.name || '-'
    },
    { 
      header: 'Bid Amount', 
      accessorKey: 'amount',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-600">
          {formatCurrency(row.original.amount)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Bid History" 
        description="Global view of all bids placed across your auctions." 
        icon={<IconHistory className="w-8 h-8 text-amber-500" />}
      />
      
      <Card>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading bids...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">{error}</div>
          ) : bids.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No bids have been placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable 
                columns={columns} 
                data={bids} 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
