import React from 'react';
import KPICardRow from '../../components/ui/KPICardRow';
import KPICard from '../../components/ui/KPICard';
import ChartCard from '../../components/ui/ChartCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { IconTrophy, IconUsers, IconUser, IconCoin, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useAuctions } from '../../hooks/useAuctions';
import { usePlayers } from '../../hooks/usePlayers';
import { useTeams } from '../../hooks/useTeams';

const mockChartData = [
  { name: 'Jan', revenue: 4000, auctions: 24 },
  { name: 'Feb', revenue: 3000, auctions: 13 },
  { name: 'Mar', revenue: 2000, auctions: 98 },
  { name: 'Apr', revenue: 2780, auctions: 39 },
  { name: 'May', revenue: 1890, auctions: 48 },
  { name: 'Jun', revenue: 2390, auctions: 38 },
  { name: 'Jul', revenue: 3490, auctions: 43 },
];

const columns = [
  { header: 'Auction Name', accessorKey: 'name' },
  { header: 'Date', accessorKey: 'createdAt', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
  { 
    header: 'Status', 
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge status={row.original.status.toLowerCase()} />
  }
];

import { paymentApi } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { auctions, loading: loadingAuctions } = useAuctions();
  const { players, loading: loadingPlayers } = usePlayers();
  const { teams, loading: loadingTeams } = useTeams();
  const [adminRevenue, setAdminRevenue] = React.useState(0);
  
  React.useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await paymentApi.get('/api/v1/payments/admin/settlements');
        const total = res.data.reduce((sum, s) => sum + (s.platformCommissionAmount || 0), 0);
        setAdminRevenue(total);
      } catch (err) {
        console.error("Failed to fetch admin revenue", err);
      }
    };
    fetchRevenue();
  }, []);

  const isLoading = loadingAuctions || loadingPlayers || loadingTeams;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 font-medium">Loading Dashboard Data...</div>
      </div>
    );
  }

  const safeAuctions = Array.isArray(auctions) ? auctions : [];
  const safePlayers = Array.isArray(players) ? players : [];
  const safeTeams = Array.isArray(teams) ? teams : [];

  // Calculate live/upcoming for the sidebar
  const activeAuctions = safeAuctions
    .filter(a => a.status === 'ONGOING' || a.status === 'UPCOMING')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      </div>

      <KPICardRow>
        <KPICard
          title="Total Auctions"
          value={safeAuctions.length.toString()}
          icon={IconTrophy}
        />
        <KPICard
          title="Total Teams"
          value={safeTeams.length.toString()}
          icon={IconUsers}
        />
        <KPICard
          title="Total Players"
          value={safePlayers.length.toString()}
          icon={IconUser}
        />
        <KPICard
          title="Total Revenue"
          value={`₹${adminRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          icon={IconCoin}
        />
      </KPICardRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard 
            title="Auction Revenue Overview"
            subtitle="Monthly revenue (Mock data until Analytics Phase)"
          >
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Live & Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAuctions.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">No live or upcoming auctions.</div>
                ) : (
                  activeAuctions.map((auction, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white ${auction.status === 'ONGOING' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                        <IconTrophy className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{auction.name}</h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                          <span>{new Date(auction.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <StatusBadge status={auction.status.toLowerCase()} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Auctions</CardTitle>
            </CardHeader>
            <CardContent>
              {safeAuctions.length === 0 ? (
                 <div className="text-sm text-gray-500 text-center py-8">No auctions found in the database.</div>
              ) : (
                 <DataTable 
                  data={safeAuctions.slice(0, 5)}
                  columns={columns}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Players (Mock)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-500 text-center py-8">Will be integrated in Analytics Phase.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;