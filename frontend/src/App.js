import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import ResultPage from './pages/ResultPage';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setScanResult(null);
  };

  const handleScanComplete = (result) => {
    setScanResult(result);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/signup" 
            element={<SignUpPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/signin" 
            element={<SignInPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/home" 
            element={
              user ? (
                <HomePage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/signin" replace />
              )
            } 
          />
          <Route 
            path="/scan" 
            element={
              user ? (
                <ScannerPage onScanComplete={handleScanComplete} />
              ) : (
                <Navigate to="/signin" replace />
              )
            } 
          />
          <Route 
            path="/result" 
            element={
              user && scanResult ? (
                <ResultPage result={scanResult} />
              ) : (
                <Navigate to="/home" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
