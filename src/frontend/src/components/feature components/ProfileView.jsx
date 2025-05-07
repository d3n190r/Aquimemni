// src/frontend/src/components/feature components/ProfileView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Profile.css'; // Using the same CSS for consistency

// --- BANNER IMAGE PATH CONSTRUCTION (Avatar-like) ---
const BANNER_IMAGE_EXTENSION_PUBLIC = '.jpg'; // Ensure this matches your files
const getBannerImagePathPublic = (identifier) => {
  // List of valid identifiers (should match backend/Profile.jsx)
  const validIdentifiers = ['1','2','3','4','5','6','default'];
  if (!identifier || !validIdentifiers.includes(identifier)) {
    identifier = 'default'; // Fallback to default identifier if invalid or missing
  }
  return `/banners/banner${identifier}${BANNER_IMAGE_EXTENSION_PUBLIC}`;
};

function ProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // Fetch logged-in user ID to compare and enable/disable follow button
  useEffect(() => {
    const fetchOwnProfile = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setLoggedInUserId(data.id);
        }
      } catch (err) { console.error('Error fetching own profile for comparison:', err); }
    };
    fetchOwnProfile();
  }, []);

  // Fetch the public profile data for the user specified by userId
  const fetchPublicProfile = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/users/${userId}/profile`, { credentials: 'include' });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load profile (Status: ${response.status})`);
      }
      const data = await response.json();

      // --- Data Validation ---
      // Ensure banner_value has a sane default for display if somehow missing/invalid from backend
      const validImageIdentifiers = ['1','2','3','4','5','6','default'];
      if (data.banner_type === 'image' && (!data.banner_value || !validImageIdentifiers.includes(data.banner_value))) {
          data.banner_value = 'default';
      } else if (data.banner_type === 'color' && (!data.banner_value || !/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(data.banner_value))) {
          // If DB has an invalid color, fallback to default color
          data.banner_value = '#6c757d';
      } else if (!data.banner_type) { // If banner_type itself is missing
          data.banner_type = 'color';
          data.banner_value = '#6c757d';
      }

      setProfile(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [userId]);

  // Trigger fetchPublicProfile when userId changes
  useEffect(() => {
     if (userId) {
       fetchPublicProfile();
     }
   }, [userId, fetchPublicProfile]); // Include fetchPublicProfile in dependencies

  // Handle Follow/Unfollow action
  const handleFollowToggle = async () => {
    if (!profile || profile.viewing_own_profile || !loggedInUserId) return;
    const url = profile.is_following ? `/api/unfollow/${profile.id}` : `/api/follow/${profile.id}`;
    const method = 'POST';
    try {
      const response = await fetch(url, { method, credentials: 'include' });
      if (!response.ok) {
         const errData = await response.json().catch(() => ({}));
         throw new Error(errData.error || 'Follow/Unfollow action failed');
      }
      fetchPublicProfile(); // Refresh profile data to update follow status and counts
    } catch (err) {
      setError(err.message || 'An error occurred.');
      // Optional: Add temporary error display specific to follow action
    }
  };

  // Format registration date
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

  // --- Dynamic Banner Styling ---
  const bannerStyle = profile ? {
    height: '180px', // Adjusted height for header style
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundColor: profile.banner_type === 'color' ? profile.banner_value : '#e9ecef', // Fallback BG color
    backgroundImage: profile.banner_type === 'image' ? `url(${getBannerImagePathPublic(profile.banner_value)})` : 'none',
  } : { height: '180px', backgroundColor: '#6c757d' }; // Default style while profile is loading


  // --- Render Logic ---

  if (loading) {
    return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
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
    // This case should ideally not be reached if loading finishes and no error occurred,
    // but good as a safeguard.
    return (
        <div className="container mt-5">
            <div className="alert alert-warning">Profile data could not be loaded.</div>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
  }

  // Determine if the follow/unfollow button should be shown
  const canFollowUnfollow = loggedInUserId && loggedInUserId !== profile.id;

  return (
    // Use outer container for page background color and padding
    <div className="profile-page-container py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-9">

            {/* Back Button - Positioned above the card */}
            <div className="d-flex justify-content-start mb-3">
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
            </div>

            {/* Main Profile Card */}
            <div className="card shadow-lg profile-view-card">

              {/* Card Header containing the banner and positioned avatar */}
              <div className="card-header p-0 position-relative profile-view-header">
                {/* Banner Div */}
                <div className="profile-banner" style={bannerStyle}></div>
                {/* Avatar positioned over the banner */}
                <img
                  src={`/avatars/avatar${profile.avatar || 1}.png`}
                  alt={`${profile.username}'s avatar`}
                  className="rounded-circle profile-view-avatar shadow"
                  // Positioning styles are in Profile.css
                />
              </div>

              {/* Card Body - Starts below header, pushed down by avatar padding */}
              <div className="card-body profile-view-body">
                {/* User Info Section */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-1">{profile.username}</h2>
                  <p className="text-muted mb-2">
                    Member since {formatRegistrationDate(profile.registered_at)}
                  </p>
                  {/* Follower/Following Counts */}
                  <div className="mb-3">
                    <span className="me-3 text-muted">
                      <i className="bi bi-people-fill"></i> {profile.followers_count} Followers
                    </span>
                    <span className="text-muted">
                      <i className="bi bi-person-plus-fill"></i> {profile.following_count} Following
                    </span>
                  </div>
                  {/* Follow/Unfollow Button */}
                  {canFollowUnfollow && (
                    <button
                      className={`btn btn-lg ${profile.is_following ? 'btn-outline-primary' : 'btn-primary'} profile-follow-btn`}
                      onClick={handleFollowToggle}
                      // Add disabled state while action is in progress if desired
                    >
                      <i className={`bi ${profile.is_following ? 'bi-person-dash' : 'bi-person-plus'} me-2`}></i>
                      {profile.is_following ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                {/* Bio Section */}
                {profile.bio && (
                  <div className="mb-4">
                    <h5 className="text-primary border-bottom pb-2 mb-3">
                      <i className="bi bi-person-badge-fill me-2"></i>About {profile.username}
                    </h5>
                    <p className="profile-bio-text">
                      {profile.bio}
                    </p>
                  </div>
                )}
                {!profile.bio && (
                  <div className="mb-4">
                     <h5 className="text-primary border-bottom pb-2 mb-3">
                       <i className="bi bi-person-badge-fill me-2"></i>About {profile.username}
                     </h5>
                     <p className="text-muted fst-italic">This user hasn't shared a bio yet.</p>
                  </div>
                )}

                {/* Quizzes Section */}
                <div className="mt-4">
                  <h5 className="text-primary border-bottom pb-2 mb-3">
                    <i className="bi bi-controller me-2"></i>Quizzes by {profile.username} ({profile.quizzes?.length || 0})
                  </h5>
                  {profile.quizzes && profile.quizzes.length > 0 ? (
                    <div className="list-group">
                      {profile.quizzes.map(quiz => (
                        <Link
                          key={quiz.id}
                          to={`/quiz/${quiz.id}`} // Links to QuizDetails page
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h6 className="mb-1 fw-medium">{quiz.name}</h6>
                            <small className="text-muted">
                              {quiz.questions_count} questions - Created {formatRegistrationDate(quiz.created_at)}
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
              </div> {/* End card-body */}
            </div> {/* End card */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;