import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardContent } from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { IconStar, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';

export default function Watchlist() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlist = async () => {
    try {
      const response = await api.get('/api/v1/watchlist');
      setPlayers(response.data);
    } catch (err) {
      console.error("Failed to fetch watchlist", err);
      setError("Failed to load your watchlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (playerId) => {
    try {
      await api.delete(`/api/v1/watchlist/${playerId}`);
      toast.success("Removed from watchlist");
      setPlayers(players.filter(p => p.id !== playerId));
    } catch (err) {
      console.error("Failed to remove player from watchlist", err);
      toast.error("Failed to remove player");
    }
  };

  const columns = [
    { 
      header: 'Player', 
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl ? (
            <img src={row.original.imageUrl} alt={row.original.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
              {row.original.name.charAt(0)}
            </div>
          )}
          <span className="font-medium text-gray-900">{row.original.name}</span>
        </div>
      )
    },
    { header: 'Role', accessorKey: 'role' },
    { header: 'Base Price', accessorKey: 'basePrice', cell: ({ row }) => `₹${row.original.basePrice?.toLocaleString()}` },
    { 
      header: 'Actions', 
      accessorKey: 'id',
      cell: ({ row }) => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleRemove(row.original.id); }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Remove from Watchlist"
        >
          <IconTrash size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Watchlist" 
        description="Your bookmarked players."
        icon={<IconStar className="w-8 h-8 text-amber-500" />}
      />
      
      <Card>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading your watchlist...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">{error}</div>
          ) : players.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <IconStar className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-lg font-medium text-gray-900">Your watchlist is empty</p>
              <p className="mt-1">Go to the Player Pool to star players you want to keep an eye on.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable 
                columns={columns} 
                data={players} 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
