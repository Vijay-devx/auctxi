/**
 * COMPONENT: Sidebar (Admin Layout)
 * ---------------------------------------------------------
 * This is the static navigation menu on the left side of the screen.
 * It contains all the primary navigation links (NavLink) which map directly
 * to the routes defined in App.jsx.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  IconLayoutDashboard, 
  IconGavel, 
  IconShirt, 
  IconUsersGroup, 
  IconUsers, 
  IconUserCog, 
  IconCurrencyRupee, 
  IconReceipt2, 
  IconReportAnalytics, 
  IconBell, 
  IconSettings, 
  IconHeadset, 
  IconHelp, 
  IconBroadcast, 
  IconStar, 
  IconUser, 
  IconLogout,
  IconChevronDown,
  IconChevronRight,
  IconShieldLock
} from '@tabler/icons-react';
import { cn } from '../../utils/cn';

/**
 * Sidebar Component
 * @param {Object} props
 * @param {boolean} props.isOpen - Mobile sidebar open state
 * @param {function} props.toggleSidebar - Function to toggle mobile sidebar
 */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  
  const getNavItems = () => {
    const role = user?.role || 'ROLE_CLIENT';
    
    switch(role) {
      case 'ROLE_ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: <IconLayoutDashboard size={20} /> },
          { name: 'Auctions', path: '/admin/auctions', icon: <IconGavel size={20} />, hasSub: true },
          { name: 'Teams', path: '/admin/teams', icon: <IconUsersGroup size={20} /> },
          { name: 'Players', path: '/admin/players', icon: <IconUsers size={20} /> },
          { name: 'Users', path: '/admin/users', icon: <IconUserCog size={20} /> },
          { name: 'Bids', path: '/admin/bids', icon: <IconCurrencyRupee size={20} /> },
          { name: 'Payments', path: '/admin/payments', icon: <IconReceipt2 size={20} /> },
          { name: 'Reports', path: '/admin/reports', icon: <IconReportAnalytics size={20} /> },
          { name: 'Notifications', path: '/admin/notifications', icon: <IconBell size={20} /> },
          { name: 'Settings', path: '/admin/settings', icon: <IconSettings size={20} /> },
          { name: 'Support', path: '/admin/support', icon: <IconHeadset size={20} /> },
        ];
      case 'ROLE_MANAGER':
        return [
          { name: 'Dashboard', path: '/manager/dashboard', icon: <IconLayoutDashboard size={20} /> },
          { name: 'Live Auction', path: '/manager/live-auction', icon: <IconBroadcast size={20} /> },
          { name: 'Player Pool', path: '/manager/player-pool', icon: <IconUsersGroup size={20} /> },
          { name: 'Live Teams', path: '/manager/live-teams', icon: <IconShirt size={20} /> },
          { name: 'Teams', path: '/manager/teams', icon: <IconUsersGroup size={20} /> },
          { name: 'Bids', path: '/manager/bids', icon: <IconCurrencyRupee size={20} /> },
          { name: 'Watchlist', path: '/manager/watchlist', icon: <IconStar size={20} /> },
          { name: 'Auctions', path: '/manager/auctions', icon: <IconGavel size={20} /> },
          { name: 'Payments', path: '/manager/payments', icon: <IconReceipt2 size={20} /> },
          { name: 'Applications', path: '/manager/applications', icon: <IconUserCog size={20} /> },
          { name: 'Invitations', path: '/manager/invitations', icon: <IconBell size={20} /> },
          { name: 'Reports', path: '/manager/reports', icon: <IconReportAnalytics size={20} /> },
          { name: 'Profile', path: '/manager/profile', icon: <IconUser size={20} /> },
          { name: 'Settings', path: '/manager/settings', icon: <IconSettings size={20} /> },
        ];
      case 'ROLE_CLIENT':
      default:
        return [
          { name: 'Dashboard', path: '/client/dashboard', icon: <IconLayoutDashboard size={20} /> },
          { name: 'Auctions', path: '/client/auctions', icon: <IconGavel size={20} /> },
          { name: 'Player Pool', path: '/client/player-pool', icon: <IconUsersGroup size={20} /> },
          { name: 'My Bids', path: '/client/my-bids', icon: <IconCurrencyRupee size={20} /> },
          { name: 'Watchlist', path: '/client/watchlist', icon: <IconStar size={20} /> },
          { name: 'My Teams', path: '/client/my-teams', icon: <IconShirt size={20} /> },
          { name: 'Payments', path: '/client/payments', icon: <IconReceipt2 size={20} /> },
          { name: 'Notifications', path: '/client/notifications', icon: <IconBell size={20} /> },
          { name: 'Profile', path: '/client/profile', icon: <IconUser size={20} /> },
          { name: 'Support', path: '/client/support', icon: <IconHeadset size={20} /> },
        ];
    }
  };

  const navItems = getNavItems();

  const getPanelTitle = () => {
    switch(user?.role) {
      case 'ROLE_ADMIN': return 'ADMIN PANEL';
      case 'ROLE_MANAGER': return 'MANAGER PANEL';
      case 'ROLE_CLIENT': return 'CLIENT PANEL';
      default: return 'AUCTION PANEL';
    }
  };

  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name.substring(0, 2).toUpperCase();
  };

  const getRoleName = () => {
    if (!user || !user.role) return 'User';
    return user.role.replace('ROLE_', '');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-[#222222] bg-[#111111] transition-transform duration-300 md:translate-x-0 md:static md:z-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="flex h-[80px] shrink-0 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] shadow-[0_0_10px_rgba(245,158,11,0.2)] border border-[#222222]">
              <IconShieldLock className="text-[#F59E0B]" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wide text-[#F59E0B]">
                Auct<span className="text-white">XI</span>
              </span>
              <span className="text-[10px] font-medium tracking-widest text-gray-400">
                {getPanelTitle()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="flex flex-col gap-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-[#F59E0B]/10 text-[#F59E0B] border-l-[3px] border-[#F59E0B]" 
                      : "text-gray-400 hover:bg-[#222222] hover:text-white border-l-[3px] border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.hasSub && (
                    <IconChevronRight size={16} className="text-gray-500" />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Manager Active Auction Widget placeholder (could be added dynamically) */}
        {user?.role === 'ROLE_MANAGER' && (
          <div className="mx-4 mb-4 rounded-xl border border-[#222222] bg-[#1a1a1a] p-4 hidden md:block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">ACTIVE AUCTION</span>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-medium text-white">IPL 2025 Mega Auction</p>
          </div>
        )}

        {/* User Profile Section */}
        <div className="shrink-0 border-t border-[#222222] p-4">
          <button className="flex w-full items-center justify-between rounded-lg p-2 transition-colors hover:bg-[#222222]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#222222] text-sm font-medium text-white">
                {getUserInitials()}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-white line-clamp-1">
                  {user?.name || 'Guest User'}
                </span>
                <span className="text-xs text-gray-500">
                  {getRoleName()}
                </span>
              </div>
            </div>
            <IconChevronDown size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Logout Button */}
        <div className="shrink-0 p-4 pt-0">
          <button 
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#222222] py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <IconLogout size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
