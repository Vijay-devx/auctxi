import React, { useState } from 'react';
import KPICardRow from '../../components/ui/KPICardRow';
import KPICard from '../../components/ui/KPICard';
import AuctionCard from '../../components/ui/AuctionCard';
import { Card, CardContent } from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import { IconTrophy, IconCalendarEvent, IconCoinRupee, IconWallet, IconMail, IconGavel } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../hooks/useAuctions';
import { useTeams } from '../../hooks/useTeams';
import { useInvitations } from '../../hooks/useInvitations';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { auctions, myApplications, loading: loadingAuctions } = useAuctions();
  const { teams, loading: loadingTeams } = useTeams();
  const { invitations, loading: loadingInvites, acceptInvitation, declineInvitation } = useInvitations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Find teams owned by this client
  const myTeams = teams.filter(t => t.owner?.id === user?.id);
  const totalSpent = myTeams.reduce((acc, curr) => acc + ((curr.totalBudget || 0) - (curr.remainingPurse || 0)), 0);
  const remainingBudget = myTeams.reduce((acc, curr) => acc + (curr.remainingPurse || 0), 0);

  const [walletBalance, setWalletBalance] = useState(0);

  // Fetch Wallet Balance
  React.useEffect(() => {
    if (user?.id) {
      const fetchWallet = async () => {
        try {
          const { api } = await import('../../services/api');
          const res = await api.get(`/api/v1/payments/wallet/${user.id}`);
          setWalletBalance(res.data.balance || 0);
        } catch (err) {
          console.error('Failed to fetch wallet balance', err);
        }
      };
      fetchWallet();
    }
  }, [user]);

  // Format large numbers into compact strings (e.g. 1.5L, 10Cr)
  const formatCompact = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(val);
  };

  const myAuctionIds = new Set(myTeams.map(t => t.auctionId));
  const myActiveAuctions = auctions.filter(a => myAuctionIds.has(a.id) && (a.status === 'ONGOING' || a.status === 'UPCOMING' || a.status === 'PAUSED'));

  // Separate pending invitations
  const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING');

  const [acceptingInvId, setAcceptingInvId] = useState(null);
  const [formData, setFormData] = useState({ proposedTeamName: '', proposedShortName: '' });

  const handleAcceptClick = (invId) => {
    setAcceptingInvId(invId);
    setFormData({ proposedTeamName: '', proposedShortName: '' });
  };

  const handleConfirmAccept = async (invId) => {
    if (!formData.proposedTeamName || !formData.proposedShortName) {
      alert("Please enter team name and short name");
      return;
    }
    await acceptInvitation(invId, formData);
    setAcceptingInvId(null);
  };

  const handleDeclineClick = async (invId) => {
    if(window.confirm("Are you sure you want to decline this invitation?")) {
      await declineInvitation(invId);
    }
  };

  const inviteColumns = [
    { header: 'Auction', accessorKey: 'auction.name' },
    { header: 'Expires', accessorKey: 'expiresAt', cell: ({ row }) => new Date(row.original.expiresAt).toLocaleDateString() },
    { header: 'Actions', id: 'actions', cell: ({ row }) => {
        const inv = row.original;
        if (acceptingInvId === inv.id) {
          return (
            <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded">
              <input 
                type="text" 
                placeholder="Team Name" 
                className="text-xs p-1 border rounded"
                value={formData.proposedTeamName}
                onChange={e => setFormData({...formData, proposedTeamName: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Short Name (e.g. CSK)" 
                className="text-xs p-1 border rounded"
                value={formData.proposedShortName}
                onChange={e => setFormData({...formData, proposedShortName: e.target.value})}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleConfirmAccept(inv.id)}>Confirm</Button>
                <Button size="sm" variant="outline" onClick={() => setAcceptingInvId(null)}>Cancel</Button>
              </div>
            </div>
          )
        }
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => handleAcceptClick(inv.id)}>Accept</Button>
            <Button size="sm" variant="danger" onClick={() => handleDeclineClick(inv.id)}>Decline</Button>
          </div>
        )
      } 
    }
  ];

  const filteredAuctions = auctions.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const auctionDate = a.scheduledStartTime ? a.scheduledStartTime.split('T')[0] : (a.startTime ? a.startTime.split('T')[0] : null);
    const matchesDate = !dateFilter || auctionDate === dateFilter;
    
    if (statusFilter === 'LIVE') {
      const isParticipated = myApplications?.some(app => app.auctionId === a.id);
      return matchesSearch && a.status === 'LIVE' && isParticipated && matchesDate;
    }
    
    if (statusFilter === 'UPCOMING') {
      return matchesSearch && a.status === 'UPCOMING' && matchesDate;
    }
    
    return matchesSearch && matchesDate;
  });

  const liveCount = auctions.filter(a => a.status === 'LIVE').length;
  const upcomingCount = auctions.filter(a => a.status === 'UPCOMING').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6 px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your teams and auctions today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICardRow>
        <KPICard title="My Teams" value={myTeams.length} icon={<IconTrophy size={20} />} onClick={() => navigate('/client/auctions')} />
        <KPICard title="Active Auctions" value={myActiveAuctions.length} icon={<IconCalendarEvent size={20} />} onClick={() => navigate('/client/auctions')} />
        <KPICard title="Total Spent" value={formatCompact(totalSpent)} icon={<IconCoinRupee size={20} />} trendDown={false} onClick={() => navigate('/client/payments')} />
        <KPICard title="Wallet Balance" value={formatCompact(walletBalance)} icon={<IconWallet size={20} />} onClick={() => navigate('/client/wallet')} />
      </KPICardRow>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <IconMail className="text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Pending Invitations</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              <DataTable 
                columns={inviteColumns} 
                data={pendingInvitations} 
                className="border-none shadow-none"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Auctions Section (Moved from AuctionsList.jsx) */}
      <div className="pt-8 border-t border-gray-200 space-y-6">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <PageHeader 
            title="All Auctions" 
            description="Browse and explore all available auctions" 
            showNotification={false}
            showDatePicker={true}
            date={dateFilter}
            onDateChange={setDateFilter}
            className="mb-0"
          />
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => setStatusFilter(statusFilter === 'LIVE' ? 'ALL' : 'LIVE')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${statusFilter === 'LIVE' ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-amber-700' : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'}`}
              >
                <IconGavel size={16} className={statusFilter === 'LIVE' ? "text-[#f59e0b]" : ""} />
                <span>{liveCount} Live Now</span>
              </button>
              <button 
                onClick={() => setStatusFilter(statusFilter === 'UPCOMING' ? 'ALL' : 'UPCOMING')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${statusFilter === 'UPCOMING' ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-amber-700' : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'}`}
              >
                <IconCalendarEvent size={16} className={statusFilter === 'UPCOMING' ? "text-[#f59e0b]" : ""} />
                <span>{upcomingCount} Upcoming</span>
              </button>
            </div>
            <div className="w-64 relative">
              <input 
                type="text" 
                placeholder="Search auctions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Auction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingAuctions ? (
            <div className="col-span-full py-12 text-center text-gray-500">Loading auctions...</div>
          ) : filteredAuctions.length > 0 ? (
            filteredAuctions.map(auction => {
              const myApp = myApplications?.find(app => app.auctionId === auction.id);
              return (
                <AuctionCard 
                  key={auction.id} 
                  auction={auction} 
                  application={myApp}
                />
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No auctions found matching your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;