import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import KPICard from '../../../components/ui/KPICard';
import Card, { CardContent } from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import { IconUsers, IconUser, IconCoin, IconGavel } from '@tabler/icons-react';
import { toast } from 'react-toastify';

import TeamsTab from './tabs/TeamsTab';
import PlayerPoolTab from './tabs/PlayerPoolTab';
import BidsHistoryTab from './tabs/BidsHistoryTab';
import TimelineTab from './tabs/TimelineTab';
import SystemLogsTab from './tabs/SystemLogsTab';
import SettingsTab from './tabs/SettingsTab';

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
  const [activeTab, setActiveTab] = useState('overview');
  
  const [auction, setAuction] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [players, setPlayers] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const [auctionRes, reportRes, playersRes] = await Promise.all([
          api.get(`/api/v1/auctions/${id}`),
          api.get(`/api/v1/reports/auction/${id}/data`).catch(() => ({ data: null })), // handle safely if it fails
          api.get(`/api/v1/auctions/${id}/players`).catch(() => ({ data: [] }))
        ]);
        
        setAuction(auctionRes.data);
        if (reportRes.data) setReportData(reportRes.data);
        if (playersRes.data) setPlayers(playersRes.data);
        
      } catch (err) {
        console.error("Failed to fetch auction details", err);
        toast.error("Failed to load auction data");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctionData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading auction details...</div>;
  if (!auction) return <div className="p-8 text-center text-red-500">Failed to load auction.</div>;

  const breadcrumbs = [
    { label: 'Auctions', href: '/admin/auctions' },
    { label: auction.name }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <PageHeader 
          title={auction.name}
          breadcrumbs={breadcrumbs}
        />
        <div className="flex items-center gap-3">
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
              onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <KPICardRow>
              <KPICard
                title="Registered Teams"
                value={reportData?.teams?.length || "0"}
                icon={<IconUsers className="w-5 h-5 text-blue-500" />}
              />
              <KPICard
                title="Player Pool"
                value={players?.length || "0"}
                icon={<IconUser className="w-5 h-5 text-indigo-500" />}
              />
              <KPICard
                title="Total Purse / Team"
                value={auction.rules?.baseBudget ? `₹${auction.rules.baseBudget.toLocaleString()}` : "N/A"}
                icon={<IconCoin className="w-5 h-5 text-amber-500" />}
              />
              <KPICard
                title="Total Bids"
                value={reportData?.bidHistory?.length || "0"}
                icon={<IconGavel className="w-5 h-5 text-emerald-500" />}
              />
            </KPICardRow>
            
            <Card>
              <CardContent className="p-12 flex items-center justify-center text-gray-500 flex-col gap-4">
                <IconGavel className="w-12 h-12 text-gray-300" />
                <p>Auction Overview Dashboard - Use the tabs above to manage specific sections.</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'teams' && <TeamsTab teams={reportData?.teams || []} />}
        {activeTab === 'players' && <PlayerPoolTab players={players || []} />}
        {activeTab === 'bids' && <BidsHistoryTab bids={reportData?.bidHistory || []} />}
        {activeTab === 'timeline' && <TimelineTab />}
        {activeTab === 'logs' && <SystemLogsTab />}
        {activeTab === 'settings' && <SettingsTab auction={auction} setAuction={setAuction} />}
      </div>
    </div>
  );
};

export default AuctionDetail;
