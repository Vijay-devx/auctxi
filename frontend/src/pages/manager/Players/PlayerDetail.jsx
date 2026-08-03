import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import PlayerCard from '../../../components/ui/PlayerCard';

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
        backUrl="/manager/player-pool"
      />

      <div className="max-w-2xl mx-auto pt-6">
        <PlayerCard player={player} />
      </div>
    </div>
  );
}
