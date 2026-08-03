import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { IconGavel, IconArrowRight } from '@tabler/icons-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white pt-16 pb-32">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]"></span>
            </span>
            Platform v2.0 is Live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
            The Complete <span className="text-[#f59e0b]">Cricket Auction</span> Platform
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Manage your cricket leagues professionally with real-time bidding, automated squad building, and comprehensive player analytics. Built for organizers, managers, and players.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto group">
                Create Account
                <IconArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#auctions">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Auctions
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
