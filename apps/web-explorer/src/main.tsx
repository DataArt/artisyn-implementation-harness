import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing/Landing';
import './styles.css';

// Lazy-loaded: the whole /inside-the-loop/* feature area (hub + 10 detail
// pages) pulls in @xyflow/react and ~7,000 lines of ported chart code, all
// sharing the same dependencies — one chunk for the whole area, not one per
// page. Home must stay a lightweight promo landing page — a first-time
// visitor to "/" should never pay for any of it. See check-bundle-budget.mjs,
// which measures only the entry chunk(s) actually referenced by index.html,
// not every chunk in dist/.
const InsideTheLoopRoutes = lazy(() => import('./pages/inside-the-loop/InsideTheLoopRoutes'));

// Also lazy: the comic's own sprite-sheet images are large static assets, and
// its content/styles are unrelated to the landing page — no reason for a
// first-time "/" visitor to pay for this chunk either. Not linked from the
// header nav (developer's direction) — reachable only at this direct route.
const Comic = lazy(() => import('./pages/comic/Comic'));

// HashRouter, not BrowserRouter: this app is served as a static artifact
// (composed by Web Portal — see docs/Target Architecture (HLD)/v1/Containers/
// Web Portal.md) with no server to rewrite a deep link like /inside-the-loop
// back to index.html. The hash never leaves the client, so GitHub Pages needs
// no configuration for it to work.
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/inside-the-loop/*"
          element={
            <Suspense fallback={null}>
              <InsideTheLoopRoutes />
            </Suspense>
          }
        />
        <Route
          path="/comic"
          element={
            <Suspense fallback={null}>
              <Comic />
            </Suspense>
          }
        />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
