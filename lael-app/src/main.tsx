import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ConvexAuthProvider } from '@/components/providers/ConvexAuthProvider';

/**
 * App entry point.
 *
 * Provider order (outermost → innermost):
 *   1. `ConvexAuthProvider` — Convex client + Better Auth session bridge.
 *      This must wrap the whole app so that every `useQuery` and
 *      `useConvexAuth` call has the auth context it needs.
 *   2. `App` — the router + UI shell.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider>
      <App />
    </ConvexAuthProvider>
  </StrictMode>,
);
