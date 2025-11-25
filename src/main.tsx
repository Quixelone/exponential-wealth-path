import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga4';
import App from './App.tsx';
import './index.css';

// Initialize Google Analytics 4
// Replace with your actual Measurement ID from Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
  
  // Track initial pageview
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  
  console.log('✅ Google Analytics initialized:', GA_MEASUREMENT_ID);
} else {
  console.warn('⚠️ Google Analytics Measurement ID not found. Add VITE_GA_MEASUREMENT_ID to your .env file');
}

createRoot(document.getElementById("root")!).render(<App />);
