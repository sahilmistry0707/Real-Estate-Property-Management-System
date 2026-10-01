import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import {
  User,
  Mail,
  Phone,
  Building,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Profile fields state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    agencyName: user?.agencyName || '',
    bio: user?.bio || '',
  });

  // Password fields state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    if (profileSuccess) setProfileSuccess('');
    if (profileError) setProfileError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passSuccess) setPassSuccess('');
    if (passError) setPassError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const res = await authService.updateProfile(profileData);
      updateUser(res.data.user);
      setProfileSuccess('Profile information updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setPassLoading(true);
      setPassError('');
      setPassSuccess('');

      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPassSuccess('Your password has been changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="page-wrapper container" style={{ maxWidth: '880px' }}>
      <div className="page-header">
        <h1 className="page-title">Manage Account Profile</h1>
        <p className="page-subtitle">Update your personal contact details, agent bio, and password</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user?.fullName}</h2>
              <span className={`badge badge-featured`} style={{ textTransform: 'uppercase' }}>
                Role: {user?.role}
              </span>
            </div>
          </div>

          {profileSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', backgroundColor: '#f1f5f9' }}
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            {user?.role === 'agent' && (
              <>
                <div className="form-group">
                  <label className="form-label">Agency / Brokerage Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      name="agencyName"
                      className="form-control"
                      style={{ paddingLeft: '2.5rem' }}
                      value={profileData.agencyName}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Agent Bio & Experience</label>
                  <textarea
                    name="bio"
                    className="form-textarea"
                    rows="3"
                    placeholder="Licensed Realtor specializing in residential properties..."
                    value={profileData.bio}
                    onChange={handleProfileChange}
                  ></textarea>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={profileLoading} style={{ width: '100%' }}>
              <Save size={16} />
              <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Lock size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Change Password</h2>
          </div>

          {passSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className="form-control"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="form-control"
                placeholder="At least 6 characters"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={passLoading} style={{ width: '100%' }}>
              <Shield size={16} />
              <span>{passLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
