import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import KPICard from '../../../components/ui/KPICard';
import SearchFilterBar from '../../../components/ui/SearchFilterBar';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/ui/Button';
import { IconTrophy, IconCalendarEvent, IconLivePhoto, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuctions } from '../../../hooks/useAuctions';

const filterOptions = [
  {
    name: 'status',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'live', label: 'Live' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'completed', label: 'Completed' },
    ]
  }
];

const AuctionsList = () => {
  const navigate = useNavigate();
  const { auctions, loading, error } = useAuctions();
  
  // Local state for search and pagination (can be moved to custom hooks later)
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAction = (id) => {
    navigate(`/manager/auctions/${id}`);
  };

  const columns = [
    { header: 'Auction Name', accessorKey: 'name' },
    { header: 'Date & Time', accessorKey: 'createdAt', cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status?.toLowerCase()} />
    },
    {
      header: 'Action',
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction(row.original.id)}
        >
          View
        </Button>
      )
    }
  ];

  // Filtering
  const filteredAuctions = auctions.filter(auction => 
    auction.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);
  const paginatedAuctions = filteredAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // KPI Calculations
  const liveCount = auctions.filter(a => a.status === 'ONGOING').length;
  const upcomingCount = auctions.filter(a => a.status === 'UPCOMING').length;
  const completedCount = auctions.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Auctions" 
        actionLabel="+ Create Auction"
        actionPath="/manager/auctions/create"
      />

      <KPICardRow>
        <KPICard
          title="Total Auctions"
          value={auctions.length.toString()}
          icon={<IconTrophy className="w-5 h-5" />}
        />
        <KPICard
          title="Live Auctions"
          value={liveCount.toString()}
          icon={<IconLivePhoto className="w-5 h-5 text-red-500" />}
        />
        <KPICard
          title="Upcoming Auctions"
          value={upcomingCount.toString()}
          icon={<IconCalendarEvent className="w-5 h-5 text-amber-500" />}
        />
        <KPICard
          title="Completed Auctions"
          value={completedCount.toString()}
          icon={<IconCheck className="w-5 h-5 text-emerald-500" />}
        />
      </KPICardRow>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <SearchFilterBar 
            placeholder="Search auctions..." 
            filters={filterOptions}
            onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onFilterChange={(filters) => console.log('Filters:', filters)}
          />
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading auctions...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : paginatedAuctions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No auctions found.</div>
        ) : (
          <DataTable 
            data={paginatedAuctions}
            columns={columns}
          />
        )}
        
        {!loading && paginatedAuctions.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages || 1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionsList;
