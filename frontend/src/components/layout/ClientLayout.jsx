import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { IconBell, IconUser, IconShieldLock, IconLogout, IconSettings } from '@tabler/icons-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import ChatWidget from '../ui/ChatWidget';

/**
 * EXECUTION FLOW: The Client Layout Shell
 * ---------------------------------------------------------
 * This is the UI wrapper specifically designed for Clients/Bidders.
 * Unlike the Admin Layout (which uses a side navigation bar), this layout
 * uses a sleek top navigation bar. 
 * 
 * Just like Layout.jsx, the specific child page is injected into the <Outlet /> below.
 */
const ClientLayout = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8F9FA]">
      {/* 
        COMPONENT 1: Black Header Bar
        Contains the brand logo, top navigation links, and user profile dropdown. 
      */}
      <header className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-between bg-[#111111] px-4 md:px-8 border-b border-[#222222] shadow-md">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconShieldLock className="text-[#F59E0B]" size={28} />
            <span className="text-2xl font-black tracking-tight text-[#F59E0B]">
              Auct<span className="text-white">XI</span>
            </span>
          </div>
          <div className="hidden h-6 w-px bg-[#333333] md:block"></div>
          <span className="hidden text-xs font-bold tracking-[0.2em] text-gray-400 md:block">
            BID. BUILD. WIN.
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: 'Home', path: '/client/dashboard' },
            { name: 'My Auctions', path: '/client/auctions' },
            { name: 'Wallet', path: '/client/wallet' },
            { name: 'Payments', path: '/client/payments' },
            { name: 'Profile', path: '/client/profile' }
          ].map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-[#F59E0B]' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Side (Notifications & User) */}
        <div className="flex items-center gap-4 md:gap-6" ref={menuRef}>
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative text-gray-300 hover:text-white transition-colors focus:outline-none"
            >
              <IconBell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button 
                    onClick={markAllAsRead} 
                    className="text-xs text-[#F59E0B] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="flex flex-col">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          markAsRead(notif.id);
                          if (notif.actionUrl) {
                            setShowNotifications(false);
                            let url = notif.actionUrl;
                            if (url.includes('/client/auctions/') && !url.includes('?')) {
                              url += '?tab=teams'; // Fallback logic if needed
                            }
                            navigate(url);
                          }
                        }}
                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-amber-50/30' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && <span className="h-2 w-2 rounded-full bg-amber-500 mt-1"></span>}
                        </div>
                        <p className="text-xs text-gray-500">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-500">
                      You have no notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#222222] border border-[#333333] text-gray-300 hover:bg-[#333333] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            >
              <IconUser size={20} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="border-b border-gray-100 px-4 py-3 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{user?.name || 'Client User'}</p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="p-1">
                  <NavLink
                    to="/client/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                  >
                    <IconUser size={16} />
                    My Profile
                  </NavLink>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate('/client/profile'); }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                  >
                    <IconSettings size={16} />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 p-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                  >
                    <IconLogout size={16} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* 
        COMPONENT 2: Content Area 
        The dynamic page component (e.g. ClientDashboard) is injected into this Outlet.
      */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      <ToastContainer position="bottom-right" theme="light" />
      <ChatWidget />
    </div>
  );
};

export default ClientLayout;
