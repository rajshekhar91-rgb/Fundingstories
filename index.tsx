import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill for uuid if needed in some environments, though we imported v4 directly.
// This ensures type safety for the root element.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
