import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PreviewPage from './pages/PreviewPage';
import ViewPage from './pages/view';
import PageResolver from './pages/PageResolver';
import LoginPage from './pages/LoginPage';       // ← BARU
import AuthCallback from './pages/AuthCallback'; // ← BARU

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ──────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Shareable public page — bisa diakses tanpa login */}
          <Route path="/page/:page_name" element={<PageResolver />} />

          {/* ── Protected routes — harus login ─────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/websites/:id/preview"
            element={
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/websites/:id/:page_name"
            element={
              <ProtectedRoute>
                <ViewPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}