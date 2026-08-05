import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './DashboardOverview.css';

const API_BASE_URL = '/api/v1';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="dashboard-loader">Loading Analytics...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;
  if (!data) return null;

  // Formatting for charts
  const playerStats = [
    { name: 'Sold', value: data.totalSoldPlayers },
    { name: 'Unsold', value: data.totalUnsoldPlayers },
    { name: 'Available', value: data.totalAvailablePlayers }
  ];

  const budgetStats = [
    { name: 'Total Revenue', value: data.totalRevenue },
    { name: 'Available Purse', value: data.totalBudgetAvailable }
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Auction Control Center</h1>
        <p>Real-time analytics and statistics</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Total Players</h3>
          <p className="stat-value">{data.totalPlayers}</p>
        </div>
        <div className="stat-card green">
          <h3>Total Teams</h3>
          <p className="stat-value">{data.totalTeams}</p>
        </div>
        <div className="stat-card orange">
          <h3>Total Revenue</h3>
          <p className="stat-value">${data.totalRevenue?.toLocaleString()}</p>
        </div>
        <div className="stat-card purple">
          <h3>Budget Left</h3>
          <p className="stat-value">${data.totalBudgetAvailable?.toLocaleString()}</p>
        </div>
      </div>

      <div className="charts-container">
        {/* Pie Chart: Player Distribution */}
        <div className="chart-card">
          <h3>Player Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={playerStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {playerStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Budget Overview */}
        <div className="chart-card">
          <h3>Financial Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Amount ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="recent-activities-card">
        <h3>Recent Bids</h3>
        {data.recentActivities && data.recentActivities.length > 0 ? (
          <ul className="activity-list">
            {data.recentActivities.map((bid) => (
              <li key={bid.id} className="activity-item">
                <div className="activity-icon">💸</div>
                <div className="activity-details">
                  <p>
                    <strong>{bid.team?.name}</strong> placed a bid of 
                    <span className="bid-amount"> ${bid.amount?.toLocaleString()}</span>
                  </p>
                  <span className="activity-time">
                    {new Date(bid.createdAt).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No recent bidding activity.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
