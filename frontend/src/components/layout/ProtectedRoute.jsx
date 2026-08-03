/**
 * EXECUTION FLOW: Security Guard (ProtectedRoute)
 * ---------------------------------------------------------
 * This component wraps sensitive routes in App.jsx. 
 * Before React Router is allowed to render the requested page, it must pass through here.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  // 1. Ask the global AuthContext "Who is currently logged in?"
  const { user } = useAuth();

  // 2. UNAUTHENTICATED: If no user exists, kick them to the login page immediately.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. UNAUTHORIZED: The user is logged in, but do they have the right role?
  // E.g., a Client trying to access /admin/players
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Determine where they *should* be based on their actual role
    const rolePath = user.role.replace("ROLE_", "").toLowerCase();
    return <Navigate to={`/${rolePath}/dashboard`} replace />;
  }

  // 4. AUTHORIZED: User is logged in and has the correct role.
  // <Outlet /> tells React Router to go ahead and render the nested page component.
  return <Outlet />;
};

export default ProtectedRoute;
