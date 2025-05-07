// src/frontend/src/components/feature components/PublicProfileView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function PublicProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null); // To store current user's ID

  // Fetch logged-in user's ID to compare with viewed profile ID
  useEffect(() => {
    const fetchOwnProfile = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setLoggedInUserId(data.id);
        } else {
          // Not logged in or error, but can still view public profiles if designed so
          console.warn('Could not fetch logged-in user profile for comparison.');
        }
      } catch (err) {
        console.error('Error fetching own profile for comparison:', err);
      }
    };
    fetchOwnProfile();
  }, []);


  const fetchPublicProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/users/${userId}/profile`, {
        credentials: 'include' // Send cookies to know if logged-in user is following
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load profile (Status: ${response.status})`);
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId, fetchPublicProfile]);

  const handleFollowToggle = async () => {
    if (!profile || profile.viewing_own_profile || !loggedInUserId) return;

    const url = profile.is_following ? `/api/unfollow/${profile.id}` : `/api/follow/${profile.id}`;
    try {
      const response = await fetch(url, { method: 'POST', credentials: 'include' });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Follow/Unfollow action failed');
      }
      // Refresh profile data to get updated follow status and counts
      fetchPublicProfile();
    } catch (err) {
      setError(err.message || 'An error occurred.');
    }
  };

  const formatRegistrationDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    try {
      return new Date(isoDate).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Profile data could not be loaded.</div>
         <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const canFollowUnfollow = loggedInUserId && loggedInUserId !== profile.id;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="d-flex justify-content-start mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)} // Go back to the previous page
            >
              ← Back
            </button>
          </div>

          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white p-4 d-flex flex-column flex-md-row align-items-center">
              <img
                src={`/avatars/avatar${profile.avatar || 1}.png`}
                alt={`${profile.username}'s avatar`}
                className="rounded-circle me-md-4 mb-3 mb-md-0 shadow"
                style={{ width: '120px', height: '120px', border: '3px solid white', objectFit: 'cover' }}
              />
              <div className="text-center text-md-start">
                <h1 className="mb-0">{profile.username}</h1>
                <small className="text-white-50">
                  Member since {formatRegistrationDate(profile.registered_at)}
                </small>
                 <div className="mt-2">
                    <span className="me-3"><i className="bi bi-people-fill"></i> {profile.followers_count} Followers</span>
                    <span><i className="bi bi-person-plus-fill"></i> {profile.following_count} Following</span>
                </div>
              </div>
              {canFollowUnfollow && (
                <button
                  className={`btn btn-lg ms-md-auto mt-3 mt-md-0 ${profile.is_following ? 'btn-outline-light' : 'btn-light'}`}
                  onClick={handleFollowToggle}
                  style={{ minWidth: '120px' }}
                >
                  {profile.is_following ? 'Following' : 'Follow'}
                </button>
              )}
               {profile.viewing_own_profile && (
                 <Link to="/profile" className="btn btn-outline-light btn-lg ms-md-auto mt-3 mt-md-0">
                   Edit My Profile
                 </Link>
               )}
            </div>

            <div className="card-body p-4">
              {profile.bio && (
                <div className="mb-4">
                  <h4 className="text-primary"><i className="bi bi-person-badge-fill me-2"></i>About Me</h4>
                  <p className="lead text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                    {profile.bio}
                  </p>
                </div>
              )}
              {!profile.bio && (
                 <div className="mb-4">
                  <h4 className="text-primary"><i className="bi bi-person-badge-fill me-2"></i>About Me</h4>
                  <p className="text-muted fst-italic">This user hasn't shared a bio yet.</p>
                </div>
              )}

              <hr className="my-4" />

              <div>
                <h4 className="text-primary mb-3"><i className="bi bi-controller me-2"></i>Quizzes by {profile.username} ({profile.quizzes?.length || 0})</h4>
                {profile.quizzes && profile.quizzes.length > 0 ? (
                  <div className="list-group">
                    {profile.quizzes.map(quiz => (
                      <Link
                        key={quiz.id}
                        to={`/quiz/${quiz.id}`} // Link to QuizDetails page
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1">{quiz.name}</h6>
                          <small className="text-muted">
                            {quiz.questions_count} questions - Created on {formatRegistrationDate(quiz.created_at)}
                          </small>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted fst-italic">This user hasn't created any public quizzes yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicProfileView;