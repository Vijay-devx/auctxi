// src/layouts/DashboardLayout.jsx

import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconUsers,
  IconBuildingStore,
  IconClipboardList,
  IconMenu2,
  IconX,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";

import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // ===========================
  // Sidebar Links
  // ===========================

  const adminLinks = [
    {
      to: ROUTES.ADMIN_DASHBOARD,
      label: "Dashboard",
      icon: IconLayoutDashboard,
    },
    {
      to: ROUTES.ADMIN_AUCTIONS,
      label: "Auctions",
      icon: IconBuildingStore,
    },
    {
      to: ROUTES.ADMIN_PLAYERS,
      label: "Players",
      icon: IconClipboardList,
    },
    {
      to: ROUTES.ADMIN_TEAMS,
      label: "Teams",
      icon: IconUsers,
    },
    {
      to: ROUTES.ADMIN_USERS,
      label: "Users",
      icon: IconUsers,
    },
    {
      to: ROUTES.ADMIN_PAYMENTS,
      label: "Payments",
      icon: IconClipboardList,
    },
    {
      to: ROUTES.ADMIN_REPORTS,
      label: "Reports",
      icon: IconClipboardList,
    },
    {
      to: ROUTES.ADMIN_SETTINGS,
      label: "Settings",
      icon: IconSettings,
    },
  ];

  const managerLinks = [
    {
      to: ROUTES.MANAGER_DASHBOARD,
      label: "Dashboard",
      icon: IconLayoutDashboard,
    },
    {
      to: ROUTES.MANAGER_AUCTIONS,
      label: "Auctions",
      icon: IconBuildingStore,
    },
    {
      to: ROUTES.MANAGER_PLAYERS,
      label: "Players",
      icon: IconClipboardList,
    },
    {
      to: ROUTES.MANAGER_PAYMENTS,
      label: "Payments",
      icon: IconClipboardList,
    },
    {
      to: ROUTES.MANAGER_REPORTS,
      label: "Reports",
      icon: IconUsers,
    },
  ];

  const clientLinks = [
    {
      to: ROUTES.CLIENT_DASHBOARD,
      label: "Dashboard",
      icon: IconLayoutDashboard,
    },
    {
      to: ROUTES.CLIENT_AUCTIONS,
      label: "Auctions",
      icon: IconBuildingStore,
    },
    {
      to: ROUTES.CLIENT_PLAYERS,
      label: "Players",
      icon: IconClipboardList,
    },
    {
      to: ROUTES.CLIENT_PAYMENTS,
      label: "Payments",
      icon: IconClipboardList,
    },
    {
      to: ROUTES.CLIENT_PROFILE,
      label: "Profile",
      icon: IconSettings,
    },
  ];

  const getLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case "admin":
        return adminLinks;
      case "manager":
        return managerLinks;
      case "client":
        return clientLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <span className="text-xl font-bold text-gray-800">
            {user?.role
              ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Panel`
              : "Dashboard"}
          </span>

          <button
            className="rounded p-1 hover:bg-gray-200 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <IconX size={24} />
          </button>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <IconLogout size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm lg:px-6">
          <button
            className="rounded p-1 hover:bg-gray-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <IconMenu2 size={24} />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              {user?.email}
            </span>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-800">
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;