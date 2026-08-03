/**
 * COMPONENT: Header (Admin Layout)
 * ---------------------------------------------------------
 * This is the top navigation bar inside the Admin/Manager layout.
 * It sits directly above the <Outlet /> where the dynamic page content is rendered.
 * It handles global actions like opening notifications and rendering the profile avatar.
 */
import React, { useState } from 'react';
import { IconBell, IconUser, IconMenu2, IconCalendarEvent, IconChevronDown } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

/**
 * Header Component
 * @param {Object} props
 * @param {function} props.toggleSidebar - Function to toggle mobile sidebar
 */
const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const renderRightContent = () => {
    const role = user?.role || 'ROLE_CLIENT';

    if (role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') {
      return (
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700">
              <IconUser size={18} />
            </div>
            <div className="hidden flex-col md:flex">
              <span className="text-sm font-medium text-gray-900 leading-tight">
                {user?.name || (role === 'ROLE_ADMIN' ? 'Admin' : 'Manager')}
              </span>
            </div>
            <IconChevronDown size={16} className="text-gray-500 ml-1 hidden md:block" />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name || (role === 'ROLE_ADMIN' ? 'Super Admin' : 'Manager')}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@auctxi.com'}</p>
              </div>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  if (role === 'ROLE_ADMIN') {
                    navigate('/admin/profile');
                  } else if (role === 'ROLE_MANAGER') {
                    navigate('/manager/profile');
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Profile Settings
              </button>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      );
    }

    // Client or default
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
        <IconUser size={20} />
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <IconMenu2 size={24} />
        </button>
        {/* Placeholder for Page Title (can be injected via context or props later if needed) */}
        <div className="hidden h-6 w-px bg-gray-300 md:block"></div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-500">Overview</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Date Display Button */}
        <div className="relative hidden md:block">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b] cursor-pointer"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          >
            <IconBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
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
                          if (url.includes('/manager/auctions/') && !url.includes('?')) {
                            url += '?tab=teams';
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
        
        {/* Divider */}
        <div className="hidden h-6 w-px bg-gray-200 md:block"></div>
        
        {/* Role-based Right Content */}
        {renderRightContent()}
      </div>
    </header>
  );
};

export default Header;
