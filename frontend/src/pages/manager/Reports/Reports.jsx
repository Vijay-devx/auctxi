import React, { useState, useEffect } from 'react';
import { useAuctions } from '../../../hooks/useAuctions';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { IconReport, IconDownload, IconEye, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import DataTable from '../../../components/ui/DataTable';

const Reports = () => {
  const { auctions, loading: loadingAuctions } = useAuctions();
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const fetchReportData = async (auction) => {
    setSelectedAuction(auction);
    setLoadingReport(true);
    setReportData(null);
    try {
      const response = await api.get(`/api/v1/reports/auction/${auction.id}/data`);
      setReportData(response.data);
    } catch (err) {
      console.error('Failed to fetch report data', err);
      toast.error('Failed to load report data');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownload = async (auctionId, auctionName) => {
    setDownloading(auctionId);
    try {
      const response = await api.get(`/api/v1/reports/auction/${auctionId}/download?format=pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Auction_Report_${auctionName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Failed to download report', err);
      toast.error('Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  const teamColumns = [
    { header: 'Team', accessorKey: 'teamName' },
    { header: 'Budget', accessorKey: 'totalBudget', cell: ({ row }) => `₹${row.original.totalBudget?.toLocaleString()}` },
    { header: 'Spent', accessorKey: 'moneySpent', cell: ({ row }) => `₹${row.original.moneySpent?.toLocaleString()}` },
    { header: 'Remaining', accessorKey: 'remainingPurse', cell: ({ row }) => `₹${row.original.remainingPurse?.toLocaleString()}` },
    { header: 'Players', accessorKey: 'playersBought' },
  ];

  const playerColumns = [
    { header: 'Player', accessorKey: 'playerName' },
    { header: 'Team', accessorKey: 'winningTeamName' },
    { header: 'Sold Price', accessorKey: 'soldPrice', cell: ({ row }) => row.original.soldPrice ? `₹${row.original.soldPrice?.toLocaleString()}` : 'N/A' },
  ];

  const bidColumns = [
    { header: 'Player', accessorKey: 'playerName' },
    { header: 'Team', accessorKey: 'teamName' },
    { header: 'Amount', accessorKey: 'bidAmount', cell: ({ row }) => `₹${row.original.bidAmount?.toLocaleString()}` },
    { header: 'Time', accessorKey: 'bidTime', cell: ({ row }) => new Date(row.original.bidTime).toLocaleString() },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Auction Reports" 
        description="View and download comprehensive reports for your managed auctions."
        icon={<IconReport className="w-8 h-8 text-amber-500" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Auction List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Your Auctions</h2>
          {loadingAuctions ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              Loading auctions...
            </div>
          ) : auctions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              No auctions found.
            </div>
          ) : (
            <div className="space-y-3">
              {auctions.map(auction => (
                <Card 
                  key={auction.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedAuction?.id === auction.id ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={() => fetchReportData(auction)}
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{auction.name}</h3>
                      <p className="text-xs text-gray-500">{new Date(auction.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); fetchReportData(auction); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        <IconEye size={16} /> View
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(auction.id, auction.name); }}
                        disabled={downloading === auction.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                      >
                        <IconDownload size={16} /> {downloading === auction.id ? '...' : 'PDF'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Report Preview */}
        <div className="lg:col-span-2">
          {selectedAuction ? (
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAuction.name} Report</h2>
                    <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedAuction(null)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <IconX size={20} />
                  </button>
                </div>

                {loadingReport ? (
                  <div className="py-20 text-center text-gray-500">
                    Loading report data...
                  </div>
                ) : reportData ? (
                  <div className="space-y-8">
                    {/* Teams Summary */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Teams Summary</h3>
                      {reportData.teams?.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <DataTable columns={teamColumns} data={reportData.teams} />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No teams found for this auction.</p>
                      )}
                    </div>

                    {/* Sold Players */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Sold Players</h3>
                      {reportData.soldPlayers?.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <DataTable columns={playerColumns} data={reportData.soldPlayers} />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No players have been sold yet.</p>
                      )}
                    </div>

                    {/* Bid History */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Bid History</h3>
                      {reportData.bidHistory?.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                          <DataTable columns={bidColumns} data={reportData.bidHistory} />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No bids have been placed yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-red-500">
                    Failed to load report data.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <IconReport className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">Select an auction to view its report</p>
              <p className="mt-1">Click the "View" button on any auction card to see the detailed report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
