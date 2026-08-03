import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import KPICard from '../../../components/ui/KPICard';
import SearchFilterBar from '../../../components/ui/SearchFilterBar';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { IconGavel, IconTrophy, IconArrowDownRight, IconCurrencyDollar, IconDownload, IconEye } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

export default function BidsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAuction, setFilterAuction] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await api.get('/api/v1/bidding');
        setBids(response.data);
      } catch (error) {
        console.error('Failed to fetch bids:', error);
        toast.error('Failed to load bids data');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  // Process bids to calculate winning status and apply filters
  const processedBids = useMemo(() => {
    // 1. Group by player to find highest bids
    const highestBids = {};
    bids.forEach(bid => {
      if (!highestBids[bid.playerId] || bid.amount > highestBids[bid.playerId]) {
        highestBids[bid.playerId] = bid.amount;
      }
    });

    // 2. Map and apply status
    let mapped = bids.map(bid => ({
      ...bid,
      status: bid.amount >= highestBids[bid.playerId] ? 'Winning' : 'Outbid',
      auction: bid.auctionName || 'Unknown Auction',
      player: bid.playerName || 'Unknown Player',
      teamName: bid.team?.name || 'Unknown Team',
      time: new Date(bid.createdAt).toLocaleString()
    }));

    // 3. Filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      mapped = mapped.filter(b => 
        b.id?.toLowerCase().includes(lowerQ) ||
        b.player.toLowerCase().includes(lowerQ) ||
        b.teamName.toLowerCase().includes(lowerQ)
      );
    }
    
    if (filterAuction) mapped = mapped.filter(b => b.auctionId === filterAuction || b.auction === filterAuction);
    if (filterTeam) mapped = mapped.filter(b => b.team?.id === filterTeam || b.teamName === filterTeam);
    if (filterStatus) mapped = mapped.filter(b => b.status === filterStatus);

    // 4. Sort newest first
    return mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bids, searchQuery, filterAuction, filterTeam, filterStatus]);

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(processedBids.length / itemsPerPage) || 1;
  const paginatedBids = processedBids.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats
  const totalBids = bids.length;
  const winningBids = bids.filter(b => processedBids.find(pb => pb.id === b.id)?.status === 'Winning').length || processedBids.filter(b => b.status === 'Winning').length;
  const outbidBids = totalBids - winningBids;
  const totalValue = bids.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const columns = [
    { header: 'Bid ID', accessorKey: 'id', cell: ({ row }) => <span className="text-xs font-mono">{row.original.id?.substring(0, 8)}</span> },
    { header: 'Auction', accessorKey: 'auction' },
    { header: 'Player', accessorKey: 'player' },
    { header: 'Team', accessorKey: 'teamName' },
    { 
      header: 'Bid Amount', 
      accessorKey: 'amount',
      cell: ({ row }) => <span className="font-medium text-emerald-600">₹{Number(row.original.amount).toLocaleString()}</span>
    },
    { header: 'Bid Time', accessorKey: 'time' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={status === 'Winning' ? 'success' : 'secondary'}>{status}</Badge>;
      }
    },
    {
      header: 'Action',
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" icon={<IconEye size={16} />} aria-label="View bid details" />
      )
    }
  ];

  // Dynamic filter options based on available data
  const uniqueAuctions = [...new Set(bids.map(b => b.auctionName))].filter(Boolean);
  const uniqueTeams = [...new Set(bids.map(b => b.team?.name))].filter(Boolean);

  const filters = [
    {
      name: 'auction',
      placeholder: 'All Auctions',
      options: uniqueAuctions.map(a => ({ label: a, value: a }))
    },
    {
      name: 'team',
      placeholder: 'All Teams',
      options: uniqueTeams.map(t => ({ label: t, value: t }))
    },
    {
      name: 'status',
      placeholder: 'All Statuses',
      options: [
        { label: 'Winning', value: 'Winning' },
        { label: 'Outbid', value: 'Outbid' },
      ]
    }
  ];

  const handleFilterChange = (name, value) => {
    if (name === 'auction') setFilterAuction(value);
    if (name === 'team') setFilterTeam(value);
    if (name === 'status') setFilterStatus(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Bids History" 
        actions={
          <Button variant="outline" icon={<IconDownload size={18} />}>Export</Button>
        }
      />

      <KPICardRow>
        <KPICard title="Total Bids" value={totalBids.toLocaleString()} icon={<IconGavel size={24} />} />
        <KPICard title="Winning Bids" value={winningBids.toLocaleString()} icon={<IconTrophy size={24} />} />
        <KPICard title="Outbid Bids" value={outbidBids.toLocaleString()} icon={<IconArrowDownRight size={24} />} />
        <KPICard title="Total Bid Value" value={`₹${totalValue.toLocaleString()}`} icon={<IconCurrencyDollar size={24} />} />
      </KPICardRow>

      <SearchFilterBar 
        searchPlaceholder="Search bids by ID, player, or team..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading bids...</div>
      ) : (
        <>
          <DataTable 
            data={paginatedBids}
            columns={columns}
          />

          <div className="mt-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        </>
      )}
    </div>
  );
}
