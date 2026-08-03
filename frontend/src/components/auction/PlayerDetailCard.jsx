import React from 'react';
import { Card, CardContent } from '../ui/Card';
import RoleBadge from '../ui/RoleBadge';
import { Badge } from '../ui/Badge';

export default function PlayerDetailCard({ player, highestBid, highestBidderName }) {
  if (!player) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="shrink-0">
            <img 
              src={player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=200&background=111111&color=F59E0B`}
              alt={player.name} 
              className="w-32 h-32 md:w-48 md:h-48 rounded-xl object-cover border-4 border-gray-100 shadow-sm"
            />
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{player.name}</h2>
                <div className="mt-2">
                  <RoleBadge role={player.role} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">Base Price</p>
                <Badge variant="secondary" className="text-lg py-1 px-3">
                  {player.basePrice}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100">
              <div className="text-center md:text-left">
                <p className="text-xs text-gray-500 font-medium">Matches</p>
                <p className="text-lg font-semibold text-gray-900">{player.statistics?.matches || '-'}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs text-gray-500 font-medium">Runs</p>
                <p className="text-lg font-semibold text-gray-900">{player.statistics?.runs || '-'}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs text-gray-500 font-medium">Wickets</p>
                <p className="text-lg font-semibold text-gray-900">{player.statistics?.wickets || '-'}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs text-gray-500 font-medium">Average</p>
                <p className="text-lg font-semibold text-gray-900">{player.statistics?.average || '-'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div>
                <p className="text-sm font-medium text-amber-800">Current Highest Bid</p>
                <p className="text-3xl font-bold text-amber-600">{highestBid > 0 ? `₹${highestBid.toLocaleString()}` : 'None'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-amber-800">Bidder</p>
                <p className="text-lg font-bold text-gray-900">{highestBidderName || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
