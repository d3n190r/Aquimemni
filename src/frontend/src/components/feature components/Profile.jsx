// src/frontend/src/components/feature components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // We'll create this CSS file

const avatars = Array.from({ length: 12 }, (_, i) => `/avatars/avatar${i + 1}.png`);

// --- BANNER IMAGE OPTIONS (Avatar-like) ---
// ... (rest of your banner constants) ...
const PREDEFINED_BANNER_IMAGE_IDS = ['1', '2', '3', '4', '5', '6','default'];
const BANNER_IMAGE_DISPLAY_NAMES = {
  '1': 'BlueLock',
  '2': 'HxH',
  '3': 'b3',
  '4': 'Berserk',
  '5': 'b5',
  '6': 'VinLand',
  'default': 'Subtle Default',
};
const BANNER_IMAGE_EXTENSION = '.jpg';

const getBannerImagePath = (identifier) => {
  return `/banners/banner${identifier}${BANNER_IMAGE_EXTENSION}`;
};

const predefinedBannerColors = [
  { id: 'color_gray', value: '#6c757d', name: 'Gray' },
  { id: 'color_blue', value: '#0d6efd', name: 'Blue' },
  { id: 'color_green', value: '#198754', name: 'Green' },
  { id: 'color_red', value: '#dc3545', name: 'Red' },
  { id: 'color_purple', value: '#6f42c1', name: 'Purple' },
  { id: 'color_teal', value: '#20c997', name: 'Teal' },
];


