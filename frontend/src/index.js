import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { theme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';

// Suppress browser extension runtime errors (MetaMask, Phantom, etc.)
if (typeof window !== 'undefined') {
  const isExtensionError = (err) => {
    if (!err) return false;
    const str = `${err?.message || ''} ${err?.stack || ''} ${err?.reason || ''} ${String(err)}`;
    return (
      str.includes('MetaMask') ||
      str.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      str.includes('chrome-extension://') ||
      str.includes('moz-extension://') ||
      str.includes('Failed to connect to MetaMask')
    );
  };

  window.addEventListener('error', (e) => {
    if (isExtensionError(e.error) || (e.filename && isExtensionError(e.filename))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    if (isExtensionError(e.reason)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          pauseOnHover
          theme="colored"
          style={{ fontSize: '0.875rem' }}
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
