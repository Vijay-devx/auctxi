import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import PlayerDetailCard from '../../components/auction/PlayerDetailCard';
import BidHistoryCard from '../../components/auction/BidHistoryCard';
import { useLiveAuction } from '../../hooks/useLiveAuction';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LiveAuctionClient() {
  const { id: targetAuctionId } = useParams();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [bidTimer, setBidTimer] = useState(null);

  const fetchAuctionData = useCallback(async () => {
    try {
      const res = await api.get(`/api/v1/auctions/${targetAuctionId}`);
      setAuction(res.data);
    } catch (err) {
      toast.error("Failed to load auction data");
    }
  }, [targetAuctionId]);

  const fetchMyTeam = useCallback(async () => {
    try {
      const res = await api.get(`/api/v1/teams/auction/${targetAuctionId}`);
      if (res.data && res.data.length > 0) {
         const userTeam = res.data.find(t => t.owner?.id === user?.id);
         if (userTeam) {
            setMyTeam(userTeam); 
         }
      }
    } catch (err) {
      console.warn("Could not fetch teams", err);
    } finally {
      setLoading(false);
    }
  }, [targetAuctionId, user]);

  useEffect(() => {
    fetchAuctionData();
    fetchMyTeam();
  }, [fetchAuctionData, fetchMyTeam]);

  // Handle Countdown timer logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const currentPlayer = auction?.currentPlayer;

  // Handle Bid Timer countdown logic
  useEffect(() => {
    if (auction?.timerEndTime && auction?.status === 'ONGOING' && currentPlayer) {
      const updateTimer = () => {
        const timeStr = auction.timerEndTime.endsWith('Z') ? auction.timerEndTime : `${auction.timerEndTime}Z`;
        const end = new Date(timeStr).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        setBidTimer(diff);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setBidTimer(null);
    }
  }, [auction?.timerEndTime, auction?.status, currentPlayer]);

  const handleStateChange = useCallback((stateMsg) => {
    if (stateMsg === "STARTING_IN_10") {
      setCountdown(10);
      return; 
    }
    // Delay to allow backend transaction to commit completely before fetching
    setTimeout(() => {
      fetchAuctionData();
      fetchMyTeam(); // Update remaining purse and squad size
    }, 500);
  }, [fetchAuctionData, fetchMyTeam]);

  const { isConnected, bids } = useLiveAuction(targetAuctionId, currentPlayer?.id, handleStateChange);

  const isLive = auction?.status === 'ONGOING';
  const highestBid = bids.length > 0 ? bids[0].bidAmount : (currentPlayer?.basePrice || 0);
  const highestBidderName = bids.length > 0 ? bids[0].teamName : null;
  const highestBidderTeamId = bids.length > 0 ? bids[0].teamId : null;
  const amIHighestBidder = myTeam && highestBidderTeamId === myTeam.id;
  
  const bidIncrement = 10;
  const nextBidAmount = highestBid + bidIncrement;

  const handlePlaceBid = () => {
    if (!myTeam) {
      toast.error("You do not have a team registered for this auction.");
      return;
    }
    if (myTeam.remainingPurse < nextBidAmount) {
      toast.error("Insufficient purse for this bid.");
      return;
    }
    
    api.post(`/api/v1/bidding/${targetAuctionId}/players/${currentPlayer.id}/bid`, {
      teamId: myTeam.id,
      amount: nextBidAmount
    }).then(() => {
      toast.success(`Bid placed for ₹${nextBidAmount.toLocaleString()}`);
    }).catch(err => {
      toast.error(err.response?.data?.message || "Failed to place bid");
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Live Auction...</div>;

  // -----------------------------------------------------
  // RENDER: Countdown Overlay
  // -----------------------------------------------------
  if (countdown > 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white">
         <h1 className="text-4xl md:text-5xl font-bold mb-8 text-slate-300 tracking-widest uppercase">Auction goes live in</h1>
         <div className="text-[10rem] md:text-[15rem] leading-none font-black text-emerald-400 animate-pulse">
           {countdown}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={auction ? `${auction.name} - LIVE` : "Live Auction"}
          description="Place your bids in real-time."
        />
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border ${isConnected ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>
             <span className="relative flex h-2.5 w-2.5">
               {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
               <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
             </span>
             {isConnected ? 'Live' : 'Offline'}
          </span>
          {myTeam && (
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm flex gap-6">
              <div>
                <p className="text-xs text-slate-500">Remaining Purse</p>
                <p className="text-lg font-bold text-slate-900">₹{myTeam.remainingPurse?.toLocaleString()}</p>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <p className="text-xs text-slate-500">Squad</p>
                <p className="text-lg font-bold text-slate-900">{myTeam.players?.length || 0}/15</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {currentPlayer ? (
            <>
              <PlayerDetailCard player={currentPlayer} highestBid={highestBid} highestBidderName={highestBidderName} />
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center gap-4">
                 <div className="flex w-full justify-around items-center mb-4">
                    <div className="text-center space-y-1">
                       <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Highest Bid</p>
                       <p className="text-4xl font-bold text-emerald-600">₹{highestBid?.toLocaleString()}</p>
                    </div>
                    <div className="text-center space-y-1 border-l border-slate-200 pl-8">
                       <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Time Remaining</p>
                       <p className={`text-4xl font-bold ${bidTimer <= 5 && bidTimer !== null ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                          {bidTimer !== null ? `00:${bidTimer.toString().padStart(2, '0')}` : '--:--'}
                       </p>
                    </div>
                 </div>
                 
                 <button
                    onClick={handlePlaceBid}
                    disabled={!isLive || amIHighestBidder}
                    className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-4 rounded-xl shadow-sm transition-all text-xl"
                 >
                    {amIHighestBidder ? "You are highest bidder" : isLive ? `Place Bid ₹${nextBidAmount.toLocaleString()}` : "Bidding Paused"}
                 </button>
              </div>
            </>
          ) : auction?.status === 'COMPLETED' ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Auction Completed</h3>
              <p className="text-slate-500">This auction has officially ended. Thank you for participating!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fi fi-rr-time-quarter-to text-3xl text-slate-400"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Waiting for next player...</h3>
              <p className="text-slate-500">The auctioneer will bring the next player to the podium shortly.</p>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <BidHistoryCard bidHistory={bids} />
        </div>
      </div>
    </div>
  );
}
