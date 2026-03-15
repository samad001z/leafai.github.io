import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogIn, MessageSquareText, UserRound, Phone } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './AuthPage.css';

const normalizePhone = (value) => {
  const cleaned = String(value || '').trim().replace(/[\s\-()]/g, '');
  if (!cleaned) return '';
  if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
  return cleaned;
};

function AuthPage() {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp } = useAuth();

  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const normalizedPhone = normalizePhone(phone);
      await requestOtp(normalizedPhone);
      setPhone(normalizedPhone);
      setOtpSent(true);
      setMessage(`OTP sent to ${normalizedPhone}`);
    } catch (sendError) {
      setError(sendError?.response?.data?.error || sendError?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await verifyOtp({ phone, otp, name: mode === 'signup' ? name : '' });
      setMessage('Login successful. Redirecting...');
      navigate('/home');
    } catch (verifyError) {
      setError(verifyError?.response?.data?.error || verifyError?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand" style={{ textDecoration: 'none' }}>
          <Leaf size={22} />
          <span>LeafAI</span>
        </Link>

        <h1>Farmer Login</h1>
        <p>Use phone OTP to {mode === 'signup' ? 'create account' : 'sign in'}.</p>

        <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => setMode('signin')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        {mode === 'signup' && (
          <div className="auth-field">
            <label htmlFor="name"><UserRound size={14} /> Name</label>
            <input
              id="name"
              type="text"
              placeholder="Farmer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="phone"><Phone size={14} /> Phone number</label>
          <input
            id="phone"
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={otpSent}
          />
        </div>

        {otpSent && (
          <div className="auth-field">
            <label htmlFor="otp"><MessageSquareText size={14} /> OTP</label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}

        {!otpSent ? (
          <button type="button" className="auth-btn" onClick={sendOtp} disabled={loading || !phone.trim() || (mode === 'signup' && !name.trim())}>
            <LogIn size={16} /> {loading ? 'Sending OTP...' : `Send OTP for ${mode === 'signup' ? 'Signup' : 'Login'}`}
          </button>
        ) : (
          <button type="button" className="auth-btn" onClick={submitOtp} disabled={loading || otp.length < 4}>
            <LogIn size={16} /> {loading ? 'Verifying...' : `Verify OTP & ${mode === 'signup' ? 'Create Account' : 'Login'}`}
          </button>
        )}

        {otpSent && (
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => {
              setOtpSent(false);
              setOtp('');
              setError('');
              setMessage('');
            }}
          >
            Change phone number
          </button>
        )}

        {message && <div className="auth-message">{message}</div>}
        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}

export default AuthPage;
