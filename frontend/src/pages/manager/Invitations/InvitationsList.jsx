import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import { useAuctions } from '../../../hooks/useAuctions';
import { useInvitations } from '../../../hooks/useInvitations';
import { api } from '../../../services/api';

export default function InvitationsList() {
  const { auctions, loading: aucLoading } = useAuctions();
  const { invitations, loading: invLoading, error: invError, fetchInvitationsForAuction, inviteClient } = useInvitations();

  const [selectedAuctionId, setSelectedAuctionId] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (selectedAuctionId) {
      fetchInvitationsForAuction(selectedAuctionId);
    }
  }, [selectedAuctionId, fetchInvitationsForAuction]);

  useEffect(() => {
    if (showInviteModal && clients.length === 0) {
      // Fetch available clients to invite
      const fetchClients = async () => {
        try {
          const res = await api.get('/api/v1/users');
          // Filter to only ROLE_CLIENT
          const clientUsers = res.data.filter(u => u.roles.some(r => r.name === 'ROLE_CLIENT'));
          setClients(clientUsers);
        } catch (err) {
          console.error("Failed to fetch clients:", err);
        }
      };
      fetchClients();
    }
  }, [showInviteModal, clients.length]);

  const handleInvite = async () => {
    if (!selectedAuctionId || !selectedClientId) return;
    setIsInviting(true);
    try {
      await inviteClient(selectedAuctionId, selectedClientId);
      setShowInviteModal(false);
      setSelectedClientId('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
    }
  };

  const columns = [
    { header: 'Client Name', accessorKey: 'clientName', cell: ({row}) => row.original.clientName || 'Unknown' },
    { header: 'Auction', accessorKey: 'auctionName', cell: ({row}) => row.original.auction?.name || '-' },
    { header: 'Date Sent', accessorKey: 'createdAt', cell: ({row}) => new Date(row.original.createdAt).toLocaleDateString() },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'ACCEPTED' ? 'success' : 
          row.original.status === 'DECLINED' ? 'error' : 'warning'
        }>
          {row.original.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manage Invitations" 
        description="Invite clients to participate in your auctions."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
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
          {selectedAuctionId && (
            <Button onClick={() => setShowInviteModal(true)}>
              Invite Client
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!selectedAuctionId ? (
            <div className="text-center py-12 text-gray-500">
              Please select an auction to view its invitations.
            </div>
          ) : invLoading ? (
            <div className="text-center py-8">Loading invitations...</div>
          ) : invError ? (
            <div className="text-center py-8 text-red-500">{invError}</div>
          ) : (
            <DataTable 
              columns={columns}
              data={invitations}
              keyField="id"
              emptyMessage="No invitations sent for this auction yet."
            />
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Invite Client</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="">-- Select Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button onClick={handleInvite} disabled={!selectedClientId || isInviting}>
                {isInviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
