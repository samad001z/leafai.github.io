import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OTPInput } from '../components/Auth';
import { LanguageSelector } from '../components/Common';
import { authService } from '../services/api';
import './AuthPages.css';

function SignUpPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.sendOtp(formData.phone);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.signup(formData.name, formData.phone, otp);
      onLogin(result.user);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.sendOtp(formData.phone);
      setError(''); // Clear error
      alert('OTP sent successfully!');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <LanguageSelector />
      
      <div className="auth-container">
        {/* Back button */}
        <Link to="/" className="back-button" aria-label="Go back">
          ← Back
        </Link>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon">🌿</div>
          <h1>Create Account</h1>
          <p>Join PlantCare AI to protect your crops</p>
        </div>

        {step === 1 ? (
          /* Step 1: Name and Phone */
          <div className="auth-form">
            <div className="input-group">
              <label htmlFor="name">
                <span className="label-icon">👤</span> Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input-field"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="name"
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone">
                <span className="label-icon">📱</span> Phone Number
              </label>
              <div className="phone-input-wrapper">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="input-field phone-input"
                  placeholder="Enter 10-digit number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
              <span>📨</span>
            </button>
          </div>
        ) : (
          /* Step 2: OTP Verification */
          <div className="auth-form">
            <div className="otp-info">
              <p>Enter the 6-digit code sent to</p>
              <p className="phone-display">+91 {formData.phone}</p>
            </div>

            <OTPInput length={6} onChange={setOtp} />

            {error && <div className="error-message">{error}</div>}

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Register'}
              <span>✓</span>
            </button>

            <div className="resend-otp">
              <p>Didn't receive the code?</p>
              <button
                className="resend-btn"
                onClick={handleResendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>

            <button
              className="btn btn-secondary btn-block"
              onClick={() => setStep(1)}
            >
              ← Change Number
            </button>
          </div>
        )}

        {/* Sign In Link */}
        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/signin" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
