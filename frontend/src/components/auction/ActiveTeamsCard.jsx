import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { IconUsersGroup } from '@tabler/icons-react';

export default function ActiveTeamsCard({ activeTeams }) {
  if (!activeTeams || activeTeams.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <IconUsersGroup className="w-5 h-5 text-gray-500" />
          <CardTitle className="text-base">Active Teams</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {activeTeams.map(team => (
            <div key={team.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${team.color || 'bg-blue-500'}`}></div>
                <span className="text-sm font-medium text-gray-900">{team.abbreviation || team.name || team.id}</span>
              </div>
              <span className="text-sm font-bold text-gray-700">₹{team.remainingPurse || team.purse || 0}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
