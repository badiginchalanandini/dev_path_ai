import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, loginUser } = useAuth();

  // Mode states: 'login', 'register', 'otp', 'forgot', 'reset'
  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
  };

  // Live password strength indicator logic
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password || newPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    resetForm();
    setLoading(true);

    try {
      const res = await authAPI.login({ email, password });
      if (res.success) {
        loginUser(res.user);
      }
    } catch (err) {
      if (err.message.includes('not verified')) {
        setStep('otp');
        setSuccessMsg('A new verification OTP code has been sent to your email.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetForm();

    if (strength < 5) {
      setError('Password must contain min 8 chars, uppercase, lowercase, number, and special character.');
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.register({ name, email, password });
      if (res.success) {
        setStep('otp');
        setSuccessMsg('Account created! Enter the 6-digit OTP code sent to your email.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    resetForm();
    setLoading(true);

    try {
      const res = await authAPI.verifyOTP({ email, otpCode });
      if (res.success) {
        loginUser(res.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetForm();
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword({ email });
      if (res.success) {
        setStep('reset');
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetForm();

    if (getPasswordStrength(newPassword) < 5) {
      setError('New password must contain min 8 chars, uppercase, lowercase, number, and special character.');
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.resetPassword({ email, otpCode, newPassword });
      if (res.success) {
        setStep('login');
        setSuccessMsg('Password reset successfully! Please sign in with your new password.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2>
            {step === 'login' && '🔑 Sign In'}
            {step === 'register' && '🚀 Create Account'}
            {step === 'otp' && '✉️ Verify Email OTP'}
            {step === 'forgot' && '🔐 Forgot Password'}
            {step === 'reset' && '🔄 Reset Password'}
          </h2>
          <button
            onClick={() => setAuthModalOpen(false)}
            style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem' }}
          >
            &times;
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* 1. SIGN IN FORM */}
        {step === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                <span
                  style={{ fontSize: '0.82rem', color: '#a5b4fc', cursor: 'pointer' }}
                  onClick={() => { setStep('forgot'); resetForm(); }}
                >
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                className="form-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <p style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
              Don't have an account?{' '}
              <span
                style={{ color: '#a5b4fc', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setStep('register'); resetForm(); }}
              >
                Register Now
              </span>
            </p>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {step === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, A-Z, a-z, 0-9, @#$"
              />
              {/* Strength Indicator */}
              {password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', width: '100%', background: '#334155', borderRadius: '2px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(strength / 5) * 100}%`,
                        background: strength < 3 ? '#ef4444' : strength < 5 ? '#f59e0b' : '#10b981',
                        borderRadius: '2px',
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strength < 5 ? '#f59e0b' : '#10b981' }}>
                    {strength < 3 ? 'Weak Password' : strength < 5 ? 'Medium Strength' : 'Strong Password ✓'}
                  </span>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Continue to Verification'}
            </button>
            <p style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
              Already registered?{' '}
              <span
                style={{ color: '#a5b4fc', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setStep('login'); resetForm(); }}
              >
                Sign In
              </span>
            </p>
          </form>
        )}

        {/* 3. OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Enter the 6-digit verification code sent to <strong>{email}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">6-Digit OTP Code</label>
              <input
                type="text"
                className="form-input"
                required
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.3rem', fontWeight: 700 }}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
            </button>
          </form>
        )}

        {/* 4. FORGOT PASSWORD */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Enter your account email to receive a 6-digit password reset OTP.
            </p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Reset Code'}
            </button>
            <p style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.9rem', color: '#a5b4fc', cursor: 'pointer' }} onClick={() => setStep('login')}>
              Back to Sign In
            </p>
          </form>
        )}

        {/* 5. RESET PASSWORD */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">6-Digit OTP Code</label>
              <input
                type="text"
                className="form-input"
                required
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.2rem' }}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, A-Z, a-z, 0-9, @#$"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
