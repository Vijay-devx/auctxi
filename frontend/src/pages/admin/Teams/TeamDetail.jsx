import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import KPICardRow from '../../../components/ui/KPICardRow';
import DataTable from '../../../components/ui/DataTable';

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get(`/api/v1/teams/${id}`);
        setTeam(response.data);
      } catch (err) {
        console.error("Failed to fetch team details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading team details...</div>;
  if (!team) return <div className="p-8 text-center text-red-500">Failed to load team.</div>;

  const kpis = [
    { title: 'Total Budget', value: `₹ ${team.budget?.toLocaleString() || '0'}` },
    { title: 'Purse Remaining', value: `₹ ${team.purseRemaining?.toLocaleString() || '0'}` },
    { title: 'Squad Size', value: '0' },
  ];

  const rosterColumns = [
    { key: 'name', header: 'Player Name' },
    { key: 'role', header: 'Role' },
    { key: 'basePrice', header: 'Base Price' },
    { key: 'soldPrice', header: 'Sold Price' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.name}
        description={`${team.abbreviation} • Owner: ${team.ownerId}`}
        backUrl="/admin/teams"
      />

      <KPICardRow kpis={kpis} />

      <Card title="Current Roster" subtitle="Players currently assigned to this team">
        <DataTable
          columns={rosterColumns}
          data={[]}
          keyExtractor={(item) => item.id}
        />
      </Card>
    </div>
  );
}
