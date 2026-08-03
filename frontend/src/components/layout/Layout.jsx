import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatWidget from '../ui/ChatWidget';

/**
 * EXECUTION FLOW: The Layout Shell (Admin & Manager)
 * ---------------------------------------------------------
 * This is the UI wrapper for all protected internal pages. 
 * React Router loads this file first. It draws the black Sidebar on the left 
 * and the white Header on top. 
 * 
 * The magic happens at the `<Outlet />` component below. React Router dynamically
 * injects the requested page (e.g., PlayersList.jsx) directly into that Outlet hole.
 */
const Layout = () => {
  // Local state to handle mobile sidebar toggling
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#111111] overflow-hidden">
      {/* 
        COMPONENT 1: Sidebar
        Fixed width on desktop, slides out on mobile. 
      */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
      
      {/* Main Content Area (Everything to the right of the sidebar) */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#F8F9FA] relative rounded-l-none md:rounded-l-2xl border-l-0 md:border-l md:border-gray-200 shadow-[-4px_0_24px_rgba(0,0,0,0.1)]">
        
        {/* COMPONENT 2: Top Header (Search, Profile, Notifications) */}
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        
        {/* COMPONENT 3: The dynamic page content gets injected here */}
        <main className="flex-1 overflow-y-auto p-4 md:p-[24px]">
          <div className="mx-auto h-full max-w-7xl">
            {/* <Outlet /> is the placeholder for nested child routes in App.jsx */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toast container for rendering popup notifications anywhere in the app */}
      <ToastContainer position="bottom-right" theme="light" />
      <ChatWidget />
    </div>
  );
};

export default Layout;
