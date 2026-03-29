import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './theme/themes.css';
import App from './App';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
