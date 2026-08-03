/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

/**
 * EXECUTION FLOW: AuthProvider
 * ---------------------------------------------------------
 * This component wraps the entire application. It acts as the single source of truth
 * for the user's identity and permissions.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * ON MOUNT (Page Refresh/Load):
   * 1. React runs this useEffect immediately.
   * 2. It checks localStorage to see if a valid user object was saved from a previous session.
   * 3. If found, it hydrates the `user` state, keeping the user logged in.
   * 4. Finally, it sets loading to false, which unblocks the rest of the app from rendering.
   */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * LOGIN FLOW:
   * 1. Called by Login.jsx when the user submits the form.
   * 2. Sends credentials to the backend.
   * 3. If successful, saves the JWT token and user profile to localStorage (for persistence).
   * 4. Updates the global `user` state, which instantly triggers React Router to redirect them
   *    to their protected dashboard.
   */
  const login = async (email, password) => {
    try {
      const response = await api.post("/api/v1/auth/login", { email, password });
      const { accessToken, user } = response.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  };

  /**
   * SIGNUP FLOW:
   * Registers a new user. Does NOT log them in automatically (they are redirected to login).
   */
  const signup = async (name, email, password, role) => {
    try {
      const backendRole = `ROLE_${role.toUpperCase()}`;
      await api.post("/api/v1/auth/register", { name, email, password, role: backendRole });
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  /**
   * LOGOUT FLOW:
   * Wipes the session from localStorage and resets the global state.
   * This immediately causes ProtectedRoute to kick the user back to the login screen.
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {/* Do not render the app (children) until we finish checking localStorage */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);