function Profile() {
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    avatar: 1,
    registeredAt: null,
    banner_type: 'color',
    banner_value: '#6c757d'
  });
  const [originalUsername, setOriginalUsername] = useState(''); // <-- NEW: Store original username
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [currentBannerType, setCurrentBannerType] = useState(profileData.banner_type);
  const [currentBannerValue, setCurrentBannerValue] = useState(profileData.banner_value);
  const [customColor, setCustomColor] = useState(
    profileData.banner_type === 'color' ? profileData.banner_value : '#6c757d'
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!response.ok) { navigate('/login'); return; }
        const data = await response.json();

        const initialBannerType = data.banner_type || 'color';
        let initialBannerValue = data.banner_value;
        if (!initialBannerValue) {
            initialBannerValue = (initialBannerType === 'image') ? 'default' : '#6c757d';
        } else if (initialBannerType === 'image' && !PREDEFINED_BANNER_IMAGE_IDS.includes(initialBannerValue)) {
            initialBannerValue = 'default';
        } else if (initialBannerType === 'color' && !/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(initialBannerValue)) {
            initialBannerValue = '#6c757d';
        }

        setProfileData({
          username: data.username,
          bio: data.bio || '',
          avatar: data.avatar || 1,
          registeredAt: data.registered_at,
          banner_type: initialBannerType,
          banner_value: initialBannerValue
        });
        setOriginalUsername(data.username); // <-- NEW: Set original username on fetch
        setCurrentBannerType(initialBannerType);
        setCurrentBannerValue(initialBannerValue);
        if (initialBannerType === 'color') {
          setCustomColor(initialBannerValue);
        } else {
          setCustomColor('#6c757d');
        }
      } catch (err) { setError('Failed to load profile'); }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    setCurrentBannerType(profileData.banner_type);
    setCurrentBannerValue(profileData.banner_value);
    if (profileData.banner_type === 'color') {
      setCustomColor(profileData.banner_value);
    }
  }, [profileData.banner_type, profileData.banner_value]);


  const handleInputChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleAvatarChange = (newAvatar) => {
    setProfileData(prev => ({ ...prev, avatar: newAvatar }));
  };

  // ... (banner handler functions remain the same) ...
  const handleBannerTypeChange = (e) => {
    const newType = e.target.value;
    setCurrentBannerType(newType);
    if (newType === 'image') {
      setCurrentBannerValue(PREDEFINED_BANNER_IMAGE_IDS.includes('default') ? 'default' : PREDEFINED_BANNER_IMAGE_IDS[0]);
    } else {
      setCurrentBannerValue(customColor || predefinedBannerColors[0]?.value || '#6c757d');
    }
  };

  const handleBannerImageSelect = (imageId) => {
    setCurrentBannerValue(imageId);
  };

  const handleBannerColorSelect = (colorValue) => {
    setCurrentBannerValue(colorValue);
    setCustomColor(colorValue);
  };
  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (currentBannerType === 'color') {
      setCurrentBannerValue(newColor);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const trimmedUsername = profileData.username.trim();

    // --- NEW: Username Change Confirmation ---
    if (trimmedUsername !== originalUsername) {
        const confirmUsernameChange = window.confirm(
            `You are changing your username from "${originalUsername}" to "${trimmedUsername}".\n` +
            `This will be your new login username.\n\nAre you sure you want to proceed?`
        );
        if (!confirmUsernameChange) {
            // User cancelled, revert username in input to original and stop submission
            setProfileData(prev => ({ ...prev, username: originalUsername }));
            return;
        }
    }
    // --- End Username Change Confirmation ---


    if (currentBannerType === 'color' && !/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(currentBannerValue)) {
        setError('Invalid custom color format. Please use a valid hex code (e.g., #RRGGBB or #RGB).');
        return;
    }
    if (currentBannerType === 'image' && !PREDEFINED_BANNER_IMAGE_IDS.includes(currentBannerValue)) {
        setError('Invalid banner image selected. Please choose from the predefined options.');
        return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        credentials: 'include',
        body: JSON.stringify({
          username: trimmedUsername, // Use the (potentially new) trimmed username
          bio: profileData.bio,
          avatar: profileData.avatar,
          banner_type: currentBannerType,
          banner_value: currentBannerValue
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Update failed');
        // If username already taken, the backend sends 409.
        // Revert username in input if the error was due to username being taken
        if (response.status === 409 && data.error && data.error.toLowerCase().includes('username already taken')) {
            setProfileData(prev => ({ ...prev, username: originalUsername }));
        }
        return;
      }

      if (data.user) {
        setProfileData(prev => ({
          ...prev,
          username: data.user.username,
          bio: data.user.bio || '',
          avatar: data.user.avatar || 1,
          banner_type: data.user.banner_type,
          banner_value: data.user.banner_value
        }));
        setOriginalUsername(data.user.username); // <-- NEW: Update original username after successful save
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else if (data.message && data.message === "No changes detected") {
        setSuccess(data.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
         console.warn("Profile update returned success status but unexpected data format:", data);
         setError("Profile update status unclear. Please refresh.");
      }
      setIsEditing(false);

    } catch (err) {
      setError(err.message || 'Network error');
    }
  };

  const formatRegistrationDate = () => {
    if (!profileData.registeredAt) return 'Not available';
    const date = new Date(profileData.registeredAt);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const bannerStyle = {
    height: '250px',
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: profileData.banner_type === 'color' ? profileData.banner_value : '#e9ecef',
    backgroundImage: profileData.banner_type === 'image' ? `url(${getBannerImagePath(profileData.banner_value)})` : 'none',
    transition: 'background-color 0.3s ease, background-image 0.3s ease',
    position: 'relative'
  };

  // --- NEW: Check if username has been changed for inline warning ---
  const usernameChanged = isEditing && profileData.username.trim() !== originalUsername && profileData.username.trim() !== "";

  return (
    <div className="profile-page-container">
      <div className="profile-banner" style={bannerStyle}></div>
      <div className="container py-4 profile-content-below-banner">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>My Profile</h1>
              {!isEditing && (
                <div>
                  <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/home')}>
                    ← Back to Home
                  </button>
                  <button className="btn btn-primary" onClick={() => {
                      setIsEditing(true);
                      setCurrentBannerType(profileData.banner_type);
                      setCurrentBannerValue(profileData.banner_value);
                      if (profileData.banner_type === 'color') {
                        setCustomColor(profileData.banner_value);
                      } else {
                        setCustomColor('#6c757d');
                      }
                    }}>
                    <i className="bi bi-pencil-square me-2"></i> Edit Profile
                  </button>
                </div>
              )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="card shadow-sm">
                <div className="card-body">
                  {/* Username */}
                  <div className="mb-4">
                    <label htmlFor="username" className="form-label fw-bold">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-control form-control-lg"
                        value={profileData.username}
                        onChange={handleInputChange}
                        required
                        minLength="3"
                        maxLength="30"
                    />
                    {/* --- NEW: Inline Username Change Warning --- */}
                    {usernameChanged && (
                        <div className="form-text text-warning mt-1">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            Warning: Changing your username will change your login ID.
                        </div>
                    )}
                  </div>
                  {/* Avatar Selection */}
                  {/* ... (avatar selection code remains the same) ... */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Avatar</label>
                    <div className="avatar-grid">
                      {avatars.map((avatarSrc, index) => (
                        <button key={index} type="button" className={`avatar-item ${profileData.avatar === index + 1 ? 'selected' : ''}`} onClick={() => handleAvatarChange(index + 1)}>
                          <img src={avatarSrc} alt={`Avatar ${index + 1}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BANNER CUSTOMIZATION SECTION */}
                  {/* ... (banner customization code remains the same) ... */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Customize Banner</label>
                    <div className="card">
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label">Banner Type:</label>
                          <div>
                            <div className="form-check form-check-inline">
                              <input className="form-check-input" type="radio" name="bannerTypeOptions" id="bannerTypeImage" value="image" checked={currentBannerType === 'image'} onChange={handleBannerTypeChange} />
                              <label className="form-check-label" htmlFor="bannerTypeImage">Predefined Image</label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input className="form-check-input" type="radio" name="bannerTypeOptions" id="bannerTypeColor" value="color" checked={currentBannerType === 'color'} onChange={handleBannerTypeChange} />
                              <label className="form-check-label" htmlFor="bannerTypeColor">Solid Color</label>
                            </div>
                          </div>
                        </div>
                        {currentBannerType === 'image' && (
                          <div className="mb-3">
                            <label className="form-label">Choose an Image:</label>
                            <div className="banner-image-grid">
                              {PREDEFINED_BANNER_IMAGE_IDS.map(imgId => (
                                <button
                                  key={imgId}
                                  type="button"
                                  className={`banner-image-item ${currentBannerValue === imgId ? 'selected' : ''}`}
                                  onClick={() => handleBannerImageSelect(imgId)}
                                  title={BANNER_IMAGE_DISPLAY_NAMES[imgId] || `Banner ${imgId}`}
                                >
                                  <img src={getBannerImagePath(imgId)} alt={BANNER_IMAGE_DISPLAY_NAMES[imgId] || `Banner ${imgId}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {currentBannerType === 'color' && (
                          <div className="mb-3">
                            <label className="form-label">Choose a Color:</label>
                            <div className="banner-color-swatches mb-2">
                              {predefinedBannerColors.map(color => (
                                <button key={color.id} type="button" className={`banner-color-swatch ${currentBannerValue === color.value ? 'selected' : ''}`} style={{ backgroundColor: color.value }} onClick={() => handleBannerColorSelect(color.value)} title={color.name} />
                              ))}
                            </div>
                            <label htmlFor="customColorInput" className="form-label">Or enter custom hex color:</label>
                            <div className="input-group">
                                <input type="text" id="customColorInput" className="form-control" value={customColor} onChange={handleCustomColorChange} placeholder="#RRGGBB" maxLength="7" />
                                <span className="input-group-text">
                                    <input type="color" value={customColor} onChange={handleCustomColorChange} style={{width: '30px', height:'30px', padding:'0', border:'none'}} title="Pick a color"/>
                                </span>
                            </div>
                             <small className="form-text text-muted"> Current selected color: <span style={{ display: 'inline-block', width: '1em', height: '1em', backgroundColor: currentBannerValue, border: '1px solid #ccc', verticalAlign: 'middle' }}></span> {currentBannerValue} </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {/* ... (bio input code remains the same) ... */}
                   <div className="mb-4">
                    <label htmlFor="bio" className="form-label fw-bold">Bio</label>
                    <textarea id="bio" name="bio" className="form-control" rows="5" value={profileData.bio} onChange={handleInputChange} maxLength="500" placeholder="Tell us about yourself..."/>
                    <small className="text-muted float-end">{profileData.bio.length}/500</small>
                  </div>
                  {/* Action Buttons */}
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary btn-lg"> <i className="bi bi-save me-2"></i> Save Changes </button>
                    <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => {
                        setIsEditing(false);
                        // Revert any unsaved changes on cancel, including username
                        setProfileData(prev => ({ ...prev, username: originalUsername }));
                    }}> Cancel </button>
                  </div>
                </div>
              </form>
            ) : (
              // VIEWING PROFILE (NOT EDITING)
              // ... (viewing mode code remains the same) ...
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center profile-details-view" style={{ marginTop: '-80px', position: 'relative', zIndex: 1 }}>
                    <img src={avatars[(profileData.avatar || 1) - 1]} alt="Selected avatar" className="rounded-circle shadow-lg" style={{ width: '160px', height: '160px', objectFit: 'cover', border: '5px solid white', backgroundColor: 'white' }}/>
                    <h2 className="mt-3 mb-1">{profileData.username}</h2>
                    <small className="text-muted"> Member since {formatRegistrationDate()} </small>
                  </div>
                  <div className="mt-4 pt-4">
                    <h4 className="text-primary"><i className="bi bi-person-badge-fill me-2"></i>About Me</h4>
                    <p className="lead text-muted" style={{ whiteSpace: 'pre-wrap' }}> {profileData.bio || 'No bio provided yet.'} </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;