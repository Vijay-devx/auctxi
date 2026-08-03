import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import RoleBadge from '../../../components/ui/RoleBadge';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await api.get(`/api/v1/players/${id}`);
        setPlayer(response.data);
      } catch (err) {
        console.error("Failed to fetch player details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading player details...</div>;
  if (!player) return <div className="p-8 text-center text-red-500">Failed to load player.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Player Profile"
        backUrl="/admin/players"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 mb-4">
                {player.name?.charAt(0) || 'P'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{player.nationality || 'Unknown'}</p>
              
              <div className="flex gap-2">
                <RoleBadge role={player.role} />
                <StatusBadge status={player.status?.toLowerCase() === 'sold' ? 'Completed' : 'Active'} label={player.status} />
              </div>
            </div>
            
            <div className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium text-gray-900">{player.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Base Price</p>
                <p className="font-medium text-gray-900">₹ {player.basePrice?.toLocaleString() || '0'}</p>
              </div>
              {player.status === 'SOLD' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Current Team</p>
                    <p className="font-medium text-gray-900">{player.teamId || 'Assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sold Price</p>
                    <p className="font-medium text-amber-600">₹ {player.soldPrice?.toLocaleString() || '0'}</p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Career Statistics">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Matches</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Runs / Wickets</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </Card>

          <Card title="Auction History">
            <div className="text-center py-8 text-gray-500">
              <p>No previous auction history available.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
