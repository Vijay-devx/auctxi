import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IconBell, IconUser } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const ClientHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-[#111111] px-6 shadow-md md:px-12">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-3xl font-black tracking-tight text-primary-500">
          Auct<span className="text-white">XI</span>
        </span>
        <div className="ml-2 mt-1 flex flex-col">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider">BID. BUILD. WIN</span>
        </div>
      </div>

      {/* Center Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <NavLink
          to="/client/dashboard"
          className={({ isActive }) => cn(
            "text-base font-medium transition-colors hover:text-primary-500",
            isActive ? "text-primary-500" : "text-white"
          )}
        >
          Home
        </NavLink>
        <NavLink
          to="/client/auction"
          className={({ isActive }) => cn(
            "text-base font-medium transition-colors hover:text-primary-500",
            isActive ? "text-primary-500" : "text-white"
          )}
        >
          My Auctions
        </NavLink>
        <NavLink
          to="/client/payments"
          className={({ isActive }) => cn(
            "text-base font-medium transition-colors hover:text-primary-500",
            isActive ? "text-primary-500" : "text-white"
          )}
        >
          Payments
        </NavLink>
        <NavLink
          to="/client/profile"
          className={({ isActive }) => cn(
            "text-base font-medium transition-colors hover:text-primary-500",
            isActive ? "text-primary-500" : "text-white"
          )}
        >
          Profile
        </NavLink>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        <button className="text-white hover:text-primary-500 transition-colors">
          <IconBell size={24} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111111]">
            <IconUser size={24} />
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-gray-400 hover:text-white hidden sm:block">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
