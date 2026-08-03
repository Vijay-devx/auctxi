import React, { useState, useEffect } from 'react';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

const AuctionWatchlistButton = ({ auctionId, onChange }) => {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auctionId) return;

    const checkStatus = async () => {
      try {
        const response = await api.get(`/api/v1/auction-watchlist/${auctionId}/status`);
        setIsWatchlisted(response.data);
      } catch (error) {
        console.error('Failed to check auction watchlist status', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    const handleWatchlistChange = (e) => {
      if (e.detail.auctionId === auctionId) {
        setIsWatchlisted(e.detail.isWatchlisted);
      }
    };

    window.addEventListener('auction-watchlist-changed', handleWatchlistChange);
    return () => window.removeEventListener('auction-watchlist-changed', handleWatchlistChange);
  }, [auctionId]);

  const toggleWatchlist = async (e) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    
    if (loading) return;

    setLoading(true);

    try {
      if (isWatchlisted) {
        await api.delete(`/api/v1/auction-watchlist/${auctionId}`);
        setIsWatchlisted(false);
        toast.info('Removed from Watchlist');
        onChange?.(auctionId, false);
        window.dispatchEvent(new CustomEvent('auction-watchlist-changed', { detail: { auctionId, isWatchlisted: false } }));
      } else {
        await api.post(`/api/v1/auction-watchlist/${auctionId}`);
        setIsWatchlisted(true);
        toast.success('Added to Watchlist');
        onChange?.(auctionId, true);
        window.dispatchEvent(new CustomEvent('auction-watchlist-changed', { detail: { auctionId, isWatchlisted: true } }));
      }
    } catch (error) {
      console.error('Failed to toggle auction watchlist status', error);
      toast.error('Failed to update watchlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleWatchlist}
      disabled={loading}
      className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 transition-colors shadow-sm z-20 relative"
      title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
    >
      {isWatchlisted ? (
        <IconHeartFilled size={18} className="text-red-500" />
      ) : (
        <IconHeart size={18} className={loading ? "opacity-50" : ""} />
      )}
    </button>
  );
};

export default AuctionWatchlistButton;
