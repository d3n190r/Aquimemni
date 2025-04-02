import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include'
      });

      if (response.ok) {
        setPasswordSuccess("Password changed successfully");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');

    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
        credentials: 'include'
      });

      if (response.ok) {
        sessionStorage.clear();
        navigate('/login');
      } else {
        const data = await response.json();
        setDeleteError(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteError('Network error. Please try again.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Settings</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/home')}
        >
          ← Back to Home
        </button>
      </div>

      {/* Change Password Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            {passwordError && <div className="alert alert-danger">{passwordError}</div>}
            {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Change Password
            </button>
          </form>
        </div>
      </div>

      {/* Notifications Placeholder */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Notifications</h3>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="notificationsSwitch"
              disabled
            />
            <label className="form-check-label" htmlFor="notificationsSwitch">
              Enable Notifications (Coming Soon!)
            </label>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="card border-danger">
        <div className="card-body">
          <h3 className="card-title text">Delete Account</h3>
          <p className="text-muted">
            Deleting your account will remove all your data permanently. This action cannot be undone.
          </p>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Account Deletion</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {deleteError && <div className="alert alert-danger">{deleteError}</div>}
                    <p>To confirm, please enter your password:</p>
                    <input
                      type="password"
                      className="form-control"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account Permanently
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