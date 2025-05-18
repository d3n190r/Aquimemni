// src/frontend/src/components/feature components/ProfileView.jsx
/**
 * Public profile view component.
 * 
 * This component displays a user's profile information for viewing by other users.
 * It shows the user's username, bio, avatar, banner, and follower statistics.
 * It also provides functionality for following or unfollowing the displayed user.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Profile.css'; // Using the same CSS for consistency

const BANNER_IMAGE_EXTENSION_PUBLIC = '.jpg'; 

/**
 * Generates the file path for a banner image based on its identifier.
 * 
 * Validates the identifier against a list of predefined banner image IDs
 * and returns the path to the corresponding image file. If the identifier
 * is not valid or missing, falls back to the default banner.
 * 
 * @param {string|number} identifier - The identifier of the banner image
 * @returns {string} The file path to the banner image
 */
const getBannerImagePathPublic = (identifier) => {
  const validIdentifiers = ['1','2','3','4','5','6','default'];
  if (!identifier || !validIdentifiers.includes(String(identifier))) { // String(identifier) voor de zekerheid
    identifier = 'default'; 
  }
  return `/banners/banner${identifier}${BANNER_IMAGE_EXTENSION_PUBLIC}`;
};

/**
 * ProfileView component for displaying another user's profile.
 * 
 * Retrieves and displays a user's public profile information based on the userId URL parameter.
 * Provides functionality for following/unfollowing the viewed user and displays their
 * profile details, including username, bio, avatar, banner, and follower statistics.
 * 
 * @returns {JSX.Element} The rendered profile view page
 */
function ProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  /**
   * Effect hook to fetch the logged-in user's profile when component mounts.
   * 
   * Retrieves the current user's ID to determine if they are viewing their own profile
   * and to enable/disable follow functionality appropriately.
   */
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

  /**
   * Fetches the public profile data for the user specified by userId.
   * 
   * Retrieves the user's profile information from the API, including username,
   * bio, avatar, banner settings, and follower statistics. Validates banner settings
   * and applies default values if needed. Updates loading state and error messages.
   * 
   * @returns {Promise<void>} A promise that resolves when the profile data is fetched
   */
  const fetchPublicProfile = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/users/${userId}/profile`, { credentials: 'include' });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load profile (Status: ${response.status})`);
      }
      const data = await response.json();

      const validImageIdentifiers = ['1','2','3','4','5','6','default'];
      if (data.banner_type === 'image' && (!data.banner_value || !validImageIdentifiers.includes(String(data.banner_value)))) {
          data.banner_value = 'default';
      } else if (data.banner_type === 'color' && (!data.banner_value || !/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(data.banner_value))) {
          data.banner_value = '#6c757d';
      } else if (!data.banner_type) { 
          data.banner_type = 'color';
          data.banner_value = '#6c757d';
      }

      setProfile(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => {
     if (userId) {
       fetchPublicProfile();
     }
   }, [userId, fetchPublicProfile]); 

  /**
   * Handles the follow/unfollow action for the viewed profile.
   * 
   * Sends a request to the API to follow or unfollow the user based on the current
   * follow status. Refreshes the profile data after a successful action to update
   * the UI with the new follow status and follower count.
   * 
   * @returns {Promise<void>} A promise that resolves when the follow/unfollow action completes
   */
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
      fetchPublicProfile(); 
    } catch (err) {
      setError(err.message || 'An error occurred.');
    }
  };

  /**
   * Formats a date string into a localized, human-readable format.
   * 
   * Converts an ISO date string to a formatted string showing the year, month, and day
   * in the user's locale format. Handles cases where the date is missing or invalid.
   * 
   * @param {string} isoDate - The ISO date string to format
   * @returns {string} The formatted date string or an appropriate message if unavailable
   */
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

  const bannerStyle = profile ? {
    height: '180px', 
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundColor: profile.banner_type === 'color' ? profile.banner_value : '#e9ecef', 
    backgroundImage: profile.banner_type === 'image' ? `url(${getBannerImagePathPublic(profile.banner_value)})` : 'none',
  } : { height: '180px', backgroundColor: '#6c757d' }; 


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
    return (
        <div className="container mt-5">
            <div className="alert alert-warning">Profile data could not be loaded.</div>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
  }

  const canFollowUnfollow = loggedInUserId && loggedInUserId !== profile.id;

  return (
    <div className="profile-page-container py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-9">

            <div className="d-flex justify-content-start mb-3">
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i> Back to Home
              </button>
            </div>

            <div className="card shadow-lg profile-view-card">

              <div className="card-header p-0 position-relative profile-view-header">
                <div className="profile-banner" style={bannerStyle}></div>
                <img
                  src={`/avatars/avatar${profile.avatar || 1}.png`}
                  alt={`${profile.username}'s avatar`}
                  className="rounded-circle profile-view-avatar shadow"
                />
              </div>

              <div className="card-body profile-view-body">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-1">{profile.username}</h2>
                  <p className="text-muted mb-2">
                    Member since {formatRegistrationDate(profile.registered_at)}
                  </p>
                  <div className="mb-3">
                    <span className="me-3 text-muted">
                      <i className="bi bi-people-fill"></i> {profile.followers_count} Followers
                    </span>
                    <span className="text-muted">
                      <i className="bi bi-person-plus-fill"></i> {profile.following_count} Following
                    </span>
                  </div>
                  {canFollowUnfollow && (
                    <button
                      className={`btn btn-lg ${profile.is_following ? 'btn-outline-primary' : 'btn-primary'} profile-follow-btn`}
                      onClick={handleFollowToggle}
                    >
                      <i className={`bi ${profile.is_following ? 'bi-person-dash' : 'bi-person-plus'} me-2`}></i>
                      {profile.is_following ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

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

                <div className="mt-4">
                  <h5 className="text-primary border-bottom pb-2 mb-3">
                    <i className="bi bi-controller me-2"></i>Quizzes by {profile.username} ({profile.quizzes?.length || 0})
                  </h5>
                  {profile.quizzes && profile.quizzes.length > 0 ? (
                    <div className="list-group">
                      {profile.quizzes.map(quiz => (
                        <Link
                          key={quiz.id}
                          to={`/quiz/${quiz.id}`} 
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
              </div> 
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
