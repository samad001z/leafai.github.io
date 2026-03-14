import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation/Navigation';
import { LanguageSwitcher } from './components/Common';
import './styles/App.css';

function AppContent() {
  const [scanResult, setScanResult] = useState(null);
  const location = useLocation();

  // Keep landing page clean; show app navigation on feature pages.
  const showNavigation = location.pathname !== '/';

  const handleScanComplete = (result) => {
    setScanResult(result);
  };

  return (
    <div className="app">
      {showNavigation && <Navigation />}
      {showNavigation && <LanguageSwitcher fixed />}
      <main className={`app-main ${showNavigation ? 'app-main-shell' : 'app-main-public'}`}>
        <div className={showNavigation ? 'app-content-max' : 'app-content-public'}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/home" 
              element={<HomePage />} 
            />
            <Route
              path="/dashboard"
              element={<HomePage />}
            />
            <Route 
              path="/scan" 
              element={<ScannerPage onScanComplete={handleScanComplete} />} 
            />
            <Route 
              path="/result" 
              element={<ResultPage result={scanResult} />} 
            />
            <Route 
              path="/history" 
              element={<HistoryPage />} 
            />
            <Route 
              path="/alerts" 
              element={<AlertsPage />} 
            />
            <Route 
              path="/settings" 
              element={<SettingsPage />} 
            />
            <Route 
              path="/profile" 
              element={<ProfilePage />} 
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
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
