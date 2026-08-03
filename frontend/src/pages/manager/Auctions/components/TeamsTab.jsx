import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import DataTable from '../../../../components/ui/DataTable';
import Badge from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../../../../hooks/useTeams';
import { toast } from 'react-toastify';

const TeamsTab = ({ auctionId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/v1/applications/auction/${auctionId}`);
      setApplications(response.data || []);
    } catch (err) {
      console.error("Failed to fetch teams", err);
      setError("Failed to load team applications.");
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  const { teams } = useTeams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleRowClick = (row) => {
    if (row.original.status === 'APPROVED') {
      const applicantId = row.original.applicant?.id;
      const team = teams.find(t => t.auctionId === auctionId && t.owner?.id === applicantId);
      if (team) {
        navigate(`/manager/teams/${team.id}`);
      } else {
        toast.info("Team details are still being provisioned.");
      }
    }
  };

  const handleAction = async (appId, action) => {
    try {
      await api.post(`/api/v1/applications/${appId}/${action}`);
      await fetchApplications();
    } catch (err) {
      console.error(`Failed to ${action} application`, err);
      alert(`Failed to ${action} team. Please try again.`);
    }
  };

  const columns = [
    { 
      header: 'Team Name', 
      accessorKey: 'proposedTeamName',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.proposedTeamName || row.original.teamName || 'N/A'}</span>
      )
    },
    { 
      header: 'Client Name', 
      id: 'clientName',
      cell: ({ row }) => row.original.applicant?.name || row.original.clientName || 'N/A'
    },
    { 
      header: 'Applied Date', 
      accessorKey: 'createdAt',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => {
        let variant = 'default';
        if (row.original.status === 'APPROVED') variant = 'success';
        if (row.original.status === 'REJECTED') variant = 'danger';
        if (row.original.status === 'PENDING') variant = 'warning';
        return <Badge variant={variant}>{row.original.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        if (row.original.status === 'PENDING') {
          return (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => handleAction(row.original.id, 'approve')}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => handleAction(row.original.id, 'reject')}>Reject</Button>
            </div>
          );
        }
        return <span className="text-gray-400 text-sm italic">Resolved</span>;
      }
    }
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading teams...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Teams ({applications.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <DataTable
            columns={columns}
            data={applications}
            keyField="id"
            onRowClick={handleRowClick}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No teams have applied for this auction yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamsTab;
