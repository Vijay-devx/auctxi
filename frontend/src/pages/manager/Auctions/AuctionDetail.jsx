import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import KPICard from '../../../components/ui/KPICard';
import Card, { CardContent } from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import { IconUsers, IconUser, IconCoin, IconGavel } from '@tabler/icons-react';
import TeamsTab from './components/TeamsTab';
import PlayersTab from './components/PlayersTab';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'teams', label: 'Teams' },
  { id: 'players', label: 'Player Pool' },
  { id: 'bids', label: 'Bids History' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'logs', label: 'System Logs' },
  { id: 'settings', label: 'Settings' }
];

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'overview');
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await api.get(`/api/v1/auctions/${id}`);
        setAuction(response.data);
      } catch (err) {
        console.error("Failed to fetch auction details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  // Sync tab state when URL changes
  useEffect(() => {
    if (tabFromQuery && tabs.some(t => t.id === tabFromQuery)) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading auction details...</div>;
  if (!auction) return <div className="p-8 text-center text-red-500">Failed to load auction.</div>;

  const breadcrumbs = [
    { label: 'Auctions', href: '/manager/auctions' },
    { label: auction.name }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <PageHeader 
          title={auction.name}
          breadcrumbs={breadcrumbs}
        />
        <div className="flex items-center gap-3">
          {(auction.status === 'UPCOMING' || auction.status === 'DRAFT') && (
            <button
              onClick={() => navigate(`/manager/auctions/edit/${auction.id}`)}
              className="px-4 py-2 bg-amber-50 text-amber-600 font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
            >
              Edit Auction
            </button>
          )}
          <StatusBadge status={auction.status?.toLowerCase()} />
          <div className="text-sm text-gray-500 font-medium">
             {new Date(auction.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                navigate(`/manager/auctions/${id}?tab=${tab.id}`, { replace: true });
              }}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content Placeholder */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <KPICardRow>
              <KPICard
                title="Registered Teams"
                value={"0"}
                icon={<IconUsers className="w-5 h-5 text-blue-500" />}
              />
              <KPICard
                title="Player Pool"
                value={"0"}
                icon={<IconUser className="w-5 h-5 text-indigo-500" />}
              />
              <KPICard
                title="Total Purse / Team"
                value={"₹100 Cr"}
                icon={<IconCoin className="w-5 h-5 text-amber-500" />}
              />
              <KPICard
                title="Total Bids"
                value={"0"}
                icon={<IconGavel className="w-5 h-5 text-emerald-500" />}
              />
            </KPICardRow>
            
            <Card>
              <CardContent className="p-12 flex items-center justify-center text-gray-500 flex-col gap-4">
                <IconGavel className="w-12 h-12 text-gray-300" />
                <p>Auction Overview Dashboard - Coming Soon</p>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'teams' && (
          <TeamsTab auctionId={auction.id} />
        )}
        {activeTab === 'players' && (
          <PlayersTab auctionId={auction.id} auctionStatus={auction.status} />
        )}
        
        {activeTab !== 'overview' && activeTab !== 'teams' && activeTab !== 'players' && (
          <Card>
            <CardContent className="p-12 flex items-center justify-center text-gray-500 flex-col gap-4">
              <p>{tabs.find(t => t.id === activeTab)?.label} - Component under construction</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;
