// src/frontend/src/components/feature components/Settings.jsx
/**
 * User settings management component.
 * 
 * This component provides an interface for users to manage their account settings,
 * including password changes, notification preferences, and account deletion.
 * It handles form validation, API communication, and provides feedback on actions.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Settings component for managing user account settings.
 * 
 * Allows users to change their password, toggle notification preferences,
 * and delete their account. Handles form validation, API requests, and
 * provides appropriate feedback for success and error states.
 * 
 * @returns {JSX.Element} The rendered settings page
 */
function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Notification Settings State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [notificationSettingError, setNotificationSettingError] = useState('');
  const [notificationSettingSuccess, setNotificationSettingSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileSettings = async () => {
      setIsLoadingSettings(true);
      setNotificationSettingError('');
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) navigate('/login');
          throw new Error('Failed to load profile settings');
        }
        const data = await res.json();
        setNotificationsEnabled(data.notifications_enabled !== undefined ? data.notifications_enabled : true);
      } catch (err) {
        console.error("Error fetching profile settings:", err);
        setNotificationSettingError(err.message || 'Could not load notification settings.');
        setTimeout(() => setNotificationSettingError(''), 3000); // Clear error after 3 seconds
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchProfileSettings();
  }, [navigate]);

  /**
   * Handles the password change form submission.
   * 
   * Validates that the new passwords match, sends the password change request to the API,
   * and provides feedback on success or failure. Clears form fields on success.
   * 
   * @param {Event} e - The form submission event
   * @returns {Promise<void>} A promise that resolves when the password change process completes
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      setTimeout(() => setPasswordError(''), 3000); // Clear error after 3 seconds
      return;
    }

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(data.error || 'Failed to change password.');
        setTimeout(() => setPasswordError(''), 3000); // Clear error after 3 seconds
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
      setTimeout(() => setPasswordError(''), 3000); // Clear error after 3 seconds
    }
  };

  /**
   * Handles the account deletion process.
   * 
   * Validates the password, sends the account deletion request to the API,
   * and navigates to the login page on success. Provides feedback on errors.
   * 
   * @returns {Promise<void>} A promise that resolves when the account deletion process completes
   */
  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteSuccess('');

    if (!deletePassword) {
      setDeleteError('Please enter your password to delete your account.');
      // Note: deleteError in modal is usually cleared by re-opening or successful action
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        setDeleteSuccess(data.message || 'Account deleted successfully.');
        sessionStorage.clear();
        navigate('/login');
      } else if (res.status === 401) {
        setDeleteError(data.error || 'Unauthorized. Please log in again.');
      } else {
        setDeleteError(data.error || 'Failed to delete account.');
      }
    } catch (err) {
      setDeleteError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handles toggling notification preferences.
   * 
   * Updates the notification preference state optimistically, sends the change to the API,
   * and reverts the state if the API request fails. Provides feedback on success or failure.
   * 
   * @returns {Promise<void>} A promise that resolves when the notification preference update completes
   */
  const handleNotificationToggle = async () => {
    const newNotificationsEnabled = !notificationsEnabled;
    setNotificationsEnabled(newNotificationsEnabled); 
    setNotificationSettingError('');
    setNotificationSettingSuccess('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications_enabled: newNotificationsEnabled }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setNotificationSettingSuccess(`Notifications ${newNotificationsEnabled ? 'enabled' : 'disabled'} successfully.`);
        setTimeout(() => setNotificationSettingSuccess(''), 3000);
      } else {
        setNotificationsEnabled(!newNotificationsEnabled); 
        setNotificationSettingError(data.error || `Failed to ${newNotificationsEnabled ? 'enable' : 'disable'} notifications.`);
        setTimeout(() => setNotificationSettingError(''), 3000); // Clear error after 3 seconds
      }
    } catch (err) {
      setNotificationsEnabled(!newNotificationsEnabled); 
      setNotificationSettingError('Network error updating notification settings.');
      setTimeout(() => setNotificationSettingError(''), 3000); // Clear error after 3 seconds
    }
  };


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Settings</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/home')}>
          ← Back to Home
        </button>
      </div>

      {/* Change Password */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            {passwordError && <div className="alert alert-danger">{passwordError}</div>}
            {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <div className="position-relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isDeleting}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isDeleting}
                >
                  <i className={`bi bi-eye${showCurrentPassword ? "-slash" : ""}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="position-relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isDeleting}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isDeleting}
                >
                  <i className={`bi bi-eye${showNewPassword ? "-slash" : ""}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <div className="position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isDeleting}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isDeleting}
                >
                  <i className={`bi bi-eye${showConfirmPassword ? "-slash" : ""}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isDeleting}>
              Change Password
            </button>
          </form>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Notification Preferences</h3>
          {notificationSettingError && <div className="alert alert-danger mt-2 py-2">{notificationSettingError}</div>}
          {notificationSettingSuccess && <div className="alert alert-success mt-2 py-2">{notificationSettingSuccess}</div>}
          {isLoadingSettings ? (
            <div className="text-center my-3">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="text-muted">Loading notification settings...</span>
            </div>
          ) : (
            <div className="form-check form-switch mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="notificationsSwitch"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                disabled={isLoadingSettings || isDeleting}
              />
              <label className="form-check-label" htmlFor="notificationsSwitch">
                Enable Notifications
              </label>
              <p className="form-text text-muted mt-2 small">
                {notificationsEnabled
                  ? "You are currently receiving notifications for new followers and session invites."
                  : "Notifications are currently off. You won't receive updates for new followers or session invites."
                }
              </p>
            </div>
          )}
        </div>
      </div>


      {/* Delete Account */}
      <div className="card border-danger">
        <div className="card-body">
          <h3 className="card-title text-danger">Delete Account</h3>
          <p className="text-muted">
            Deleting your account will permanently remove all your data. This action cannot be undone.
          </p>
          {deleteSuccess && <div className="alert alert-success">{deleteSuccess}</div>}
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            Delete Account
          </button>

          {/* Modal for Delete Account */}
          {showDeleteModal && (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Account Deletion</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteError(''); // Clear modal-specific error on close
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {deleteError && <div className="alert alert-danger">{deleteError}</div>}
                    <label className="form-label">Enter your password to confirm:</label>
                    <div className="position-relative">
                      <input
                        type={showDeletePassword ? "text" : "password"}
                        className="form-control"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        required
                        disabled={isDeleting}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        disabled={isDeleting}
                      >
                        <i className={`bi bi-eye${showDeletePassword ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteError(''); // Clear modal-specific error on cancel
                      }}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || !deletePassword.trim()}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
