import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardContent, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import { useAuctions } from '../../../hooks/useAuctions';
import { useApplications } from '../../../hooks/useApplications';

export default function ApplicationsList() {
  const { auctions, loading: aucLoading } = useAuctions();
  const { applications, loading: appLoading, error: appError, fetchApplicationsForAuction, approveApplication, rejectApplication } = useApplications();

  const [selectedAuctionId, setSelectedAuctionId] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (selectedAuctionId) {
      fetchApplicationsForAuction(selectedAuctionId);
    }
  }, [selectedAuctionId, fetchApplicationsForAuction]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveApplication(id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this application?")) return;
    setProcessingId(id);
    try {
      await rejectApplication(id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    { header: 'Applicant', accessorKey: 'applicantName', cell: ({row}) => row.original.applicantName || 'Unknown' },
    { header: 'Proposed Team', accessorKey: 'teamName' },
    { header: 'Auction', accessorKey: 'auctionName', cell: ({row}) => row.original.auction?.name || '-' },
    { header: 'Date Applied', accessorKey: 'createdAt', cell: ({row}) => new Date(row.original.createdAt).toLocaleDateString() },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'APPROVED' ? 'success' : 
          row.original.status === 'REJECTED' ? 'error' : 'warning'
        }>
          {row.original.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        if (row.original.status !== 'PENDING') return <span className="text-gray-400 text-sm">Processed</span>;
        
        return (
          <div className="flex gap-2">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => handleApprove(row.original.id)}
              disabled={processingId === row.original.id}
            >
              Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleReject(row.original.id)}
              disabled={processingId === row.original.id}
            >
              Reject
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Team Applications" 
        description="Review and approve team applications for your auctions."
      />

      <Card>
        <CardHeader className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:justify-between md:items-center">
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700 self-center">Select Auction:</label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white min-w-[250px]"
              value={selectedAuctionId}
              onChange={(e) => setSelectedAuctionId(e.target.value)}
              disabled={aucLoading}
            >
              <option value="">-- Choose an Auction --</option>
              {auctions?.map(auc => (
                <option key={auc.id} value={auc.id}>{auc.name}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        
        <CardContent>
          {!selectedAuctionId ? (
            <div className="text-center py-12 text-gray-500">
              Please select an auction to view its applications.
            </div>
          ) : appLoading ? (
            <div className="text-center py-8">Loading applications...</div>
          ) : appError ? (
            <div className="text-center py-8 text-red-500">{appError}</div>
          ) : (
            <DataTable 
              columns={columns}
              data={applications}
              keyField="id"
              emptyMessage="No applications found for this auction."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
