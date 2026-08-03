import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import KPICard from '../../../components/ui/KPICard';
import SearchFilterBar from '../../../components/ui/SearchFilterBar';
import ChartCard from '../../../components/ui/ChartCard';
import DataTable from '../../../components/ui/DataTable';
import ActionMenu from '../../../components/ui/ActionMenu';
import Badge from '../../../components/ui/Badge';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, Legend as PieLegend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip } from 'recharts';
import { 
  IconReport, IconReportAnalytics, IconReportMoney, IconUsers, 
  IconShield, IconChartBar, IconChartPie, IconChartLine, IconDownload, IconFileSpreadsheet
} from '@tabler/icons-react';
import { useAuctions } from '../../../hooks/useAuctions';
import { usePlayers } from '../../../hooks/usePlayers';
import { useTeams } from '../../../hooks/useTeams';
import { downloadReport } from '../../../services/api';
import { toast } from 'react-toastify';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real live data fetching for KPIs
  const { auctions } = useAuctions();
  const { players } = usePlayers();
  const { teams } = useTeams();
  
  // Derived KPIs
  const totalAuctions = auctions.length;
  const totalPlayers = players.length;
  const activeTeams = teams.filter(t => t.status !== 'Inactive').length;
  const totalRevenue = teams.reduce((acc, curr) => acc + (curr.totalPurse || 0), 0);

  // Define actual functional reports mapped to our backend endpoints
  const systemReports = [
    { 
      id: 'REP_PLAYERS', 
      name: 'Player Roster Report', 
      description: 'Complete roster of all players, base prices, roles, and current teams.', 
      endpoint: '/api/v1/reports/players',
      type: 'Operational' 
    },
    { 
      id: 'REP_TEAMS', 
      name: 'Team Revenue Report', 
      description: 'Financial overview of team budgets versus money spent.', 
      endpoint: '/api/v1/reports/teams',
      type: 'Financial' 
    }
  ];

  const handleDownload = async (endpoint, format, reportName) => {
    try {
      toast.info(`Generating ${format.toUpperCase()} for ${reportName}...`);
      await downloadReport(endpoint, format);
      toast.success(`${reportName} downloaded successfully!`);
    } catch (error) {
      toast.error(`Failed to download ${reportName}`);
    }
  };

  const columns = [
    { key: 'name', label: 'Report Name' },
    { key: 'description', label: 'Description' },
    { 
      key: 'type', 
      label: 'Type',
      render: (val) => (
        <Badge variant={val === 'Financial' ? 'success' : 'info'}>
          {val}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <ActionMenu 
          actions={[
            { 
              label: 'Download PDF', 
              onClick: () => handleDownload(row.endpoint, 'pdf', row.name), 
              icon: <IconDownload size={16} /> 
            },
            { 
              label: 'Download CSV', 
              onClick: () => handleDownload(row.endpoint, 'csv', row.name), 
              icon: <IconFileSpreadsheet size={16} /> 
            }
          ]}
        />
      )
    }
  ];

  const filteredReports = systemReports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Export financial statements and operational player rosters"
      />

      <KPICardRow>
        <KPICard title="Total Auctions" value={totalAuctions} icon={<IconReportAnalytics />} />
        <KPICard title="Total Budget (All Teams)" value={`₹${totalRevenue > 0 ? (totalRevenue / 10000000).toFixed(1) + ' Cr' : '0'}`} icon={<IconReportMoney />} />
        <KPICard title="Total Players" value={totalPlayers} icon={<IconUsers />} />
        <KPICard title="Active Teams" value={activeTeams} icon={<IconShield />} />
      </KPICardRow>

      <SearchFilterBar 
        searchPlaceholder="Search reports..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Actual Charting using Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Team Budget Distribution" subtitle="Distribution of total purse across registered teams">
          <div className="h-64 w-full">
            {teams.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teams.map(team => ({ name: team.shortName || team.name, value: team.totalPurse || 0 }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {teams.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'][index % 7]} />
                    ))}
                  </Pie>
                  <PieTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <PieLegend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 rounded-md border border-dashed border-gray-200">
                <span>No team data available</span>
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Player Role Breakdown" subtitle="Distribution of players by their playing role">
          <div className="h-64 w-full">
            {players.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    Object.entries(players.reduce((acc, p) => {
                      const r = p.role || 'Unknown';
                      acc[r] = (acc[r] || 0) + 1;
                      return acc;
                    }, {})).map(([name, count]) => ({ name, count }))
                  }
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <BarTooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 rounded-md border border-dashed border-gray-200">
                <span>No player data available</span>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Available Export Reports</h3>
        </div>
        <DataTable columns={columns} data={filteredReports} />
      </div>
    </div>
  );
}
