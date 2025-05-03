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
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
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
      } else {
        setPasswordError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteSuccess('');

    if (!deletePassword) {
      setDeleteError('Please enter your password to delete your account.');
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

      {/* Notifications Placeholder */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Notifications</h3>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="notificationsSwitch" disabled />
            <label className="form-check-label" htmlFor="notificationsSwitch">
              Enable Notifications (Coming Soon!)
            </label>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="card border-danger">
        <div className="card-body">
          <h3 className="card-title text-danger">Delete Account</h3>
          <p className="text-muted">
            Deleting your account will permanently remove all your data. This cannot be undone.
          </p>
          {deleteSuccess && <div className="alert alert-success">{deleteSuccess}</div>}
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            Delete Account
          </button>

          {/* Modal */}
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
                      onClick={() => setShowDeleteModal(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
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