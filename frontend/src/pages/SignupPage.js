import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const SignupPage = () => {
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.register({ name, email, password });
      if (res.data && res.data.success) {
        setStep('otp');
        setSuccessMsg('Registration successful! Verification code sent to your email.');
        if (res.data.otpCode) {
          setDevOtp(res.data.otpCode);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.verifyOTP({ email, otpCode });
      if (res.data && res.data.success) {
        loginUser(res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '1rem' }}>
      <div className="glass-panel content-card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          {step === 'signup' ? '🚀 Create Account' : '✉️ Verify Email OTP'}
        </h2>

        {error && <ErrorMessage message={error} />}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {step === 'signup' ? (
          <form onSubmit={handleSignup}>
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
                placeholder="At least 8 chars, A-Z, 0-9, @#$"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600 }}>
                Sign In
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label className="form-label">6-Digit Email OTP</label>
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
              {loading ? 'Verifying...' : 'Verify OTP & Continue'}
            </button>

            {devOtp && (
              <div 
                className="alert alert-info" 
                style={{ 
                  marginTop: '1.5rem', 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)', 
                  color: '#93c5fd',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}
              >
                <strong>🛠️ Development Helper</strong>
                <div style={{ marginTop: '0.3rem' }}>
                  Since SMTP is in dummy/dev mode, your verification code is:
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '2px', color: '#60a5fa', marginTop: '0.5rem' }}>
                  {devOtp}
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
