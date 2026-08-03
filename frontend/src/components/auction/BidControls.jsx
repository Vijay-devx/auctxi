import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconCurrencyRupee, IconGavel, IconX } from '@tabler/icons-react';

export default function BidControls({ onSell, onUnsold, highestBid, highestBidder, isLive, bidTimer }) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bid Controls</CardTitle>
        {bidTimer !== null && bidTimer !== undefined && (
          <div className="text-right">
             <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Time Left</span>
             <span className={`text-3xl font-black ${bidTimer <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                00:{bidTimer.toString().padStart(2, '0')}
             </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          
          {/* Sell / Unsold Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            <Button 
              className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={onSell}
              disabled={!isLive || !highestBidder}
            >
              <IconGavel className="w-6 h-6 mr-2" />
              SOLD {highestBidder ? `TO ${highestBidder} AT ₹${highestBid.toLocaleString()}` : ''}
            </Button>
            <Button 
              variant="danger"
              className="flex-1 h-14 text-lg font-bold"
              onClick={onUnsold}
              disabled={!isLive}
            >
              <IconX className="w-6 h-6 mr-2" />
              MARK UNSOLD
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
