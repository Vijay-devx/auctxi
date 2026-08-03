import React, { useState, useEffect } from 'react';
import AuctionCard from '../../components/ui/AuctionCard';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useAuctions } from '../../hooks/useAuctions';
import { useTeams } from '../../hooks/useTeams';
import { api } from '../../services/api';

const AuctionsList = () => {
  const { user } = useAuth();
  const { auctions, loading: loadingAuctions } = useAuctions();
  const { teams, loading: loadingTeams } = useTeams();
  const [watchlistedAuctions, setWatchlistedAuctions] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState('MY_AUCTIONS'); // 'MY_AUCTIONS' or 'WATCHLIST'

  useEffect(() => {
    if (activeTab === 'WATCHLIST') {
      const fetchWatchlist = async () => {
        try {
          setLoadingWatchlist(true);
          const response = await api.get('/api/v1/auction-watchlist');
          setWatchlistedAuctions(response.data || []);
        } catch (error) {
          console.error("Failed to fetch watchlisted auctions", error);
        } finally {
          setLoadingWatchlist(false);
        }
      };
      fetchWatchlist();
    }
  }, [activeTab]);

  // Find teams owned by this client
  const myTeams = teams.filter(t => t.owner?.id === user?.id);
  const myAuctionIds = new Set(myTeams.map(t => t.auctionId));
  
  const myActiveAuctions = auctions.filter(a => myAuctionIds.has(a.id) && (a.status === 'ONGOING' || a.status === 'UPCOMING' || a.status === 'PAUSED'));
  const myPastAuctions = auctions.filter(a => myAuctionIds.has(a.id) && a.status === 'COMPLETED');

  const isLoading = loadingAuctions || loadingTeams;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader 
          title="My Auctions" 
          description="Manage your active participations and watchlisted auctions" 
          showNotification={false}
          className="mb-0"
        />
        
        {/* Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('MY_AUCTIONS')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'MY_AUCTIONS' ? 'bg-white text-[#f59e0b] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            My Teams & Auctions
          </button>
          <button 
            onClick={() => setActiveTab('WATCHLIST')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'WATCHLIST' ? 'bg-white text-[#f59e0b] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Watchlisted Auctions
          </button>
        </div>
      </div>

      {activeTab === 'MY_AUCTIONS' ? (
        <div className="space-y-8">
          {/* Active Auctions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Active Auctions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-gray-500">Loading your auctions...</div>
              ) : myActiveAuctions.length > 0 ? (
                myActiveAuctions.map(auction => (
                  <AuctionCard 
                    key={auction.id} 
                    auction={auction} 
                    application={{ status: 'APPROVED' }}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  You are not currently participating in any active auctions. 
                  Go to the Home page to explore and join auctions!
                </div>
              )}
            </div>
          </div>

          {/* Past Auctions */}
          {myPastAuctions.length > 0 && (
            <div className="space-y-6 pt-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Past Auctions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {myPastAuctions.map(auction => (
                  <AuctionCard 
                    key={auction.id} 
                    auction={auction} 
                    application={{ status: 'APPROVED' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Watchlisted Auctions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loadingWatchlist ? (
              <div className="col-span-full py-12 text-center text-gray-500">Loading your watchlist...</div>
            ) : watchlistedAuctions.length > 0 ? (
              watchlistedAuctions.map(auction => (
                <AuctionCard 
                  key={auction.id} 
                  auction={auction}
                  onWatchlistChange={(auctionId, isWatchlisted) => {
                    if (!isWatchlisted) {
                      setWatchlistedAuctions(prev => prev.filter(a => a.id !== auctionId));
                    }
                  }}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                You haven't added any auctions to your watchlist yet.
                Click the heart icon on any auction card to save it here!
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AuctionsList;
