import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { IconMenu2, IconX } from '@tabler/icons-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Home', href: '#' },
    { name: 'Auctions', href: '#auctions' },
    { name: 'Players', href: '#players' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#111111] border-b border-[#222222] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 md:gap-4 hover:opacity-90 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1a1a] shadow-[0_0_10px_rgba(245,158,11,0.2)] border border-[#2a2a2a]">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
                <path d="M12 11a1 1 0 1 0 0 -2a1 1 0 0 0 0 2z" />
                <path d="M12 11v2.5" />
              </svg>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight text-[#F59E0B]">
                Auct<span className="text-white">XI</span>
              </span>
              <div className="hidden sm:block h-5 w-[1px] bg-[#333333]"></div>
              <span className="hidden sm:block text-xs font-semibold tracking-[0.2em] text-[#6b7280]">
                BID. BUILD. WIN.
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Button onClick={() => window.location.href='/signup'} variant="outline" size="sm" className="mr-2 text-white bg-transparent border-gray-600 hover:bg-gray-800">Register</Button>
            <Button onClick={() => window.location.href='/signup'} variant="primary" size="sm">Create Auction</Button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white focus:outline-none">
              {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#111111] border-b border-[#222222]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <a key={link.name} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-[#222222]">
                {link.name}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-[#222222] flex flex-col space-y-2 px-3">
              <Link to="/login" className="block text-center py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-[#222222] rounded-md">
                Login
              </Link>
              <Button onClick={() => window.location.href='/signup'} variant="outline" className="w-full justify-center text-white bg-transparent border-gray-600 hover:bg-gray-800">Register</Button>
              <Button onClick={() => window.location.href='/signup'} variant="primary" className="w-full justify-center mt-2">Create Auction</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
