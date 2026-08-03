import React from 'react';
import PageHeader from "../../components/ui/PageHeader";
import KPICardRow from "../../components/ui/KPICardRow";
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import { IconGavel, IconUsers, IconUserCheck, IconWallet, IconPlus } from '@tabler/icons-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuctions } from '../../hooks/useAuctions';
import { useNavigate } from 'react-router-dom';

/**
 * ManagerDashboard component - Overview for the auction manager
 * @returns {JSX.Element}
 */
export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { data: dashboardData, loading: dashLoading, error: dashError } = useDashboard();
  const { auctions, loading: aucLoading } = useAuctions();

  if (dashLoading || aucLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  }

  if (dashError) {
    return <div className="p-8 text-center text-red-500">Error: {dashError}</div>;
  }

  const activeAuction = auctions?.find(a => a.status === 'ONGOING') || auctions?.find(a => a.status === 'UPCOMING');
  const upcomingAuctionsList = auctions?.filter(a => a.status === 'UPCOMING' || a.status === 'DRAFT').slice(0, 5) || [];

  const kpiData = [
    {
      title: 'Active Auction',
      value: activeAuction ? activeAuction.name : 'None',
      icon: IconGavel,
      trend: { value: 0, isPositive: true, label: activeAuction?.status || 'N/A' }
    },
    {
      title: 'Total Players',
      value: dashboardData?.totalPlayers?.toString() || '0',
      icon: IconUsers,
      trend: { value: dashboardData?.totalTeams || 0, isPositive: true, label: 'Teams' }
    },
    {
      title: 'Players Sold',
      value: dashboardData?.totalSoldPlayers?.toString() || '0',
      icon: IconUserCheck,
      trend: { value: dashboardData?.totalAvailablePlayers || 0, isPositive: true, label: 'Available' }
    },
    {
      title: 'Total Spent (Revenue)',
      value: dashboardData?.totalRevenue ? `₹${(dashboardData.totalRevenue / 10000000).toFixed(2)} Cr` : '₹0',
      icon: IconWallet,
      trend: { value: 0, isPositive: false, label: 'Spent' }
    }
  ];

  const recentBidsColumns = [
    { header: 'Player', accessorKey: 'playerName' },
    { header: 'Team', accessorKey: 'team', cell: ({row}) => row.original.team?.name || 'Unknown' },
    { header: 'Amount', accessorKey: 'amount', cell: ({row}) => `₹${row.original.amount?.toLocaleString()}` },
    { header: 'Time', accessorKey: 'createdAt', cell: ({row}) => new Date(row.original.createdAt).toLocaleTimeString() },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'SOLD' ? 'success' : 'info'}>
          {row.original.status || 'BID'}
        </Badge>
      )
    }
  ];

  const recentBidsData = dashboardData?.recentActivities || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description="Overview of your current and upcoming auctions."
        actionLabel="Create Auction"
        onAction={() => navigate('/manager/auctions/create')}
        actionIcon={IconPlus}
        showDatePicker={false}
        showNotification={false}
      />

      <KPICardRow items={kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bids</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={recentBidsColumns}
                data={recentBidsData}
                keyField="id"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Auctions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAuctionsList.map(auction => (
                  <div 
                    key={auction.id} 
                    onClick={() => navigate(`/manager/auctions/${auction.id}`)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{auction.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{new Date(auction.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={auction.status === 'UPCOMING' ? 'info' : 'default'}>
                      {auction.status}
                    </Badge>
                  </div>
                ))}
                {upcomingAuctionsList.length === 0 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No upcoming auctions.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}