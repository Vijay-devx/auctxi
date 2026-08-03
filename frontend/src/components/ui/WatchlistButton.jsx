import React, { useState, useEffect } from 'react';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

const WatchlistButton = ({ playerId }) => {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!playerId) return;
      try {
        const response = await api.get(`/api/v1/watchlist/${playerId}/status`);
        setIsWatchlisted(response.data);
      } catch (error) {
        console.error("Failed to check watchlist status", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [playerId]);

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLoading || !playerId) return;
    
    setIsLoading(true);
    try {
      if (isWatchlisted) {
        await api.delete(`/api/v1/watchlist/${playerId}`);
        setIsWatchlisted(false);
        toast.success("Removed from watchlist");
      } else {
        await api.post(`/api/v1/watchlist/${playerId}`);
        setIsWatchlisted(true);
        toast.success("Added to watchlist");
      }
    } catch (error) {
      console.error("Failed to toggle watchlist", error);
      toast.error("Failed to update watchlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleWatchlist} 
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
    >
      {isWatchlisted ? (
        <IconStarFilled className="text-amber-400 w-5 h-5" />
      ) : (
        <IconStar className="text-gray-400 hover:text-amber-400 w-5 h-5" />
      )}
    </button>
  );
};

export default WatchlistButton;
