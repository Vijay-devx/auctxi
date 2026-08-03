import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { IconCalendarEvent, IconClock, IconMapPin, IconUsers, IconHeart, IconHeartFilled, IconGavel } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

import AuctionWatchlistButton from './AuctionWatchlistButton';

const AuctionCard = ({ auction, application, onWatchlistChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [localApp, setLocalApp] = useState(application);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLocalApp(application);
  }, [application]);

  // Mocks if backend data is missing
  const maxTeams = auction.totalTeams || 16;
  const teamsJoined = auction.teamsJoined || 0;
  const logoBg = auction.logoBg || 'bg-amber-100 text-amber-800';
  const type = auction.type || 'League Auction';
  const location = auction.location || 'Online';
  const purseAmount = auction.initialPurse || auction.startingPrice || 0;
  const registrationFee = auction.registrationFee || auction.entryFee || 0;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumSignificantDigits: 3
    }).format(amount);
  };

  const isCompleted = auction.status === 'COMPLETED';

  return (
    <Card className={`flex flex-col h-full transition-all duration-300 ${isCompleted ? 'opacity-75 grayscale hover:shadow-none' : 'hover:shadow-lg'}`}>
      <CardContent className="p-0 flex flex-col flex-grow">
        
        {/* Banner Image / Logo Area */}
        <div className={`h-24 w-full rounded-t-2xl relative ${logoBg} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <span className="text-3xl font-black uppercase text-center relative z-10 shadow-sm opacity-90 mix-blend-overlay">
            {auction.name.substring(0, 3)}
          </span>
          <div className="absolute top-3 right-3 z-20">
            <AuctionWatchlistButton auctionId={auction.id} onChange={onWatchlistChange} />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{auction.name}</h3>
              <p className="text-xs font-medium text-[#f59e0b] uppercase tracking-wider">{type}</p>
            </div>
            <Badge variant={auction.status === 'LIVE' ? 'success' : auction.status === 'UPCOMING' ? 'warning' : 'default'}>
              {auction.status || 'UNKNOWN'}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600">
            {(() => {
              const displayTime = auction.status === 'UPCOMING' ? auction.scheduledStartTime : (auction.startTime || auction.scheduledStartTime);
              return (
                <>
                  <div className="flex items-center gap-1.5">
                    <IconCalendarEvent size={16} className="text-gray-400" />
                    <span>{formatDate(displayTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconClock size={16} className="text-gray-400" />
                    <span>{formatTime(displayTime)}</span>
                  </div>
                </>
              );
            })()}
            <div className="flex items-center gap-1.5">
              <IconMapPin size={16} className="text-gray-400" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconUsers size={16} className="text-gray-400" />
              <span>{teamsJoined} / {maxTeams} Teams</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 uppercase">Purse Amount</p>
              <p className="font-bold text-gray-900">{formatCurrency(purseAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Registration Fee</p>
              <p className="font-bold text-gray-900">{registrationFee > 0 ? formatCurrency(registrationFee) : 'Free'}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate(`/client/auction/${auction.id}`)}>
            View Details
          </Button>
          {(() => {
            let btnText = "Join Auction";
            let btnClass = "bg-[#111111] text-white hover:bg-[#222222]";
            let isDisabled = loading || auction.status === 'COMPLETED';
            let variant = "black";

            if (loading) {
              btnText = "Applying...";
            } else if (localApp) {
              variant = "outline";
              isDisabled = true;
              switch (localApp.status) {
                case 'PENDING':
                  btnText = "Pending Approval";
                  btnClass = "border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100";
                  break;
                case 'APPROVED':
                  btnText = "Approved";
                  btnClass = "border-green-500 text-green-700 bg-green-50 hover:bg-green-100";
                  break;
                case 'REJECTED':
                  btnText = "Rejected";
                  btnClass = "border-red-500 text-red-700 bg-red-50 hover:bg-red-100";
                  break;
                default:
                  btnText = "Joined";
                  btnClass = "border-gray-500 text-gray-700 bg-gray-50";
              }
            }

            return (
              <Button 
                variant={variant}
                className={btnClass}
                disabled={isDisabled}
                onClick={async () => {
                  if (localApp) {
                    toast.info("You have already applied for this auction.");
                    return;
                  }
                  try {
                    setLoading(true);
                    const teamName = user?.name ? `${user.name}'s Team` : 'My Team';
                    const shortName = user?.name ? user.name.substring(0, 3).toUpperCase() : 'TEA';
                    
                    const response = await api.post(`/api/v1/applications/auction/${auction.id}`, {
                      proposedTeamName: teamName,
                      proposedShortName: shortName,
                      logoUrl: ''
                    });
                    
                    setLocalApp(response.data || { status: 'PENDING' });
                    toast.success("Application submitted successfully!");
                  } catch (error) {
                    console.error("Failed to apply to auction:", error);
                    if (error.response?.data?.message?.includes("already")) {
                      setLocalApp({ status: 'PENDING' });
                      toast.info("You have already applied for this auction.");
                    } else {
                      toast.error(error.response?.data?.message || "Failed to join auction.");
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {btnText}
              </Button>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuctionCard;
// Vite HMR Refresh
