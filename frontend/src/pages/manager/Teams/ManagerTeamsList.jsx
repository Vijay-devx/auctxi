import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardContent } from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { useTeams } from '../../../hooks/useTeams';

const formatCurrency = (amount) => {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumSignificantDigits: 3
  }).format(amount);
};

export default function ManagerTeamsList() {
  const { teams, loading, error } = useTeams();
  const navigate = useNavigate();

  const columns = useMemo(() => [
    {
      header: 'Team Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.logoUrl ? (
            <img src={row.original.logoUrl} alt={row.original.name} className="w-8 h-8 rounded-full object-cover bg-gray-100" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              {row.original.shortName || row.original.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{row.original.name}</span>
            <span className="text-xs text-gray-500">{row.original.shortName}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Auction',
      id: 'auctionName',
      cell: ({ row }) => row.original.auctionName || 'N/A'
    },
    {
      header: 'Owner/Client',
      id: 'ownerName',
      cell: ({ row }) => row.original.owner?.name || 'N/A'
    },
    {
      header: 'Total Budget',
      accessorKey: 'totalBudget',
      cell: ({ row }) => formatCurrency(row.original.totalBudget)
    },
    {
      header: 'Remaining Purse',
      accessorKey: 'remainingPurse',
      cell: ({ row }) => formatCurrency(row.original.remainingPurse)
    },
    {
      header: 'Players',
      id: 'playerCount',
      cell: ({ row }) => row.original.players?.length || 0
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/manager/teams/${row.original.id}`);
          }}
        >
          View Details
        </Button>
      )
    }
  ], [navigate]);

  return (
    <div className="space-y-6">
      <PageHeader title="Teams" description="Overview of all registered teams across your auctions." />
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading teams...</div>
          ) : teams.length > 0 ? (
            <DataTable
              columns={columns}
              data={teams}
              keyField="id"
              className="border-none shadow-none cursor-pointer"
              onRowClick={(row) => navigate(`/manager/teams/${row.id}`)}
            />
          ) : (
            <div className="p-12 text-center text-gray-500">
              No teams found. Teams will appear here once applications are approved.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
