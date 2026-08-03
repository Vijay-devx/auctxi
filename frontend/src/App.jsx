/**
 * EXECUTION FLOW STEP 3: The Central Router
 * ---------------------------------------------------------
 * This component acts as the "Traffic Controller" for the entire application.
 * When a user navigates to a URL (e.g., /admin/players), this file determines
 * which UI components should be rendered based on the path and the user's role.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ClientLayout from './components/layout/ClientLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AuctionsList from './pages/admin/Auctions/AuctionsList';
import AuctionCreate from './pages/admin/Auctions/AuctionCreate';
import AuctionDetail from './pages/admin/Auctions/AuctionDetail';
import TeamsList from './pages/admin/Teams/TeamsList';
import TeamCreate from './pages/admin/Teams/TeamCreate';
import TeamDetail from './pages/admin/Teams/TeamDetail';
import PlayersList from './pages/admin/Players/PlayersList';
import PlayerCreate from './pages/admin/Players/PlayerCreate';
import PlayerDetail from './pages/admin/Players/PlayerDetail';
import UsersList from './pages/admin/Users/UsersList';
import UserCreate from './pages/admin/Users/UserCreate';
import BidsList from './pages/admin/Bids/BidsList';
import PaymentsList from './pages/admin/Payments/PaymentsList';
import ReportsPage from './pages/admin/Reports/ReportsPage';
import NotificationsPage from './pages/admin/Notifications/NotificationsPage';
import SettingsPage from './pages/admin/Settings/SettingsPage';
import SupportPage from './pages/admin/Support/SupportPage';
import ProfilePage from './pages/admin/Profile/ProfilePage';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import LiveAuction from './pages/manager/LiveAuction';
import ManagerPlayerPool from './pages/manager/PlayerPool';
import ManagerPlayerCreate from './pages/manager/Players/PlayerCreate';
import ManagerPlayerDetail from './pages/manager/Players/PlayerDetail';
import LiveTeams from './pages/manager/LiveTeams';
import ManagerAuctionsList from './pages/manager/Auctions/AuctionsList';
import ManagerAuctionCreate from './pages/manager/Auctions/AuctionCreate';
import ManagerAuctionDetail from './pages/manager/Auctions/AuctionDetail';
import ManagerAuctionEdit from './pages/manager/Auctions/AuctionEdit';
import ManagerTeamsList from './pages/manager/Teams/ManagerTeamsList';
import ManagerTeamDetail from './pages/manager/Teams/ManagerTeamDetail';
import ManagerBidsList from './pages/manager/Bids/ManagerBidsList';
import Watchlist from './pages/manager/Watchlist/Watchlist';
import ManagerReportsPage from './pages/manager/Reports/Reports';
import ManagerSettingsPage from './pages/manager/Settings/ManagerSettingsPage';
import ManagerProfilePage from './pages/manager/Profile/ManagerProfilePage';
import ApplicationsList from './pages/manager/Applications/ApplicationsList';
import InvitationsList from './pages/manager/Invitations/InvitationsList';
import ManagerPayments from './pages/manager/Payments/Payments';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientAuctions from './pages/client/AuctionsList';
import AuctionDetails from './pages/client/AuctionDetails';
import ClientWallet from './pages/client/Wallet/Wallet';
import PlayerPool from './pages/client/PlayerPool';
import ClientProfile from './pages/client/Profile/Profile';
import LiveAuctionClient from './pages/client/LiveAuctionClient';
import ClientPayments from './pages/client/Payments/Payments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Accessible by anyone without logging in) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* 
          EXECUTION FLOW STEP 4: The Layout Wrappers (Admin & Manager)
          ---------------------------------------------------------
          Routes nested inside <Layout /> will automatically render the Sidebar and Header.
          The specific page component (like AdminDashboard) will be injected 
          into the <Outlet /> placeholder located inside Layout.jsx.
        */}
        <Route element={<Layout />}>
          
          {/* 
            EXECUTION FLOW STEP 5: Role-Based Security Guards
            ---------------------------------------------------------
            Before letting the user see these Admin routes, ProtectedRoute intercepts the request.
            It checks AuthContext to see if (1) the user is logged in, and (2) has 'ROLE_ADMIN'.
            If not, it instantly redirects them to the login page.
          */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            <Route path="/admin/auctions" element={<AuctionsList />} />
            <Route path="/admin/auctions/create" element={<AuctionCreate />} />
            <Route path="/admin/auctions/:id" element={<AuctionDetail />} />
            
            <Route path="/admin/teams" element={<TeamsList />} />
            <Route path="/admin/teams/create" element={<TeamCreate />} />
            <Route path="/admin/teams/:id" element={<TeamDetail />} />
            
            <Route path="/admin/players" element={<PlayersList />} />
            <Route path="/admin/players/create" element={<PlayerCreate />} />
            <Route path="/admin/players/:id" element={<PlayerDetail />} />
            
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/users/create" element={<UserCreate />} />
            
            <Route path="/admin/bids" element={<BidsList />} />
            <Route path="/admin/payments" element={<PaymentsList />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/support" element={<SupportPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>

          {/* Manager Security Guards */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_MANAGER']} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/live-auction" element={<LiveAuction />} />
            <Route path="/manager/player-pool" element={<ManagerPlayerPool />} />
            <Route path="/manager/player-pool/create" element={<ManagerPlayerCreate />} />
            <Route path="/manager/player-pool/:id" element={<ManagerPlayerDetail />} />
            <Route path="/manager/player-pool/edit/:id" element={<ManagerPlayerCreate />} />
            <Route path="/manager/live-teams" element={<LiveTeams />} />
            <Route path="/manager/auctions" element={<ManagerAuctionsList />} />
            <Route path="/manager/auctions/create" element={<ManagerAuctionCreate />} />
            <Route path="/manager/auctions/:id" element={<ManagerAuctionDetail />} />
            <Route path="/manager/auctions/edit/:id" element={<ManagerAuctionEdit />} />
            <Route path="/manager/teams" element={<ManagerTeamsList />} />
            <Route path="/manager/teams/:id" element={<ManagerTeamDetail />} />
            <Route path="/manager/bids" element={<ManagerBidsList />} />
            <Route path="/manager/watchlist" element={<Watchlist />} />
            <Route path="/manager/reports" element={<ManagerReportsPage />} />
            <Route path="/manager/settings" element={<ManagerSettingsPage />} />
            <Route path="/manager/profile" element={<ManagerProfilePage />} />
            <Route path="/manager/applications" element={<ApplicationsList />} />
            <Route path="/manager/invitations" element={<InvitationsList />} />
            <Route path="/manager/payments" element={<ManagerPayments />} />
          </Route>

        </Route>

        {/* 
          EXECUTION FLOW STEP 4b: The Client Layout
          ---------------------------------------------------------
          Clients get a completely different UI wrapper (Top Nav instead of Sidebar).
        */}
        <Route element={<ClientLayout />}>
          {/* Client Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_CLIENT']} />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/auctions" element={<ClientAuctions />} />
            <Route path="/client/auction/:id" element={<AuctionDetails />} />
            <Route path="/client/wallet" element={<ClientWallet />} />
            <Route path="/client/live-auction/:id" element={<LiveAuctionClient />} />
            <Route path="/client/player-pool" element={<PlayerPool />} />
            <Route path="/client/watchlist" element={<Watchlist />} />
            <Route path="/client/payments" element={<ClientPayments />} />
            <Route path="/client/profile" element={<ClientProfile />} />
          </Route>
        </Route>

        {/* 
          EXECUTION FLOW STEP 6: The Fallback
          ---------------------------------------------------------
          If the user types a URL that doesn't match any route above, 
          they are aggressively redirected to the login page.
        */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;