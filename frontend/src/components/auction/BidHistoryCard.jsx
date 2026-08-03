import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { IconHistory, IconCurrencyRupee } from '@tabler/icons-react';

export default function BidHistoryCard({ bidHistory }) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconHistory className="w-5 h-5 text-gray-500" />
            <CardTitle className="text-base">Bid History</CardTitle>
          </div>
          <Badge variant="secondary">{bidHistory?.length || 0} Bids</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <div className="h-[350px] overflow-y-auto px-6 py-2">
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {bidHistory?.map((bid, index) => (
              <div key={bid.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline Dot */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${index === 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                  <IconCurrencyRupee className="w-5 h-5" />
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${index === 0 ? 'text-amber-600 text-lg' : 'text-gray-900'}`}>₹{Number(bid.amount || bid.bidAmount).toLocaleString()}</span>
                    <span className="text-xs text-gray-500">{bid.time || (bid.timestamp ? new Date(bid.timestamp).toLocaleTimeString() : '')}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-600">{bid.teamName || bid.team?.name || bid.teamId}</p>
                </div>
              </div>
            ))}
            {(!bidHistory || bidHistory.length === 0) && (
              <div className="text-center text-gray-500 py-10 relative z-10">No bids yet</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
