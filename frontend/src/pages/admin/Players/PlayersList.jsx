import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import SearchFilterBar from '../../../components/ui/SearchFilterBar';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import StatusBadge from '../../../components/ui/StatusBadge';
import RoleBadge from '../../../components/ui/RoleBadge';
import ActionMenu from '../../../components/ui/ActionMenu';
import { usePlayers } from '../../../hooks/usePlayers';

export default function PlayersList() {
  const navigate = useNavigate();
  const { players, loading, error } = usePlayers();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Filter players
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // KPI Calculations
  const kpis = [
    { title: 'Total Players', value: players.length.toString() },
    { title: 'Global Players', value: players.filter(p => p.ownerType === 'GLOBAL').length.toString() },
    { title: 'Private Players', value: players.filter(p => p.ownerType === 'PRIVATE').length.toString() },
    { title: 'Available', value: players.length.toString() }, // Mock until status is added
  ];

  const columns = [
    {
      key: 'name',
      header: 'Player Name',
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
            {item?.name?.charAt(0) || '?'}
          </div>
          <span className="font-medium text-gray-900">{item?.name || 'Unnamed'}</span>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (_, item) => item.category?.name || '-' },
    {
      key: 'role',
      header: 'Role',
      render: (_, item) => <RoleBadge role={item.role || 'Player'} />,
    },
    { key: 'basePrice', header: 'Base Price', render: (_, item) => `₹${item.basePrice || 0}` },
    {
      key: 'ownerType',
      header: 'Type',
      render: (_, item) => {
        let badgeStatus = item.ownerType === 'GLOBAL' ? 'Active' : 'Inactive';
        return <StatusBadge status={badgeStatus} label={item.ownerType} />;
      },
    },
    {
      key: 'actions',
      header: 'Action',
      render: (_, item) => (
        <ActionMenu
          actions={[
            { label: 'View Details', onClick: () => navigate(`/admin/players/${item.id}`) },
            { label: 'Edit', onClick: () => navigate(`/admin/players/edit/${item.id}`) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        description="Manage global and private players in the system."
        primaryAction={{
          label: '+ Add Player',
          onClick: () => navigate('/admin/players/create'),
        }}
      />

      <KPICardRow kpis={kpis} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchFilterBar
          searchPlaceholder="Search players by name..."
          searchValue={searchQuery}
          onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
          filters={[]}
          onFilterChange={(filterId, value) => console.log(filterId, value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading players...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : paginatedPlayers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No players found.</div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedPlayers}
            keyExtractor={(item) => item.id}
          />
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
