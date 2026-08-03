/**
 * EXECUTION FLOW STEP 1: Application Entry Point
 * ---------------------------------------------------------
 * This is the very first file that runs when a user opens the app in their browser.
 * It attaches the React application to the DOM (Document Object Model) inside the 
 * <div id="root"> found in index.html.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';

// Import global CSS layers sequentially to ensure proper cascading rules
import "./styles/variables.css";
import "./styles/typography.css";
import "./styles/utilities.css";
import "./styles/animations.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 
      EXECUTION FLOW STEP 2: The Global State Provider
      ---------------------------------------------------------
      Before the App even loads its routes, the AuthProvider mounts.
      This immediately checks localStorage to see if a user session exists,
      ensuring that the routing logic downstream knows who is logged in.
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
)