import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import KPICard from '../../components/ui/KPICard';
import { IconInfoCircle, IconUsers, IconGavel, IconList, IconTrophy, IconClock, IconMapPin, IconCoinRupee, IconHistory, IconWallet } from '@tabler/icons-react';
import { cn } from '../../utils/cn';
import { useAuctions } from '../../hooks/useAuctions';
import { useTeams } from '../../hooks/useTeams';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import ClientPlayersTab from './components/ClientPlayersTab';
import ClientCreateTeamTab from './components/ClientCreateTeamTab';
import { api } from '../../services/api';

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchAuctionById, myApplications } = useAuctions();
  const { teams } = useTeams();
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAuctionById(id);
        setAuction(data);
      } catch (e) {
        console.error("Failed to load auction details", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, fetchAuctionById]);

  // Find the client's team for this specific auction
  const myTeam = teams.find(t => t.auctionId === id && t.owner?.id === user?.id);
  const myApplication = myApplications?.find(app => app.auctionId === id);

  useEffect(() => {
    const checkPayment = async () => {
      if (myTeam && user?.id) {
        try {
          const res = await api.get(`/api/v1/payments/client/${user.id}/auction/${id}/status`);
          setHasPaid(res.data.hasPaid);
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkPayment();
  }, [myTeam, user, id]);

  const teamStatusText = myTeam 
    ? (hasPaid ? myTeam.name : `${myTeam.name} (Unpaid)`)
    : (myApplication ? `Application ${myApplication.status}` : 'Not Participating');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <IconInfoCircle size={18} /> },
    { id: 'squad', label: 'My Squad & Bids', icon: <IconUsers size={18} /> },
    { id: 'players', label: 'Players', icon: <IconList size={18} /> },
    { id: 'live', label: 'Live Bid', icon: <IconGavel size={18} /> },
    { id: 'create-team', label: 'Team Setup', icon: <IconUsers size={18} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <IconTrophy size={18} /> }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Auction Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-md shadow-sm text-gray-500">
                        <IconClock size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Start Time</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {auction.status === 'UPCOMING' 
                            ? (auction.scheduledStartTime ? new Date(auction.scheduledStartTime).toLocaleString() : 'TBA')
                            : (auction.startTime ? new Date(auction.startTime).toLocaleString() : 'TBA')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-md shadow-sm text-gray-500">
                        <IconMapPin size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Status</p>
                        <p className="text-sm font-semibold text-gray-900">{auction.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-md shadow-sm text-gray-500">
                        <IconUsers size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">My Team Status</p>
                        <p className="text-sm font-semibold text-gray-900">{teamStatusText}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-md shadow-sm text-gray-500">
                        <IconCoinRupee size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Base Purse</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(auction.auctionRules?.initialPurse || 0)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myTeam && !hasPaid ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 text-center mb-2">
                      <p>You must pay the Purse Value Amount to enter the Live Bid Room.</p>
                      <Button variant="link" className="text-amber-900 font-bold p-0 h-auto hover:text-amber-700 hover:underline transition-colors" onClick={() => setActiveTab('create-team')}>Go to Team Setup</Button>
                    </div>
                  ) : null}
                  <Button variant="black" className="w-full justify-center" onClick={() => setActiveTab('live')} disabled={auction.status !== 'ONGOING' || (myTeam && !hasPaid)}>
                    Enter Live Auction
                  </Button>
                  <Button variant="outline" className="w-full justify-center" onClick={() => setActiveTab('squad')}>
                    View My Squad
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'squad':
        if (!myTeam) {
           return (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              <p>You do not have a team registered for this auction.</p>
            </div>
           );
        }
        return (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <KPICard title="Total Budget" value={formatCurrency(myTeam.totalBudget)} icon={<IconCoinRupee/>} />
                 <KPICard title="Remaining Purse" value={formatCurrency(myTeam.remainingPurse)} icon={<IconWallet/>} />
             </div>
             <Card>
                <CardHeader>
                    <CardTitle>Roster Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={[
                            { header: 'Name', accessorKey: 'name' },
                            { header: 'Role', accessorKey: 'role' },
                            { header: 'Category', accessorKey: 'category' },
                            { header: 'Winning Bid', accessorKey: 'basePrice' } 
                        ]}
                        data={myTeam.players || []}
                    />
                </CardContent>
             </Card>
          </div>
        );

      case 'players':
        return <ClientPlayersTab auctionId={id} />;

      case 'live':
        return (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
            <IconGavel size={48} className="mx-auto mb-4 text-[#f59e0b]" />
            <h3 className="text-lg font-semibold text-gray-900">Live Bid Room</h3>
            <p className="max-w-md mx-auto mt-2 text-sm mb-4">You are about to enter the Live Bidding Room.</p>
            <Button onClick={() => navigate(`/client/live-auction/${auction.id}`)}>Connect to WebSockets</Button>
          </div>
        );

      case 'create-team':
        return <ClientCreateTeamTab auctionId={id} myTeam={myTeam} myApplication={myApplication} />;

      case 'leaderboard':
        const participatingTeams = teams.filter(t => t.auctionId === id);
        return (
          <div className="space-y-4 animate-in fade-in">
             <Card>
                <CardHeader>
                    <CardTitle>Auction Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={[
                            { header: 'Team Name', accessorKey: 'name' },
                            { header: 'Owner', accessorKey: 'owner.name' },
                            { header: 'Players Bought', accessorKey: 'players.length' },
                            { header: 'Remaining Purse', accessorKey: 'remainingPurse', cell: ({row}) => formatCurrency(row.original.remainingPurse) }
                        ]}
                        data={participatingTeams}
                    />
                </CardContent>
             </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading auction details...</div>;
  if (!auction) return <div className="p-12 text-center text-red-500">Failed to load auction.</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-gray-50 opacity-50">
          <IconTrophy size={200} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={auction.status === 'ONGOING' ? 'success' : 'default'} className="uppercase">
              {auction.status}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{auction.name}</h1>
        </div>
        
        <div className="relative z-10 text-left md:text-right">
          <p className="text-sm text-gray-500 font-medium">Starts On</p>
          <p className="text-lg font-semibold text-gray-900">
            {auction.status === 'UPCOMING'
              ? (auction.scheduledStartTime ? new Date(auction.scheduledStartTime).toLocaleDateString() : 'TBA')
              : (auction.startTime ? new Date(auction.startTime).toLocaleDateString() : 'TBA')}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-[#111111] text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

    </div>
  );
};

export default AuctionDetails;
