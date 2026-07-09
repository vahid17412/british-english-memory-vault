import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { GlobalErrorBoundary } from '@/features/layout/GlobalErrorBoundary';
import '@/shared/styles/globals.css'; // Core Tailwind/System styles abstraction

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
