import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { IconUsers, IconWallet, IconTrophy } from '@tabler/icons-react';
import { useTeams } from '../../hooks/useTeams';

export default function LiveTeams() {
  const { teams, loading, error } = useTeams();

  const formatBudget = (amount) => {
    if (!amount) return { value: '0.0', unit: '' };
    if (amount >= 10000000) return { value: (amount / 10000000).toFixed(1), unit: 'Cr' };
    if (amount >= 100000) return { value: (amount / 100000).toFixed(1), unit: 'L' };
    return { value: amount.toLocaleString(), unit: '' };
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading teams...</div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500">{error}</div>;
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="w-full">
        <PageHeader 
          title="Live Teams" 
          breadcrumbs={[{ label: 'Dashboard', path: '/manager' }, { label: 'Live Teams' }]}
        />
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          No teams found. When clients create teams for your auctions, they will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <PageHeader 
        title="Live Teams" 
        breadcrumbs={[{ label: 'Dashboard', path: '/manager' }, { label: 'Live Teams' }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {teams.map(team => {
          const spent = (team.totalBudget || 0) - (team.remainingPurse || 0);
          const formattedTotal = formatBudget(team.totalBudget);
          const formattedSpent = formatBudget(spent);
          const formattedRemaining = formatBudget(team.remainingPurse);
          const squadSize = team.players ? team.players.length : 0;
          const maxSquad = team.auction?.auctionRules?.maxSquadSize || 25;
          const keyPlayers = team.players ? team.players.slice(0, 3) : [];
          
          return (
            <Card key={team.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 rounded-xl">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {team.logoUrl && !team.logoUrl.startsWith("http") && team.logoUrl.length < 5 ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-xl shadow-sm border border-amber-200 uppercase">
                        {team.shortName || team.name.substring(0, 2)}
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50">
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${team.name}&background=fef3c7&color=b45309`; }} />
                        ) : (
                          <span className="font-bold text-xl text-amber-700 uppercase">{team.shortName || team.name.substring(0, 2)}</span>
                        )}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-xl">
                        <Link to={`/manager/teams/${team.id}`} className="hover:text-amber-600 hover:underline transition-colors cursor-pointer">
                          {team.name}
                        </Link>
                      </CardTitle>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <IconUsers size={16} /> Squad: <span className="font-medium text-gray-700">{squadSize}/{maxSquad}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl bg-gray-50 p-4 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Total Purse</div>
                    <div className="font-bold text-gray-900 text-lg flex items-center justify-center gap-1">
                      <IconWallet size={18} className="text-gray-400" /> ₹{formattedTotal.value} {formattedTotal.unit}
                    </div>
                  </div>
                  <div className="rounded-xl bg-red-50 p-4 text-center border border-red-100">
                    <div className="text-xs text-red-600 mb-1.5 uppercase tracking-wider font-semibold">Spent</div>
                    <div className="font-bold text-red-700 text-lg">
                      ₹{formattedSpent.value} {formattedSpent.unit}
                    </div>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 text-center border border-green-100">
                    <div className="text-xs text-green-600 mb-1.5 uppercase tracking-wider font-semibold">Remaining</div>
                    <div className="font-bold text-green-700 text-lg">
                      ₹{formattedRemaining.value} {formattedRemaining.unit}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <IconTrophy size={18} className="text-amber-500" /> Key Players
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {keyPlayers.length > 0 ? (
                      keyPlayers.map((player, idx) => (
                        <Link key={idx} to={`/manager/player-pool/${player.id}`} className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:border-amber-300 hover:text-amber-700 hover:shadow transition-all cursor-pointer">
                          {player.name}
                        </Link>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">No players bought yet.</span>
                    )}
                    {squadSize > 3 && (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 border-dashed">
                        +{squadSize - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
