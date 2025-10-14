/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Socket } from '@/shared/socket/socket';
import { StrictMode } from 'react';

const elem = document.getElementById('root')!;
const app = (
  <GoogleOAuthProvider clientId="758890044013-qq2amlba21ic2fb7drsjavpa16mmkons.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
);
// Note: StrictMode causes useEffects to run twice.
// In production StrictMode should not be enabled, and therefore useEffects should only run once.

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
  Socket.LogEvents = true;
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
  Socket.LogEvents = false;
}
