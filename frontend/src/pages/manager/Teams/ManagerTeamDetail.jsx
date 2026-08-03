import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import KPICardRow from '../../../components/ui/KPICardRow';
import KPICard from '../../../components/ui/KPICard';
import DataTable from '../../../components/ui/DataTable';
import { IconWallet, IconCoinRupee, IconUsers } from '@tabler/icons-react';
import Badge from '../../../components/ui/Badge';

export default function ManagerTeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/teams/${id}`);
        setTeam(response.data);
      } catch (err) {
        console.error("Failed to fetch team details", err);
        setError("Failed to load team details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading team details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!team) return <div className="p-8 text-center text-gray-500">Team not found.</div>;

  const rosterColumns = [
    { 
      header: 'Player Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl ? (
            <img src={row.original.imageUrl} alt={row.original.name} className="w-8 h-8 rounded-full object-cover bg-gray-100" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs">
              {row.original.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-gray-900">{row.original.name}</span>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessorKey: 'role',
      cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>
    },
    { 
      header: 'Category', 
      accessorKey: 'category' 
    },
    { 
      header: 'Base Price', 
      accessorKey: 'basePrice',
      cell: ({ row }) => `₹ ${row.original.basePrice?.toLocaleString() || '0'}`
    },
    { 
      header: 'Sold Price', 
      accessorKey: 'soldPrice', // Assuming this exists or falls back to basePrice for now
      cell: ({ row }) => <span className="font-semibold text-green-600">₹ {row.original.soldPrice?.toLocaleString() || row.original.basePrice?.toLocaleString() || '0'}</span>
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {team.logoUrl ? (
          <img src={team.logoUrl} alt={team.name} className="w-16 h-16 rounded-full object-cover bg-white shadow-sm border border-gray-100" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-2xl shadow-sm border border-amber-200">
            {team.shortName || team.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <PageHeader
          title={team.name}
          description={`${team.shortName} • Owner: ${team.owner?.name || 'Unknown'} • Auction: ${team.auctionName || 'Unknown'}`}
          backUrl="/manager/teams"
        />
      </div>

      <KPICardRow>
        <KPICard 
          title="Total Budget" 
          value={`₹${team.totalBudget?.toLocaleString() || '0'}`} 
          icon={<IconWallet size={20} />} 
        />
        <KPICard 
          title="Remaining Purse" 
          value={`₹${team.remainingPurse?.toLocaleString() || '0'}`} 
          icon={<IconCoinRupee size={20} />} 
        />
        <KPICard 
          title="Squad Size" 
          value={team.players?.length || 0} 
          icon={<IconUsers size={20} />} 
          trendDown={false} 
        />
      </KPICardRow>

      <Card title="Current Roster" subtitle="Players currently assigned to this team">
        {team.players && team.players.length > 0 ? (
          <DataTable
            columns={rosterColumns}
            data={team.players}
            keyField="id"
          />
        ) : (
          <div className="p-12 text-center text-gray-500">
            No players have been assigned to this team yet.
          </div>
        )}
      </Card>
    </div>
  );
}
