import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const avatars = Array.from({ length: 12 }, (_, i) => `/avatars/avatar${i + 1}.png`);

function Profile() {
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    avatar: 1,
    registeredAt: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', { 
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) {
          navigate('/login');
          return;
        }

        const data = await response.json();
        setProfileData({
          username: data.username,
          bio: data.bio || '',
          avatar: data.avatar || 1,
          registeredAt: data.registered_at
        });
      } catch (err) {
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUsernameChange = (e) => {
    setProfileData(prev => ({ ...prev, username: e.target.value }));
  };

  const handleBioChange = (e) => {
    setProfileData(prev => ({ ...prev, bio: e.target.value }));
  };

  const handleAvatarChange = (newAvatar) => {
    setProfileData(prev => ({ ...prev, avatar: newAvatar }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: profileData.username.trim(),
          bio: profileData.bio,
          avatar: profileData.avatar
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Update failed');
        return;
      }

      // Refresh profile data
      const newResponse = await fetch('/api/profile', { 
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const newData = await newResponse.json();
      
      setProfileData({
        username: newData.username,
        bio: newData.bio || '',
        avatar: newData.avatar || 1,
        registeredAt: newData.registered_at
      });
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.message || 'Network error');
    }
  };

  const formatRegistrationDate = () => {
    if (!profileData.registeredAt) return 'Not available';
    const date = new Date(profileData.registeredAt);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Profile</h1>
            {!isEditing && (
              <div>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => navigate('/home')}
                >
                  ← Go Home
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.username}
                  onChange={handleUsernameChange}
                  required
                  minLength="3"
                  maxLength="30"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Avatar</label>
                <div className="avatar-grid">
                  {avatars.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`avatar-item ${profileData.avatar === index + 1 ? 'selected' : ''}`}
                      onClick={() => handleAvatarChange(index + 1)}
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        padding: 0,
                        border: '3px solid transparent'
                      }}
                    >
                      <img
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={profileData.bio}
                  onChange={handleBioChange}
                  maxLength="250"
                  placeholder="Tell us about yourself..."
                />
                <small className="text-muted float-end">
                  {profileData.bio.length}/250
                </small>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-2"></i>
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-center mb-4">
                  <div 
                    style={{
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #0d6efd',
                      margin: '0 auto 1.5rem'
                    }}
                  >
                    <img
                      src={avatars[profileData.avatar - 1]}
                      alt="Selected avatar"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <h2 className="mb-1">{profileData.username}</h2>
                  <small className="text-muted">
                    Member since {formatRegistrationDate()}
                  </small>
                </div>

                <div className="mb-4">
                  <h4>About Me</h4>
                  <p className="lead text-muted">
                    {profileData.bio || 'No bio.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;