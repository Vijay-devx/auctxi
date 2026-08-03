import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import SearchFilterBar from '../../../components/ui/SearchFilterBar';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import StatusBadge from '../../../components/ui/StatusBadge';
import ActionMenu from '../../../components/ui/ActionMenu';
import { useTeams } from '../../../hooks/useTeams';

export default function TeamsList() {
  const navigate = useNavigate();
  const { teams, loading, error } = useTeams();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Filter teams
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (team.abbreviation && team.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // KPI Calculations
  const kpis = [
    { title: 'Total Teams', value: teams.length.toString() },
    { title: 'Active Teams', value: teams.length.toString() }, // Placeholder until status is tracked
    { title: 'Inactive Teams', value: '0' },
    { title: 'Total Players', value: teams.reduce((acc, team) => acc + (team.players?.length || 0), 0).toString() },
  ];

  const columns = [
    {
      key: 'name',
      header: 'Team Name',
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
            {item.abbreviation || item?.name?.charAt(0) || '?'}
          </div>
          <span className="font-medium text-gray-900">{item?.name || 'Unnamed'}</span>
        </div>
      ),
    },
    { key: 'abbreviation', header: 'Abbreviation', render: (_, item) => item.abbreviation || '-' },
    { key: 'remainingPurse', header: 'Purse', render: (_, item) => `₹${item.remainingPurse || 0}` },
    { key: 'players', header: 'Players', render: (_, item) => item.players?.length || 0 },
    {
      key: 'status',
      header: 'Status',
      render: (_, item) => <StatusBadge status="Active" label="Active" />,
    },
    { key: 'createdOn', header: 'Created On', render: (_, item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-' },
    {
      key: 'actions',
      header: 'Action',
      render: (_, item) => (
        <ActionMenu
          actions={[
            { label: 'View Details', onClick: () => navigate(`/admin/teams/${item.id}`) },
            { label: 'Edit', onClick: () => navigate(`/admin/teams/edit/${item.id}`) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Manage auction teams and their budgets."
        primaryAction={{
          label: '+ Add Team',
          onClick: () => navigate('/admin/teams/create'),
        }}
      />

      <KPICardRow kpis={kpis} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchFilterBar
          searchPlaceholder="Search teams by name or abbreviation..."
          searchValue={searchQuery}
          onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
          filters={[]}
          onFilterChange={(filterId, value) => console.log(filterId, value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading teams...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : paginatedTeams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No teams found.</div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedTeams}
            keyExtractor={(item) => item.id}
          />
        )}
      </div>

      {!loading && paginatedTeams.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          onPageChange={setCurrentPage}
          totalItems={filteredTeams.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}
