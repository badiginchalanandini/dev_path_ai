import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { authAPI, profileAPI, profileManagementAPI } from '../services/api';

const ProfilePage = () => {
  const { logoutUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Form States
  const [detailsForm, setDetailsForm] = useState({
    name: '',
    email: '',
    profile_pic: '',
    skills: '',
    interests: '',
    career_goal: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const userRes = await authAPI.getMe();
      const profileRes = await profileAPI.getProfile();

      const user = userRes.data.user;
      const profile = profileRes.data.profile;

      setDetailsForm({
        name: user.name || '',
        email: user.email || '',
        profile_pic: user.profile_pic || '',
        skills: profile?.current_skills || '',
        interests: profile?.interested_skills || '',
        career_goal: profile?.career_goal || ''
      });
    } catch (err) {
      setError('Failed to fetch profile settings data.');
    } finally {
      setLoading(false);
    }
  };

  // Base64 File Uploader handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Profile picture size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDetailsForm((prev) => ({ ...prev, profile_pic: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDetailsChange = (e) => {
    setDetailsForm({ ...detailsForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg('');
    setError('');

    try {
      const res = await profileManagementAPI.updateDetails(detailsForm);
      if (res.data && res.data.success) {
        setMsg('Profile details updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg('');
    setError('');

    try {
      const res = await profileManagementAPI.updatePassword(passwordForm);
      if (res.data && res.data.success) {
        setMsg('Password updated successfully.');
        setPasswordForm({ oldPassword: '', newPassword: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      '⚠️ WARNING: Are you absolutely sure you want to permanently delete your account? This action is irreversible and deletes all roadmaps, project plans, and history logs.'
    );
    if (!confirmation) return;

    try {
      await profileManagementAPI.deleteAccount();
      alert('Your account has been deleted.');
      logoutUser();
    } catch (err) {
      setError('Failed to delete account.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="glass-panel content-card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>👤 Profile Settings</h2>
          <p style={{ color: '#94a3b8' }}>Update your account details, password credentials, or delete your profile.</p>
        </div>

        {loading ? (
          <Loading message="Loading profile settings..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {msg && <div className="alert alert-success">{msg}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid-2">
              {/* Profile details form */}
              <form className="glass-panel content-card" onSubmit={handleDetailsSubmit}>
                <h3 style={{ color: '#a5b4fc', marginBottom: '1.2rem' }}>✏️ Edit Profile Info</h3>

                {/* Profile Pic Upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: '50%',
                      background: detailsForm.profile_pic ? `url(${detailsForm.profile_pic}) no-repeat center/cover` : '#334155',
                      border: '2px solid var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      color: '#94a3b8'
                    }}
                  >
                    {!detailsForm.profile_pic && 'No Pic'}
                  </div>
                  <div>
                    <label
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      📤 Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Max size: 2MB</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    required
                    value={detailsForm.name}
                    onChange={handleDetailsChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    required
                    value={detailsForm.email}
                    onChange={handleDetailsChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Active Skills</label>
                  <input
                    type="text"
                    className="form-input"
                    name="skills"
                    value={detailsForm.skills}
                    onChange={handleDetailsChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interests</label>
                  <input
                    type="text"
                    className="form-input"
                    name="interests"
                    value={detailsForm.interests}
                    onChange={handleDetailsChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Career Goal</label>
                  <input
                    type="text"
                    className="form-input"
                    name="career_goal"
                    value={detailsForm.career_goal}
                    onChange={handleDetailsChange}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : '💾 Save Profile Details'}
                </button>
              </form>

              {/* Password update form & Danger Zone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <form className="glass-panel content-card" onSubmit={handlePasswordSubmit}>
                  <h3 style={{ color: '#a5b4fc', marginBottom: '1.2rem' }}>🔒 Secure Password Update</h3>

                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      name="oldPassword"
                      required
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      name="newPassword"
                      required
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={actionLoading}>
                    {actionLoading ? 'Updating password...' : '🔑 Update Password'}
                  </button>
                </form>

                {/* Danger zone account deletion */}
                <div className="glass-panel content-card" style={{ border: '1px solid #ef4444' }}>
                  <h3 style={{ color: '#ef4444', marginBottom: '10px' }}>⚠️ Danger Zone</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
                    Permanently delete your user account. Once completed, your database profile records cannot be recovered.
                  </p>
                  <button className="btn" style={{ background: '#ef4444', color: '#fff', width: '100%' }} onClick={handleDeleteAccount}>
                    🗑️ Permanently Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
