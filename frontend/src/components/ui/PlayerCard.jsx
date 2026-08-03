import React from 'react';

const PlayerCard = ({ player }) => {
  if (!player) return null;

  const {
    name = 'Unknown',
    role = 'BATSMAN',
    isWicketKeeper,
    imageUrl,
    category = 'CAPPED',
    basePrice = 0,
    statistics = {}
  } = player;

  const {
    matches = 0,
    runs = 0,
    highestScore = 0,
    battingAverage = 0,
    strikeRate = 0,
    wickets = 0,
    economy = 0,
    catches = 0
  } = statistics || {};

  // Formatter for short role
  const getShortRole = () => {
    if (isWicketKeeper) return 'WK';
    if (role === 'BATSMAN') return 'BAT';
    if (role === 'BOWLER') return 'BWL';
    if (role === 'ALL_ROUNDER') return 'AR';
    return 'PLY';
  };

  // Convert base price to a readable format (e.g., 20M or 2Cr)
  const formatPrice = (price) => {
    if (!price) return '0';
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)}CR`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)}L`;
    return price.toString();
  };

  // Fut-style shield clip-path
  const shieldStyle = {
    clipPath: 'polygon(50% 0%, 100% 12%, 100% 85%, 50% 100%, 0% 85%, 0% 12%)',
  };

  return (
    <div className="relative w-[300px] h-[460px] mx-auto group">
      {/* Glow effect behind the card */}
      <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
      
      {/* Main Card */}
      <div 
        className="relative w-full h-full bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-[2px] transition-transform duration-300 group-hover:scale-[1.02]"
        style={shieldStyle}
      >
        {/* Inner Card (to create border effect) */}
        <div 
          className="relative w-full h-full bg-gradient-to-b from-indigo-950 via-purple-950 to-black text-amber-200 flex flex-col items-center overflow-hidden"
          style={shieldStyle}
        >
          {/* Subtle background texture/glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-800/40 via-transparent to-transparent"></div>

          {/* Top Left Info */}
          <div className="absolute top-12 left-6 flex flex-col items-center z-20 drop-shadow-md">
            <span className="text-3xl font-black leading-none">{formatPrice(basePrice)}</span>
            <span className="text-lg font-bold uppercase tracking-wider">{getShortRole()}</span>
            {/* Divider */}
            <div className="w-8 h-[2px] bg-amber-200/50 my-1"></div>
            {/* Category / Icon */}
            <span className="text-[10px] font-bold uppercase opacity-80">{category}</span>
          </div>

          {/* Player Image */}
          <div className="mt-14 h-48 w-full flex justify-center z-10 relative">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={name} 
                className="h-[120%] w-auto object-cover object-bottom drop-shadow-2xl brightness-110 contrast-125 saturate-110" 
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-white/5 border-2 border-amber-200/20 flex items-center justify-center text-6xl font-bold text-amber-400 mt-4">
                {name ? name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            
            {/* Fade out bottom of image */}
            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-indigo-950/80 to-transparent"></div>
          </div>

          {/* Player Name */}
          <div className="w-[85%] text-center border-b border-amber-200/30 pb-2 mb-3 z-20 mt-4">
            <h2 className="text-3xl font-black uppercase tracking-widest text-amber-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {name.split(' ').pop()}
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="flex w-[80%] z-20 text-lg font-semibold px-2">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-1.5 pr-4 border-r border-amber-200/30">
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-amber-100">{runs}</span>
                <span className="text-sm font-bold opacity-90 uppercase">RUN</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-amber-100">{battingAverage}</span>
                <span className="text-sm font-bold opacity-90 uppercase">AVG</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-amber-100">{strikeRate}</span>
                <span className="text-sm font-bold opacity-90 uppercase">SR</span>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="flex-1 flex flex-col gap-1.5 pl-4">
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-amber-100">{wickets}</span>
                <span className="text-sm font-bold opacity-90 uppercase">WKT</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-amber-100">{economy}</span>
                <span className="text-sm font-bold opacity-90 uppercase">ECO</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-amber-100">{catches}</span>
                <span className="text-sm font-bold opacity-90 uppercase">CAT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
