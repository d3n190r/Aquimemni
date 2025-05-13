// src/frontend/src/components/Home components/Header.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userData, setUserData] = useState({ username: 'Loading...', avatar: 1 });

  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const notificationPollIntervalRef = useRef(null);
  const notificationDropdownRef = useRef(null); 
  const isMountedRef = useRef(true); 

  useEffect(() => {
    isMountedRef.current = true;
    fetch('/api/profile', { credentials: 'include' })
      .then(res => {
        if (!isMountedRef.current) return Promise.reject('Component unmounted');
        return res.ok ? res.json() : Promise.reject('Not logged in');
      })
      .then(data => {
        if (isMountedRef.current) setUserData({ username: data.username, avatar: data.avatar || 1 });
      })
      .catch((err) => {
         if (isMountedRef.current && err !== 'Component unmounted') console.error("Profile fetch error:", err);
      });
    return () => { isMountedRef.current = false; }; 
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    if (!isMountedRef.current || userData.username === 'Loading...') return;
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
  }, [userData.username]); 

  useEffect(() => {
    if (userData.username !== 'Loading...' && isMountedRef.current) {
      fetchNotificationCount(); 
      if (notificationPollIntervalRef.current) clearInterval(notificationPollIntervalRef.current); 
      notificationPollIntervalRef.current = setInterval(fetchNotificationCount, 30000); 
    }
    return () => { 
      if (notificationPollIntervalRef.current) {
        clearInterval(notificationPollIntervalRef.current);
        notificationPollIntervalRef.current = null;
      }
    };
  }, [fetchNotificationCount, userData.username]); 

  const fetchNotifications = async () => {
    if (!isMountedRef.current) return;
    setIsLoadingNotifications(true);
    try {
      const res = await fetch('/api/notifications?limit=10', { credentials: 'include' });
      if (!isMountedRef.current) return;
      if (res.ok) {
        const data = await res.json();
        if (isMountedRef.current) setNotifications(data);
      } else {
        if (isMountedRef.current) setNotifications([]);
        console.error("Failed to fetch notifications:", res.status);
      }
    } catch (err) {
      if (isMountedRef.current) setNotifications([]);
      console.error("Network error fetching notifications:", err);
    } finally {
      if (isMountedRef.current) setIsLoadingNotifications(false);
    }
  };

  const markAllNotificationsAsReadOnBackend = async () => {
    if (!isMountedRef.current) return;
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

  const toggleNotificationDropdown = async () => {
    if (!isMountedRef.current) return;
    const willOpen = !isNotificationDropdownOpen;
    setIsNotificationDropdownOpen(willOpen);
    
    if (willOpen) {
      fetchNotifications(); 
      if (notificationCount > 0) { 
        setNotificationCount(0); 
        await markAllNotificationsAsReadOnBackend(); 
      }
    }
  };

  const markNotificationAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation(); 
    if (!isMountedRef.current) return;
    
    const notificationWasUnread = notifications.find(n => n.id === notificationId && !n.is_read);
    setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, is_read: true} : n));
    
    if (notificationWasUnread) { 
        setNotificationCount(prev => Math.max(0, prev -1));
    }

    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!isMountedRef.current) return;
      if (res.ok) {
         await fetchNotificationCount(); 
      } else {
        console.error("Failed to mark notification as read on backend:", res.status);
        await fetchNotificationCount(); 
      }
    } catch (err) {
      if (isMountedRef.current) console.error("Network error marking notification as read:", err);
      await fetchNotificationCount(); 
    }
  };

  const handleNotificationJoin = async (sessionCode, notificationId, e) => {
      if (e) e.stopPropagation();
      if (!isMountedRef.current) return;
      
      await markNotificationAsRead(notificationId, e); 
      
      if (isMountedRef.current) {
        setIsNotificationDropdownOpen(false); 
        navigate(`/session/${sessionCode}`); 
      }
  };

  useEffect(() => {
      const handleClickOutside = (event) => {
          if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
              if (isMountedRef.current) setIsNotificationDropdownOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []); 

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
            setUserData({ username: 'Loading...', avatar: 1 }); 
            setNotificationCount(0); 
            setNotifications([]); 
            if (onLogout) onLogout(); 
            navigate('/login'); 
        }
    }
  };

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
                  aria-label={`Notifications (${notificationCount} unread)`}
                  aria-expanded={isNotificationDropdownOpen}
                >
                    <i className="bi bi-bell fs-5"></i>
                    {notificationCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7em', padding: '0.3em 0.5em' }}>
                            {notificationCount > 9 ? '9+' : notificationCount}
                            <span className="visually-hidden">unread notifications</span>
                        </span>
                    )}
                </button>
                {isNotificationDropdownOpen && (
                     <div className="dropdown-menu dropdown-menu-end shadow border-1 p-2 show" style={{ width: '380px', maxHeight: '450px', overflowY: 'auto', position: 'absolute', right: 0, left: 'auto' }}>
                         <h6 className="dropdown-header px-3 pt-2 pb-1 d-flex justify-content-between align-items-center">
                             <span>Notifications</span>
                             <button className="btn btn-sm btn-link p-0 text-primary" onClick={() => { fetchNotifications(); fetchNotificationCount();}} disabled={isLoadingNotifications} title="Refresh notifications">
                                <i className={`bi bi-arrow-clockwise ${isLoadingNotifications ? 'spinner-grow spinner-grow-sm' : ''}`}></i>
                             </button>
                         </h6>
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
              <span className="d-none d-md-inline text-dark fw-medium">{userData.username}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li><button className="dropdown-item" onClick={() => navigate('/profile')}>Profile</button></li>
              <li><button className="dropdown-item" onClick={() => navigate('/settings')}>Settings</button></li>
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