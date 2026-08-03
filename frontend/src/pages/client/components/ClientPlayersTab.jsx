import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { api } from '../../../services/api';

const ClientPlayersTab = ({ auctionId }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/v1/auctions/${auctionId}/players`);
        setPlayers(response.data);
      } catch (err) {
        console.error('Failed to fetch auction players:', err);
        setError('Failed to load player pool.');
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      fetchPlayers();
    }
  }, [auctionId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumSignificantDigits: 3
    }).format(amount);
  };

  const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Role', accessorKey: 'role' },
    { header: 'Category', accessorKey: 'category' },
    { 
      header: 'Base Price', 
      accessorKey: 'basePrice',
      cell: ({ row }) => formatCurrency(row.original.basePrice)
    },
    {
      header: 'Status',
      accessorKey: 'soldStatus',
      cell: ({ row }) => {
         const status = row.original.soldStatus || 'AVAILABLE';
         return (
            <Badge variant={status === 'AVAILABLE' ? 'default' : (status === 'SOLD' ? 'success' : 'destructive')}>
              {status}
            </Badge>
         );
      }
    }
  ];

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
        Loading players...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-500 bg-white rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Auction Player Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns}
            data={players}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPlayersTab;
