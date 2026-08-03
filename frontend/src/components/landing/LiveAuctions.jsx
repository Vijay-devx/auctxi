import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

const LiveAuctions = () => {
  return (
    <div className="py-16 bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              LIVE NOW
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Summer Slam T20
            </h2>
            <p className="text-gray-400 text-lg max-w-xl">
              The biggest auction of the season is currently underway. Watch teams battle it out for the top players in real-time.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-gray-400 uppercase">Teams</div>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <div className="text-2xl font-bold text-white">45</div>
                <div className="text-xs text-gray-400 uppercase">Sold</div>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <div className="text-2xl font-bold text-[#f59e0b]">₹2.4Cr</div>
                <div className="text-xs text-gray-400 uppercase">Highest Bid</div>
              </div>
            </div>
            <div className="pt-6">
              <Link to="/login">
                <Button variant="primary" size="lg" className="mr-4">Join Auction</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">Spectate</Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <Card className="bg-gray-900 border-gray-800 shadow-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div className="text-sm text-gray-400">Current Player</div>
                    <div className="text-sm font-medium text-red-400 animate-pulse">Bidding in progress...</div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                      VK
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Virat Kohli</h3>
                      <p className="text-gray-400">Batsman • Base: ₹50L</p>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 mt-6">
                    <div className="text-sm text-gray-400 mb-1">Current Bid</div>
                    <div className="text-3xl font-bold text-[#f59e0b]">₹1.8Cr</div>
                    <div className="text-sm text-gray-300 mt-2">by Royal Challengers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAuctions;
