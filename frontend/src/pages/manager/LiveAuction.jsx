import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import PlayerDetailCard from '../../components/auction/PlayerDetailCard';
import BidControls from '../../components/auction/BidControls';
import ActiveTeamsCard from '../../components/auction/ActiveTeamsCard';
import BidHistoryCard from '../../components/auction/BidHistoryCard';
import { useAuctions } from '../../hooks/useAuctions';
import { useTeams } from '../../hooks/useTeams';
import { useLiveAuction } from '../../hooks/useLiveAuction';
import { api } from '../../services/api';

export default function LiveAuction() {
  const { auctions, fetchAuctions, fetchAuctionById } = useAuctions();
  const { teams, fetchTeams } = useTeams();
  
  const [targetAuctionId, setTargetAuctionId] = useState(null);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [bidTimer, setBidTimer] = useState(null);
  const isAutoSelling = React.useRef(false);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Handle Countdown timer logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        const next = countdown - 1;
        setCountdown(next);
        if (next === 0 && targetAuctionId) {
          // Auto-start the auction when countdown hits 0
          api.post(`/api/v1/auctions/${targetAuctionId}/start`)
             .catch(err => console.error("Auto start failed", err));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, targetAuctionId]);

  const handleStateChange = useCallback((stateMsg) => {
    if (stateMsg === "STARTING_IN_10") {
      setCountdown(10);
      return; // Do not fetch state yet
    }
    // Delay to allow backend transaction to commit completely before fetching
    setTimeout(() => {
      fetchAuctionById(targetAuctionId).then(setAuction);
      fetchTeams(); // Update team budgets and squads
    }, 500);
  }, [targetAuctionId, fetchAuctionById, fetchTeams]);

  const currentPlayer = auction?.currentPlayer;
  const { isConnected, bids } = useLiveAuction(targetAuctionId, currentPlayer?.id, handleStateChange);

  useEffect(() => {
    if (!targetAuctionId) return;
    
    setLoading(true);
    fetchAuctionById(targetAuctionId).then(data => {
      setAuction(data);
      setLoading(false);
    }).catch(err => {
      console.warn("Failed to fetch live auction data", err);
      setLoading(false);
    });
  }, [targetAuctionId, fetchAuctionById]);

  const handleSell = useCallback(async () => {
    if (!currentPlayer || !targetAuctionId) return;
    try {
      await api.post(`/api/v1/bidding/${targetAuctionId}/players/${currentPlayer.id}/sell`);
      toast.success("Player finalized!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to finalize player.");
    }
  }, [currentPlayer, targetAuctionId]);

  const handleUnsold = useCallback(() => {
    if (bids.length > 0) {
      toast.warning("Bids exist. Please click 'Sell' to finalize the sale.");
      return;
    }
    handleSell();
  }, [bids.length, handleSell]);

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
      isAutoSelling.current = false;
    }
  }, [auction?.timerEndTime, auction?.status, currentPlayer]);

  // Handle Auto-Sell when timer hits 0
  useEffect(() => {
     if (bidTimer === 0 && auction?.status === 'ONGOING' && currentPlayer && !isAutoSelling.current) {
        isAutoSelling.current = true;
        handleSell();
     }
  }, [bidTimer, auction?.status, currentPlayer, handleSell]);

  // -----------------------------------------------------
  // RENDER: Auction Selection Screen
  // -----------------------------------------------------
  if (!targetAuctionId) {
    const availableAuctions = auctions?.filter(a => a.status === 'UPCOMING' || a.status === 'ONGOING') || [];
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Select Auction to Manage" 
          description="Choose an UPCOMING or ONGOING auction to go live." 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableAuctions.length === 0 && (
            <p className="text-slate-500">No active or upcoming auctions available. Create one first.</p>
          )}
          {availableAuctions.map(a => (
            <div 
              key={a.id} 
              onClick={() => setTargetAuctionId(a.id)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{a.name}</h3>
                 <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${a.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                   {a.status}
                 </span>
              </div>
              <p className="text-sm text-slate-500 mt-auto flex items-center gap-2">
                 <i className="fi fi-rr-arrow-right"></i> Click to manage live event
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

  // -----------------------------------------------------
  // RENDER: Live Auction Control View
  // -----------------------------------------------------
  if (loading) return <div className="p-8 text-center text-slate-500">Loading Live Auction Framework...</div>;

  const highestBid = bids.length > 0 ? bids[0].bidAmount : 0;
  const highestBidderName = bids.length > 0 ? bids[0].teamName : null;
  const isLive = auction?.status === 'ONGOING';



  const handleNextPlayer = async () => {
    if (!targetAuctionId) return;
    try {
      await api.post(`/api/v1/auctions/${targetAuctionId}/next-player`);
      toast.success("Next player brought to podium.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch next player.");
    }
  };

  const handleStartAuction = async () => {
    if (!targetAuctionId) return;
    try {
      // Broadcast the STARTING_IN_10 message to everyone
      await api.post(`/api/v1/auctions/${targetAuctionId}/announce-start`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to announce auction start.");
    }
  };

  const handleEndAuction = async () => {
    if (!targetAuctionId) return;
    if (!window.confirm("Are you sure you want to end this auction? This action cannot be undone.")) return;
    
    try {
      await api.post(`/api/v1/auctions/${targetAuctionId}/end`);
      toast.success("Auction has been successfully ended.");
      fetchAuctions(); // Refresh the global auction list
      setTargetAuctionId(null); // Return to the selection grid
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end auction.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Live Auction Control"
          description={`Manage the active auction, bids, and players in real-time.`}
        />
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setTargetAuctionId(null);
              fetchAuctions();
            }} 
            className="text-sm font-medium text-slate-500 hover:text-slate-800 border border-slate-200 bg-white px-3 py-1.5 rounded-lg shadow-sm"
          >
            Switch Auction
          </button>
          {auction?.status !== 'COMPLETED' && (
            <button onClick={handleEndAuction} className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 bg-white px-3 py-1.5 rounded-lg shadow-sm transition-colors">
              End Auction
            </button>
          )}
          <span className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border ${isConnected ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            {isConnected ? 'Live (WS Connected)' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {currentPlayer ? (
            <PlayerDetailCard player={currentPlayer} highestBid={highestBid} highestBidderName={highestBidderName} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <i className="fi fi-rr-gavel text-2xl text-slate-400"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Podium is Empty</h3>
              <p className="text-slate-500 mb-6">There is no player currently under the hammer.</p>
              
              {!isLive && auction?.status !== 'COMPLETED' ? (
                <button 
                  onClick={handleStartAuction}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors font-semibold"
                >
                  Start Auction
                </button>
              ) : (
                <button 
                  onClick={handleNextPlayer} 
                  disabled={!isLive}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg shadow-sm transition-colors font-semibold"
                >
                  {isLive ? "Call Next Player" : "Auction Ended"}
                </button>
              )}
            </div>
          )}
          <BidControls 
            onSell={handleSell} 
            onUnsold={handleUnsold} 
            highestBid={highestBid} 
            highestBidder={highestBidderName} 
            isLive={isLive} 
            bidTimer={bidTimer}
          />
        </div>
        
        <div className="space-y-6 flex flex-col h-full">
          <ActiveTeamsCard activeTeams={teams.filter(t => t.auctionId === targetAuctionId)} />
          <BidHistoryCard bidHistory={bids} />
        </div>
      </div>
    </div>
  );
}
