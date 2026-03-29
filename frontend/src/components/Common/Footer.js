import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Instagram, Twitter, Linkedin } from 'lucide-react';
import './Footer.css';

function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      
      <div className="footer-grid">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="footer-logo">
            <Leaf size={24} color="var(--accent-primary)" />
            <span>LeafAI</span>
          </div>
          <p className="footer-tagline">
            AI-powered plant disease detection for smarter farming
          </p>
          <div className="footer-socials">
            <a href="https://instagram.com" aria-label="Instagram" className="social-icon" target="_blank" rel="noopener noreferrer">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" aria-label="Twitter" className="social-icon" target="_blank" rel="noopener noreferrer">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="social-icon" target="_blank" rel="noopener noreferrer">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/scan">Scan Plant</Link></li>
            <li><Link to="/alerts">Alerts</Link></li>
          </ul>
        </div>

        {/* Features */}
        <div className="footer-section">
          <h4 className="footer-heading">Features</h4>
          <ul className="footer-links">
            <li><a href="/#features">AI Detection</a></li>
            <li><a href="/#features">Disease Analysis</a></li>
            <li><a href="/#features">History Tracking</a></li>
            <li><a href="/#features">Reports</a></li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer-section">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><a href="/#about">About Us</a></li>
            <li><a href="/#privacy">Privacy Policy</a></li>
            <li><a href="/#terms">Terms of Service</a></li>
            <li><a href="/#contact">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; 2026 LeafAI · Precision Agriculture Technology</p>
        <p className="footer-made">Made with care for sustainable farming</p>
      </div>
    </footer>
  );
}

export default Footer;
