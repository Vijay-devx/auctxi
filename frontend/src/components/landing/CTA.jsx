import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

const CTA = () => {
  return (
    <div className="bg-[#f59e0b] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to host your next big auction?
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of organizers and managers who trust AuctXI for their cricket leagues.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[#f59e0b] hover:bg-gray-100 shadow-lg w-full sm:w-auto">
              Get Started for Free
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto">
              Login to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTA;
