import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import SearchFilterBar from '../../components/ui/SearchFilterBar';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { IconGavel, IconEdit, IconTrash } from '@tabler/icons-react';
import { usePlayers } from '../../hooks/usePlayers';
import Pagination from '../../components/ui/Pagination';
import WatchlistButton from '../../components/ui/WatchlistButton';

export default function PlayerPool() {
  const navigate = useNavigate();
  const { players, loading, error, deletePlayer } = usePlayers();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ownershipFilter, setOwnershipFilter] = useState('All');
  const itemsPerPage = 12;

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchValue.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.role === categoryFilter || p.category?.name === categoryFilter;
      const matchStatus = statusFilter === 'All' || p.assignmentStatus === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [players, searchValue, categoryFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchValue('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const getStatusVariant = (status) => {
    switch(status) {
      case 'Available': return 'info';
      case 'Assigned to Auction': return 'warning';
      default: return 'default';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      await deletePlayer(id);
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader 
        title="Player Pool" 
        breadcrumbs={[{ label: 'Dashboard', path: '/manager' }, { label: 'Player Pool' }]}
        actionLabel="+ Add Player"
        onAction={() => navigate('/manager/player-pool/create')}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={(val) => { setSearchValue(val); setCurrentPage(1); }}
          onClearFilters={handleClearFilters}
          filters={[
            {
              label: 'Role',
              value: categoryFilter,
              onChange: (val) => { setCategoryFilter(val); setCurrentPage(1); },
              options: [
                { label: 'All Roles', value: 'All' },
                { label: 'BATSMAN', value: 'BATSMAN' },
                { label: 'BOWLER', value: 'BOWLER' },
                { label: 'ALL_ROUNDER', value: 'ALL_ROUNDER' }
              ]
            },
            {
              label: 'Status',
              value: statusFilter,
              onChange: (val) => { setStatusFilter(val); setCurrentPage(1); },
              options: [
                { label: 'All Statuses', value: 'All' },
                { label: 'Available', value: 'Available' },
                { label: 'Assigned to Auction', value: 'Assigned to Auction' }
              ]
            }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
           <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
             Loading players...
           </div>
        ) : error ? (
           <div className="col-span-full py-12 text-center text-red-500 bg-white rounded-xl border border-red-100">
             {error}
           </div>
        ) : paginatedPlayers.length > 0 ? (
          paginatedPlayers.map(player => (
            <Card key={player.id} className="overflow-hidden flex flex-col relative group">
              <div className="relative h-48 bg-gray-100 flex items-center justify-center border-b border-gray-100">
                {player.imageUrl ? (
                  <img src={player.imageUrl} alt={player.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                    {player.name.charAt(0)}
                  </div>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                  <div className="bg-white/90 backdrop-blur rounded-full shadow-sm">
                    <WatchlistButton playerId={player.id} />
                  </div>
                  <StatusBadge status={player.assignmentStatus || 'Available'} variant={getStatusVariant(player.assignmentStatus || 'Available')} />
                </div>
              </div>
              <CardContent className="p-5 pt-5 flex flex-col flex-1">
                <div className="mb-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 cursor-pointer hover:text-amber-600" onClick={() => navigate(`/manager/player-pool/${player.id}`)}>{player.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">{player.isWicketKeeper ? `${player.role} / WK` : player.role}</div>
                  <div className="mt-3 font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-normal">Base Price: </span>
                    ₹{player.basePrice?.toLocaleString()}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant={player.assignmentStatus === 'Available' ? 'primary' : 'outline'} 
                    className="flex-1 justify-center"
                    disabled={player.assignmentStatus !== 'Available'}
                  >
                    <IconGavel size={18} className="mr-1" />
                    {player.assignmentStatus === 'Available' ? 'Ready' : 'In Auction'}
                  </Button>
                  
                  
                  <Button variant="outline" className="px-2" onClick={() => navigate(`/manager/player-pool/edit/${player.id}`)} title="Edit Player">
                    <IconEdit size={18} />
                  </Button>
                  <Button variant="outline" className="px-2 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(player.id)} title="Delete Player">
                    <IconTrash size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            No players found matching your criteria.
          </div>
        )}
      </div>

      {!loading && paginatedPlayers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          onPageChange={setCurrentPage}
          totalItems={filteredPlayers.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}
