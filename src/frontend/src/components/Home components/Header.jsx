// src/frontend/src/components/Home components/Header.jsx
/**
 * Header component for the application.
 * 
 * This component provides the top navigation bar with search functionality,
 * notification system, and user profile menu. It handles user authentication status,
 * search queries, and notification management.
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Header component that displays the application's top navigation bar.
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onLogout - Callback function to execute when user logs out
 * @returns {JSX.Element} The rendered header component
 */
const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userData, setUserData] = useState({ username: 'Loading...', avatar: 1, notificationsEnabled: true });

  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isClearingNotifications, setIsClearingNotifications] = useState(false); // New state for "Clear All"
  const [notificationError, setNotificationError] = useState(''); // For errors in notification dropdown

  const notificationPollIntervalRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Effect hook to fetch user profile data when component mounts.
   * 
   * Retrieves the user's profile information including username, avatar,
   * and notification preferences. Sets up cleanup for component unmounting.
   */
  useEffect(() => {
    isMountedRef.current = true;
    fetch('/api/profile', { credentials: 'include' })
      .then(res => {
        if (!isMountedRef.current) return Promise.reject('Component unmounted');
        return res.ok ? res.json() : Promise.reject('Not logged in');
      })
      .then(data => {
        if (isMountedRef.current) {
            setUserData({
                username: data.username,
                avatar: data.avatar || 1,
                notificationsEnabled: data.notifications_enabled !== undefined ? data.notifications_enabled : true
            });
        }
      })
      .catch((err) => {
         if (isMountedRef.current && err !== 'Component unmounted') console.error("Profile fetch error:", err);
      });
    return () => { isMountedRef.current = false; };
  }, []);

  /**
   * Fetches the count of unread notifications for the current user.
   * 
   * This memoized callback function retrieves the number of unread notifications
   * from the API and updates the notification count state. It handles component
   * unmounting and disabled notifications appropriately.
   * 
   * @returns {Promise<void>} A promise that resolves when the count is fetched
   */
  const fetchNotificationCount = useCallback(async () => {
    if (!isMountedRef.current || userData.username === 'Loading...' || !userData.notificationsEnabled) {
      if (notificationPollIntervalRef.current) {
        clearInterval(notificationPollIntervalRef.current);
        notificationPollIntervalRef.current = null;
      }
      if (isMountedRef.current && !userData.notificationsEnabled) setNotificationCount(0);
      return;
    }
    try {
      const res = await fetch('/api/notifications/count', { credentials: 'include' });
      if (!isMountedRef.current) return;
      if (res.ok) {
        const data = await res.json();
        if (isMountedRef.current) {
            setNotificationCount(data.count);
        }
      } else {
        console.error("Failed to fetch notification count:", res.status);
        if (res.status === 401 && notificationPollIntervalRef.current) {
            clearInterval(notificationPollIntervalRef.current);
            notificationPollIntervalRef.current = null;
        }
      }
    } catch (err) {
      if (isMountedRef.current) console.error("Network error fetching notification count:", err);
    }
  }, [userData.username, userData.notificationsEnabled]);

  /**
   * Effect hook to set up notification polling.
   * 
   * Sets up an interval to periodically fetch notification counts when the user
   * is authenticated and has notifications enabled. Cleans up the interval when
   * the component unmounts or when notifications are disabled.
   */
  useEffect(() => {
    if (userData.username !== 'Loading...' && userData.notificationsEnabled && isMountedRef.current) {
      fetchNotificationCount();
      if (notificationPollIntervalRef.current) clearInterval(notificationPollIntervalRef.current);
      notificationPollIntervalRef.current = setInterval(fetchNotificationCount, 30000);
    } else if (!userData.notificationsEnabled && notificationPollIntervalRef.current) {
        clearInterval(notificationPollIntervalRef.current);
        notificationPollIntervalRef.current = null;
    }
    return () => {
      if (notificationPollIntervalRef.current) {
        clearInterval(notificationPollIntervalRef.current);
        notificationPollIntervalRef.current = null;
      }
    };
  }, [fetchNotificationCount, userData.username, userData.notificationsEnabled]);

  /**
   * Fetches the list of notifications for the current user.
   * 
   * Retrieves the most recent notifications from the API and updates the notifications state.
   * Handles loading states, errors, and component unmounting appropriately.
   * 
   * @returns {Promise<void>} A promise that resolves when notifications are fetched
   */
  const fetchNotifications = async () => {
    if (!isMountedRef.current || !userData.notificationsEnabled) {
        if (isMountedRef.current) setNotifications([]);
        return;
    }
    setIsLoadingNotifications(true);
    setNotificationError(''); // Clear previous errors
    try {
      const res = await fetch('/api/notifications?limit=10', { credentials: 'include' });
      if (!isMountedRef.current) return;
      if (res.ok) {
        const data = await res.json();
        if (isMountedRef.current) setNotifications(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (isMountedRef.current) {
            setNotifications([]);
            setNotificationError(errData.error || `Failed to fetch notifications (Status: ${res.status})`);
        }
        console.error("Failed to fetch notifications:", res.status);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setNotifications([]);
        setNotificationError("Network error fetching notifications.");
      }
      console.error("Network error fetching notifications:", err);
    } finally {
      if (isMountedRef.current) setIsLoadingNotifications(false);
    }
  };

  /**
   * Marks all notifications as read on the backend.
   * 
   * Sends a request to the API to mark all notifications as read for the current user.
   * Handles component unmounting and disabled notifications appropriately.
   * 
   * @returns {Promise<void>} A promise that resolves when the operation completes
   */
  const markAllNotificationsAsReadOnBackend = async () => {
    if (!isMountedRef.current || !userData.notificationsEnabled) return;
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      });
      if (!isMountedRef.current) return;
      if (!res.ok) {
        console.error("Failed to mark all notifications as read on backend:", res.status);
      }
    } catch (err) {
      if (isMountedRef.current) console.error("Network error marking all notifications as read:", err);
    }
  };

  /**
   * Toggles the notification dropdown open/closed state.
   * 
   * When opening the dropdown, fetches the latest notifications and marks them as read.
   * When closing, clears any error messages. Handles disabled notifications appropriately.
   * 
   * @returns {Promise<void>} A promise that resolves when the toggle operation completes
   */
  const toggleNotificationDropdown = async () => {
    if (!isMountedRef.current || !userData.notificationsEnabled) {
        if (isMountedRef.current) setIsNotificationDropdownOpen(false);
        return;
    }
    const willOpen = !isNotificationDropdownOpen;
    setIsNotificationDropdownOpen(willOpen);

    if (willOpen) {
      fetchNotifications(); // Fetch full list when opening
      if (notificationCount > 0) { // If there were unread ones
        setNotificationCount(0); // Optimistically update UI
        await markAllNotificationsAsReadOnBackend(); // Tell backend
      }
    } else {
        setNotificationError(''); // Clear errors when closing
    }
  };

  /**
   * Marks a specific notification as read.
   * 
   * Updates the UI to show the notification as read and sends a request to the API
   * to persist this state. Handles event propagation and component unmounting.
   * 
   * @param {number} notificationId - The ID of the notification to mark as read
   * @param {Event} e - The event object, if triggered by a user interaction
   * @returns {Promise<void>} A promise that resolves when the operation completes
   */
  const markNotificationAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation();
    if (!isMountedRef.current || !userData.notificationsEnabled) return;

    const notificationWasUnread = notifications.find(n => n.id === notificationId && !n.is_read);
    setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, is_read: true} : n));

    // No need to adjust notificationCount here as it's cleared when dropdown opens
    // And individual read actions are mainly for persistent state.
    // If we want to be super precise, we *could* decrement here if it was unread.

    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!isMountedRef.current) return;
      if (res.ok) {
         // Optionally re-fetch count if needed, but opening dropdown clears it anyway
         // await fetchNotificationCount();
      } else {
        console.error("Failed to mark notification as read on backend:", res.status);
        // Potentially revert UI if backend fails, or re-fetch count
        // await fetchNotificationCount();
      }
    } catch (err) {
      if (isMountedRef.current) console.error("Network error marking notification as read:", err);
      // await fetchNotificationCount();
    }
  };

  /**
   * Clears all notifications for the current user.
   * 
   * Sends a request to the API to clear all notifications and updates the UI accordingly.
   * Handles loading states, errors, and component unmounting.
   * 
   * @returns {Promise<void>} A promise that resolves when the operation completes
   */
  const handleClearAllNotifications = async () => {
    if (!isMountedRef.current || !userData.notificationsEnabled || notifications.length === 0) return;

    setIsClearingNotifications(true);
    setNotificationError('');
    try {
        const res = await fetch('/api/notifications/clear-all', {
            method: 'POST', // Or DELETE
            credentials: 'include',
        });
        if (!isMountedRef.current) return;
        if (res.ok) {
            if (isMountedRef.current) {
                setNotifications([]);
                setNotificationCount(0); // Count is already 0 if dropdown was opened
                                      // but good to be explicit if called from elsewhere
            }
        } else {
            const errData = await res.json().catch(() => ({}));
            if (isMountedRef.current) {
                setNotificationError(errData.error || `Failed to clear notifications (Status: ${res.status})`);
            }
            console.error("Failed to clear notifications:", res.status);
        }
    } catch (err) {
        if (isMountedRef.current) {
            setNotificationError("Network error clearing notifications.");
        }
        console.error("Network error clearing notifications:", err);
    } finally {
        if (isMountedRef.current) setIsClearingNotifications(false);
    }
  };


  /**
   * Handles joining a session from a notification.
   * 
   * Marks the notification as read and navigates to the session page.
   * Handles event propagation and component unmounting.
   * 
   * @param {string} sessionCode - The code of the session to join
   * @param {number} notificationId - The ID of the notification to mark as read
   * @param {Event} e - The event object, if triggered by a user interaction
   * @returns {Promise<void>} A promise that resolves when the operation completes
   */
  const handleNotificationJoin = async (sessionCode, notificationId, e) => {
      if (e) e.stopPropagation();
      if (!isMountedRef.current || !userData.notificationsEnabled) return;

      await markNotificationAsRead(notificationId, e);

      if (isMountedRef.current) {
        setIsNotificationDropdownOpen(false);
        navigate(`/session/${sessionCode}`);
      }
  };

  /**
   * Effect hook to handle clicks outside the notification dropdown.
   * 
   * Closes the notification dropdown when the user clicks outside of it.
   * Cleans up the event listener when the component unmounts.
   */
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
              if (isMountedRef.current) {
                setIsNotificationDropdownOpen(false);
                setNotificationError(''); // Clear errors when closing via outside click
              }
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  /**
   * Handles the user logout process.
   * 
   * Clears notification polling, sends a logout request to the API,
   * resets local state, and navigates to the login page.
   * 
   * @returns {Promise<void>} A promise that resolves when the logout process completes
   */
  const handleLogout = async () => {
    if (notificationPollIntervalRef.current) {
      clearInterval(notificationPollIntervalRef.current);
      notificationPollIntervalRef.current = null;
    }
    try {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch(err) {
        console.error("Logout API call failed:", err);
    } finally {
        if (isMountedRef.current) {
            setUserData({ username: 'Loading...', avatar: 1, notificationsEnabled: true });
            setNotificationCount(0);
            setNotifications([]);
            if (onLogout) onLogout();
            navigate('/login');
        }
    }
  };

  /**
   * Handles the search form submission.
   * 
   * Searches for quizzes based on the entered search query and updates the search results.
   * Handles component unmounting and empty search queries appropriately.
   * 
   * @param {Event} e - The form submission event
   * @returns {Promise<void>} A promise that resolves when the search completes
   */
  const handleSearch = async e => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (isMountedRef.current) setSearchResults([]);
      return;
    }
    try {
        const res = await fetch(`/api/quizzes/search?q=${encodeURIComponent(searchQuery)}`, {
            credentials: 'include'
        });
        if (!isMountedRef.current) return;
        if (res.ok) {
            if (isMountedRef.current) setSearchResults(await res.json());
        } else {
            console.error("Search failed:", res.status);
            if (isMountedRef.current) setSearchResults([]);
        }
    } catch (err) {
        if (isMountedRef.current) {
            console.error("Search network error:", err);
            setSearchResults([]);
        }
    }
  };

  /**
   * Navigates to a specific quiz page.
   * 
   * Redirects the user to the details page for the selected quiz and
   * clears the search input and results.
   * 
   * @param {number} id - The ID of the quiz to navigate to
   */
  const goToQuiz = id => {
    if (isMountedRef.current) {
        navigate(`/quiz/${id}`);
        setSearchResults([]);
        setSearchQuery('');
    }
  };

  return (
    <header className="bg-light p-3 shadow-sm fixed-top" style={{ zIndex: 2000 }}>
      <div className="d-flex justify-content-between align-items-center">
        <form onSubmit={handleSearch} className="position-relative me-3" style={{ width: '50%' }}>
          <div className="input-group">
            <input
              type="search"
              className="form-control"
              placeholder="Search quizzes…"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) setSearchResults([]);
              }}
              aria-label="Search quizzes"
            />
            <button className="btn btn-outline-primary" type="submit">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div className="position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow overflow-auto" style={{ zIndex: 2001, maxHeight: '300px' }}>
              {searchResults.map(item => (
                <div
                  key={item.id}
                  className="search-result-item d-flex align-items-center gap-2 p-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => goToQuiz(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToQuiz(item.id); }}
                >
                  <img
                    src={`/avatars/avatar${item.creator_avatar || 1}.png`}
                    alt=""
                    style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div className="fw-medium">{item.name}</div>
                    <small className="text-muted">by {item.creator}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="d-flex align-items-center">
           <div className="dropdown me-3" ref={notificationDropdownRef}>
                <button
                  className="btn btn-light position-relative"
                  type="button"
                  onClick={toggleNotificationDropdown}
                  aria-label={`Notifications (${userData.notificationsEnabled ? notificationCount : 'Disabled'})`}
                  aria-expanded={isNotificationDropdownOpen}
                  disabled={!userData.notificationsEnabled && userData.username !== 'Loading...'}
                  title={!userData.notificationsEnabled ? "Notifications are disabled in Settings" : (notificationCount > 0 ? `${notificationCount} unread notifications` : "No new notifications")}
                >
                    <i className={`bi ${userData.notificationsEnabled ? 'bi-bell' : 'bi-bell-slash'} fs-5`}></i>
                    {userData.notificationsEnabled && notificationCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7em', padding: '0.3em 0.5em' }}>
                            {notificationCount > 9 ? '9+' : notificationCount}
                            <span className="visually-hidden">unread notifications</span>
                        </span>
                    )}
                </button>
                {isNotificationDropdownOpen && userData.notificationsEnabled && (
                     <div className="dropdown-menu dropdown-menu-end shadow border-1 p-2 show" style={{ width: '380px', maxHeight: '450px', overflowY: 'auto', position: 'absolute', right: 0, left: 'auto' }}>
                         <div className="d-flex justify-content-between align-items-center px-3 pt-2 pb-1 dropdown-header">
                             <h6 className="mb-0">Notifications</h6>
                             <div>
                                 <button className="btn btn-sm btn-link p-0 text-primary me-2" onClick={() => { fetchNotifications(); fetchNotificationCount();}} disabled={isLoadingNotifications || isClearingNotifications} title="Refresh notifications">
                                    <i className={`bi bi-arrow-clockwise ${isLoadingNotifications ? 'spinner-grow spinner-grow-sm' : ''}`}></i>
                                 </button>
                                 <button
                                    className="btn btn-sm btn-outline-danger p-0 px-2 py-1"
                                    onClick={handleClearAllNotifications}
                                    disabled={isLoadingNotifications || isClearingNotifications || notifications.length === 0}
                                    title="Clear all notifications"
                                    style={{fontSize: '0.75rem', lineHeight: '1'}}
                                >
                                    {isClearingNotifications ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : "Clear All"}
                                 </button>
                             </div>
                         </div>
                         {notificationError && <div className="alert alert-danger small p-2 mx-2 my-1">{notificationError}</div>}
                         {isLoadingNotifications ? (
                              <div className="text-center p-3">
                                 <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...
                              </div>
                         ) : notifications.length === 0 ? (
                             <p className="text-muted text-center p-3 mb-0">No new notifications.</p>
                         ) : (
                             notifications.map(notif => (
                                 <div key={notif.id} className={`list-group-item list-group-item-action border-0 rounded-2 p-2 mb-1 ${notif.is_read ? 'bg-light-subtle text-muted' : 'bg-white'}`}>
                                     <div className="d-flex w-100 justify-content-between align-items-start">
                                         <div className="d-flex align-items-center me-2" style={{ flexGrow: 1, minWidth: 0 }}>
                                            <img src={`/avatars/avatar${notif.sender_avatar || 1}.png`} alt="" width="35" height="35" className="rounded-circle me-2 flex-shrink-0"/>
                                            <small className="flex-grow-1 text-break" style={{fontSize: '0.9rem'}}>
                                                {notif.message}
                                            </small>
                                         </div>
                                         {!notif.is_read && (
                                             <button
                                                 className="btn btn-sm btn-link text-muted p-0 flex-shrink-0"
                                                 onClick={(e) => markNotificationAsRead(notif.id, e)}
                                                 title="Mark as read"
                                                 aria-label="Mark notification as read"
                                                 style={{lineHeight: 1}}
                                                 >
                                                 <i className="bi bi-check-lg"></i>
                                             </button>
                                         )}
                                     </div>
                                     {notif.notification_type === 'session_invite' && notif.session_code && !notif.is_read && (
                                         <div className="text-end mt-2">
                                             <button
                                                 className="btn btn-sm btn-success py-1 px-2"
                                                 onClick={(e) => handleNotificationJoin(notif.session_code, notif.id, e)}
                                                 >
                                                 <i className="bi bi-joystick me-1"></i> Join Session
                                             </button>
                                         </div>
                                     )}
                                      <small className="text-muted d-block mt-1" style={{fontSize: '0.75rem'}}>
                                          {new Date(notif.created_at).toLocaleString([], {dateStyle: 'short', timeStyle: 'short'})}
                                      </small>
                                 </div>
                             ))
                         )}
                     </div>
                 )}
            </div>

          <div className="dropdown">
            <button
              className="btn btn-link d-flex align-items-center p-0 text-decoration-none"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="User profile menu"
            >
              <img
                src={`/avatars/avatar${userData.avatar}.png`}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '40px', height: '40px', marginRight: '.5rem', border: '1px solid #ccc' }}
              />
              <span className="d-none d-md-inline text-primary fw-medium">{userData.username}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li>
                <button className="dropdown-item d-flex justify-content-between align-items-center" onClick={() => navigate('/profile')}>
                  Profile <i className="bi bi-person-circle"></i>
                </button>
              </li>
              <li>
                <button className="dropdown-item d-flex justify-content-between align-items-center" onClick={() => navigate('/settings')}>
                   Settings <i className="bi bi-gear-fill"></i>
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item text-danger d-flex justify-content-between align-items-center"
                  onClick={handleLogout}
                >
                  Logout <i className="bi bi-box-arrow-right"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
