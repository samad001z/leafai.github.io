import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation/Navigation';
import { useAuth } from './auth/AuthContext';
import './styles/App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div style={{ color: 'var(--text-secondary)', padding: '24px' }}>Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function AppContent() {
  const [scanResult, setScanResult] = useState(null);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Keep landing page clean; show app navigation on feature pages.
  const showNavigation = isAuthenticated && location.pathname !== '/' && location.pathname !== '/auth';

  const handleScanComplete = (result) => {
    setScanResult(result);
  };

  return (
    <div className="app">
      {showNavigation && <Navigation />}
      <main className={`app-main ${showNavigation ? 'app-main-shell' : 'app-main-public'}`}>
        <div className={showNavigation ? 'app-content-max' : 'app-content-public'}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage />} />
            <Route 
              path="/home" 
              element={<ProtectedRoute><HomePage /></ProtectedRoute>} 
            />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><HomePage /></ProtectedRoute>}
            />
            <Route 
              path="/scan" 
              element={<ProtectedRoute><ScannerPage onScanComplete={handleScanComplete} /></ProtectedRoute>} 
            />
            <Route 
              path="/result" 
              element={<ProtectedRoute><ResultPage result={scanResult} /></ProtectedRoute>} 
            />
            <Route 
              path="/history" 
              element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} 
            />
            <Route 
              path="/alerts" 
              element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} 
            />
            <Route 
              path="/settings" 
              element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} 
            />
            <Route 
              path="/profile" 
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
            />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/auth'} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </Router>
  );
}

export default App;
