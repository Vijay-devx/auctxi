import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import Card, { CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';

export default function PlayersTab({ auctionId, auctionStatus }) {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [assignedPlayers, setAssignedPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [auctionId]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const [availableRes, assignedRes] = await Promise.all([
        api.get(`/api/v1/manager/auctions/${auctionId}/available-players`),
        api.get(`/api/v1/manager/auctions/${auctionId}/assigned-players`)
      ]);
      setAvailablePlayers(availableRes.data);
      setAssignedPlayers(assignedRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load players.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (playerId) => {
    const newSelection = new Set(selectedPlayers);
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId);
    } else {
      newSelection.add(playerId);
    }
    setSelectedPlayers(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedPlayers.size === availablePlayers.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(availablePlayers.map(p => p.id)));
    }
  };

  const handleAssignToAuction = async () => {
    if (selectedPlayers.size === 0) return;
    try {
      setSubmitting(true);
      await api.post(`/api/v1/manager/auctions/${auctionId}/players`, {
        playerIds: Array.from(selectedPlayers)
      });
      setSelectedPlayers(new Set());
      await fetchPlayers();
    } catch (err) {
      console.error(err);
      setError('Failed to assign players to auction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      setSubmitting(true);
      await api.delete(`/api/v1/manager/auctions/${auctionId}/players/${playerId}`);
      await fetchPlayers();
    } catch (err) {
      console.error(err);
      setError('Failed to remove player from auction.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 bg-white rounded-lg border">Loading players...</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-white rounded-lg border">{error}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle>Players in this Auction ({assignedPlayers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedPlayers.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No players are currently assigned to this auction.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-gray-600">Player Name</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Role</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Base Price (₹)</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignedPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                      <td 
                        className="py-3 px-4 font-medium text-amber-600 hover:text-amber-800 cursor-pointer underline decoration-transparent hover:decoration-amber-800 transition-colors"
                        onClick={() => window.open(`/manager/player-pool/${player.id}`, '_blank')}
                        title="View Player Stats"
                      >
                        {player.name}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {player.isWicketKeeper ? `${player.role} / WK` : player.role}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {player.basePrice?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          disabled={submitting || auctionStatus === 'COMPLETED'}
                          className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle>Assign Available Players</CardTitle>
          <Button 
            variant="primary" 
            onClick={handleAssignToAuction}
            disabled={selectedPlayers.size === 0 || submitting || auctionStatus === 'COMPLETED'}
          >
            {submitting ? 'Assigning...' : `Add Selected to Auction (${selectedPlayers.size})`}
          </Button>
        </CardHeader>
        <CardContent>
          {availablePlayers.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No available players found in your private pool. Create more players first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-gray-600">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer w-4 h-4"
                        checked={selectedPlayers.size === availablePlayers.length && availablePlayers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Player Name</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Role</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Base Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {availablePlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer w-4 h-4"
                          checked={selectedPlayers.has(player.id)}
                          onChange={() => handleToggleSelect(player.id)}
                        />
                      </td>
                      <td 
                        className="py-3 px-4 font-medium text-amber-600 hover:text-amber-800 cursor-pointer underline decoration-transparent hover:decoration-amber-800 transition-colors"
                        onClick={() => window.open(`/manager/player-pool/${player.id}`, '_blank')}
                        title="View Player Stats"
                      >
                        {player.name}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {player.isWicketKeeper ? `${player.role} / WK` : player.role}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {player.basePrice?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
